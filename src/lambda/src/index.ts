#!/usr/bin/env node

import http from 'http';
import { readFileSync } from 'fs';
import { Lexer } from 'santa-lang/lexer';
import { Parser } from 'santa-lang/parser';
import { O, evaluate } from 'santa-lang/evaluator';
import { encode, decode } from './encode';

// Reference: https://github.com/lambci/node-custom-lambda/blob/master/v12.x/bootstrap.js

const RUNTIME_PATH = '/2018-06-01/runtime';

const {
  AWS_LAMBDA_FUNCTION_NAME,
  AWS_LAMBDA_FUNCTION_VERSION,
  AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
  AWS_LAMBDA_LOG_GROUP_NAME,
  AWS_LAMBDA_LOG_STREAM_NAME,
  LAMBDA_TASK_ROOT,
  _HANDLER,
  AWS_LAMBDA_RUNTIME_API,
} = process.env;

const [HOST, PORT] = AWS_LAMBDA_RUNTIME_API.split(':');

start();

async function start() {
  let handler;
  try {
    handler = getHandler();
  } catch (e) {
    await initError(e);
    return process.exit(1);
  }

  while (true) {
    const { event, context } = await nextInvocation();

    try {
      const result = await handler(event, context);
      await invokeResponse(result, context);
    } catch (e) {
      await invokeError(e, context);
    }
  }
}

async function nextInvocation() {
  const res = await request({ path: `${RUNTIME_PATH}/invocation/next` });

  if (res.statusCode !== 200) {
    throw new Error(`Unexpected /invocation/next response: ${JSON.stringify(res)}`);
  }

  if (res.headers['lambda-runtime-trace-id']) {
    process.env._X_AMZN_TRACE_ID = res.headers['lambda-runtime-trace-id'];
  } else {
    delete process.env._X_AMZN_TRACE_ID;
  }

  let context = {
    awsRequestId: res.headers['lambda-runtime-aws-request-id'],
    invokedFunctionArn: res.headers['lambda-runtime-invoked-function-arn'],
    logGroupName: AWS_LAMBDA_LOG_GROUP_NAME,
    logStreamName: AWS_LAMBDA_LOG_STREAM_NAME,
    functionName: AWS_LAMBDA_FUNCTION_NAME,
    functionVersion: AWS_LAMBDA_FUNCTION_VERSION,
    memoryLimitInMB: AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
  };

  if (res.headers['lambda-runtime-client-context']) {
    context.clientContext = JSON.parse(res.headers['lambda-runtime-client-context']);
  }

  if (res.headers['lambda-runtime-cognito-identity']) {
    context.identity = JSON.parse(res.headers['lambda-runtime-cognito-identity']);
  }

  const event = JSON.parse(res.body);

  return { event, context };
}

async function invokeResponse(result, context) {
  const res = await request({
    method: 'POST',
    path: `${RUNTIME_PATH}/invocation/${context.awsRequestId}/response`,
    body: JSON.stringify(result === undefined ? null : result),
  });
  if (res.statusCode !== 202) {
    throw new Error(`Unexpected /invocation/response response: ${JSON.stringify(res)}`);
  }
}

function initError(err) {
  return postError(`${RUNTIME_PATH}/init/error`, err);
}

function invokeError(err, context) {
  return postError(`${RUNTIME_PATH}/invocation/${context.awsRequestId}/error`, err);
}

async function postError(path, err) {
  const lambdaErr = toLambdaErr(err);
  const res = await request({
    method: 'POST',
    path,
    headers: {
      'Content-Type': 'application/json',
      'Lambda-Runtime-Function-Error-Type': lambdaErr.errorType,
    },
    body: JSON.stringify(lambdaErr),
  });
  if (res.statusCode !== 202) {
    throw new Error(`Unexpected ${path} response: ${JSON.stringify(res)}`);
  }
}

const io = {
  input: path => readFileSync(path, { encoding: 'utf8' }),
  output: args => console.log(...args),
};

function initHandler(scriptPath, sectionName) {
  const source = readFileSync(scriptPath, { encoding: 'utf8' });
  const lexer = new Lexer(source);
  const ast = new Parser(lexer).parse();

  const environment = new O.Environment();
  environment.setIO(io);

  const result = evaluate(ast, environment);
  if (result instanceof O.Err) {
    throw result;
  }

  return environment.getSection(sectionName)[0].section;
}

function getHandler() {
  const [scriptPath, sectionName] = _HANDLER.split('.');

  const handler = initHandler(LAMBDA_TASK_ROOT + '/' + scriptPath + '.santa', sectionName);

  return (event, context) =>
    new Promise((resolve, reject) => {
      try {
        const environment = new O.Environment();
        environment.setIO(io);
        environment.declareVariable('event', encode(event));
        environment.declareVariable('context', encode(context));

        const result = evaluate(handler, environment);
        if (result instanceof O.Err) {
          throw result;
        }

        resolve(decode(result));
      } catch (e) {
        return reject(e);
      }
    });
}

function request(options) {
  options.host = HOST;
  options.port = PORT;

  return new Promise((resolve, reject) => {
    let req = http.request(options, res => {
      let bufs = [];
      res.on('data', data => bufs.push(data));
      res.on('end', () =>
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(bufs).toString(),
        })
      );
      res.on('error', reject);
    });
    req.on('error', reject);
    req.end(options.body);
  });
}

function toLambdaErr(err) {
  const { name, message, stack } = err;
  return {
    errorType: name || typeof err,
    errorMessage: message || '' + err,
    stackTrace: (stack || '').split('\n').slice(1),
  };
}

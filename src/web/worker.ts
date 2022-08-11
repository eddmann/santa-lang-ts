/* @ts-ignore */
import { run, runTests } from 'santa-lang/runner';

const io = {
  input: (path: string): string => {
    const request = new XMLHttpRequest();
    request.open(
      'GET',
      `https://raw.githubusercontent.com/eddmann/advent-of-code/master/2018/santa-lang/${path}`,
      false
    );
    request.send(null);
    return request.responseText;
  },
  output: (args: string[]) => console.log(...args),
};

type RequestType = 'run' | 'test' | 'tokenize' | 'parse';

type Request = {
  type: RequestType;
  source: string;
};

type Response =
  | { type: 'run'; result: {} }
  | { type: 'test'; testCases: [] }
  | { type: 'tokenize'; tokens: [] }
  | { type: 'parse'; ast: {} }
  | { type: RequestType; source: string; error: {} };

addEventListener('message', event => {
  const request = event.data as Request;

  try {
    switch (request.type) {
      case 'run':
        postMessage({ type: 'run', result: run(event.data.source, io) });
        return;
      case 'test':
        postMessage({ type: 'test', testCases: runTests(event.data.source, io) });
        return;
      case 'tokenize':
        postMessage({ type: 'tokenize', tokens: [] });
        return;
      case 'parse':
        postMessage({ type: 'parse', ast: {} });
        return;
    }
  } catch (error) {
    postMessage({ type: request.type, source: request.source, error });
  }
});

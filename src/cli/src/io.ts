import { readFileSync, writeFileSync } from 'fs';
import fetch from 'node-fetch';
import { loopWhile } from 'deasync';

const parseUrl = (path: string): URL | null => {
  try {
    return new URL(path);
  } catch (err) {
    return null;
  }
};

const readAoC = (url: URL, path: string): string => {
  const token = process.env.SANTA_CLI_SESSION_TOKEN;

  if (!token) {
    throw new Error(
      `Unable to read AOC input: ${path}, missing session token within SANTA_CLI_SESSION_TOKEN environment variable`
    );
  }

  const year = url.host;
  const day = url.pathname.substring(1);
  const filename = `aoc${year}_day${day.padStart(2, '0')}.input`;

  try {
    return readFileSync(filename, { encoding: 'utf-8' });
  } catch (err) {}

  let content: string | undefined, error: string | undefined;

  fetch(`https://adventofcode.com/${year}/day/${day}/input`, {
    method: 'GET',
    headers: {
      Accepts: 'text/plain',
      Cookie: `session=${token}`,
    },
  }).then(response => {
    if (response.status !== 200) {
      error = `Unable to read AOC input: ${path}, response: ${response.statusText}`;
      return;
    }

    return response.text().then(body => {
      content = body.trim();
    });
  });

  loopWhile(() => !content && !error);

  if (error) {
    throw new Error(error);
  }

  writeFileSync(filename, content);

  return content;
};

const readUrl = (path: string): string => {
  let content: string | undefined, error: string | undefined;

  fetch(path, {
    method: 'GET',
    headers: {
      Accepts: 'text/plain',
    },
  }).then(response => {
    if (response.status !== 200) {
      error = `Unable to read HTTP input: ${path}, response: ${response.statusText}`;
      return;
    }

    return response.text().then(body => {
      content = body;
    });
  });

  loopWhile(() => !content && !error);

  if (error) {
    throw new Error(error);
  }

  return content;
};

export default {
  input: (path: string): string => {
    const url = parseUrl(path);

    if (!url) {
      try {
        return readFileSync(path, { encoding: 'utf-8' });
      } catch (err) {
        throw new Error(`Unable to read path: ${path}`);
      }
    }

    if (url.protocol === 'aoc:') {
      return readAoC(url, path);
    }

    return readUrl(path);
  },
  output: (args: string[]) => console.log(...args),
};

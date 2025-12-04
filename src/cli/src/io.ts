import { readFileSync, writeFileSync } from 'fs';

const parseUrl = (path: string): URL | null => {
  try {
    return new URL(path);
  } catch (err) {
    return null;
  }
};

const readAoC = (url: URL, path: string): string => {
  const year = url.host;
  const day = url.pathname.substring(1);
  const filename = `aoc${year}_day${day.padStart(2, '0')}.input`;

  try {
    return readFileSync(filename, { encoding: 'utf-8' });
  } catch (err) {}

  const token = process.env.SANTA_CLI_SESSION_TOKEN;

  if (!token) {
    throw new Error(
      `Unable to read AOC input: ${path}, missing session token within SANTA_CLI_SESSION_TOKEN environment variable`
    );
  }

  const result = Bun.spawnSync([
    'curl',
    '-sfL',
    '-H',
    `Cookie: session=${token}`,
    `https://adventofcode.com/${year}/day/${day}/input`,
  ]);

  if (result.exitCode !== 0) {
    throw new Error(`Unable to read AOC input: ${path}`);
  }

  const content = new TextDecoder().decode(result.stdout).trimEnd();
  writeFileSync(filename, content);
  return content;
};

const readUrl = (path: string): string => {
  const result = Bun.spawnSync(['curl', '-sfL', path]);
  if (result.exitCode !== 0) {
    throw new Error(`Unable to read HTTP input: ${path}`);
  }
  return new TextDecoder().decode(result.stdout);
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

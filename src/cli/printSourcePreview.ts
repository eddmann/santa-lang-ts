export default (filename: string, source: string, line: number, column: number): void => {
  console.log('\x1b[32m%s\x1b[0m', `${filename}:${line + 1}:${column + 1}`);
  console.log();
  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (i < line - 2 || i > line + 2) continue;
    const lineNo = `${i + 1}`.padStart(2, ' ') + ': ';

    if (i === line) {
      console.log('  \x1b[37m%s\x1b[0m', `${lineNo}${lines[i]}`);
      console.log('  \x1b[31m%s\x1b[0m', ' '.repeat(column + lineNo.length) + '^~~');
    } else {
      console.log('  \x1b[2m%s\x1b[0m', `${lineNo}${lines[i]}`);
    }
  }
  console.log();
};

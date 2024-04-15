import readline from 'node:readline';

readline.Interface.prototype._insertString = function(c) {
  if (this.cursor < this.line.length) {
    var beg = this.line.slice(0, this.cursor);
    var end = this.line.slice(this.cursor, this.line.length);
    this.line = beg + c + end;
    this.cursor += c.length;
    this._refreshLine();
  } else {
    this.line += c;
    this.cursor += c.length;
    this.output.write(c);
    this._moveCursor(0);
  }
};

const { columns } = process.stdout;

export function createLog() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return {
    log: (text, options = {}) => {
      if (options.displace) {
        readline.moveCursor(process.stdout, 0, -1);
        readline.clearLine(process.stdout, -1);
      }
      if (columns < text.length) {
        rl.write(text +'\n');
        return;
      }
      rl.write(text + new Array(columns - text.length).fill(' ').join('') + '\n');
    },
    success: (text, options = {}) => {
      if (options.displace) {
        readline.moveCursor(process.stdout, 0, -1);
        readline.clearLine(process.stdout, -1);
      }
      if (columns < text.length) {
        rl.write(text +'\n');
        return;
      }
      rl.write('\x1b[32m');
      rl.write(text + new Array(columns - text.length).fill(' ').join('') + '\n');
      rl.write('\x1b[0m');
    },
    error: (text, options = {}) => {
      if (options.displace) {
        readline.moveCursor(process.stdout, 0, -1);
        readline.clearLine(process.stdout, -1);
      }
      if (columns < text.length) {
        rl.write(text +'\n');
        return;
      }
      rl.write('\x1b[31m');
      rl.write(text + new Array(columns - text.length).fill(' ').join('') + '\n');
      rl.write('\x1b[0m');
    },
    close: () => rl.close(),
  };
}
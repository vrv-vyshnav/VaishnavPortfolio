import { Command } from '../core/Command.js';

export class TailCommand extends Command {
  constructor() {
    super('tail', 'Show last lines of file');
  }

  execute(params, context) {
    if (params.length === 0) {
      context.output.write(`<span class="error">tail: missing file operand</span>`);
      return;
    }

    const fileName = params[0];
    const currentDir = context.fileSystem.getCurrentDirectory();

    if (currentDir.contents[fileName] && currentDir.contents[fileName].type === 'file') {
      const content = currentDir.contents[fileName].content;
      const lines = content.split('\n').slice(-10);
      context.output.write(`<span class="file">${lines.join('\n')}</span>`);
    } else {
      context.output.write(`<span class="error">tail: ${fileName}: No such file</span>`);
    }
  }
}

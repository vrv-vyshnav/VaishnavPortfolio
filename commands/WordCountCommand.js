import { Command } from '../core/Command.js';

export class WordCountCommand extends Command {
  constructor() {
    super('wc', 'Count lines, words, characters');
  }

  execute(params, context) {
    if (params.length === 0) {
      context.output.write(`<span class="error">wc: missing file operand</span>`);
      return;
    }

    const fileName = params[0];
    const currentDir = context.fileSystem.getCurrentDirectory();

    if (currentDir.contents[fileName] && currentDir.contents[fileName].type === 'file') {
      const content = currentDir.contents[fileName].content;
      const lines = content.split('\n').length;
      const words = content.split(/\s+/).filter(w => w.length > 0).length;
      const chars = content.length;

      context.output.write(`<span class="info">  ${lines}  ${words}  ${chars} ${fileName}</span>`);
    } else {
      context.output.write(`<span class="error">wc: ${fileName}: No such file</span>`);
    }
  }
}

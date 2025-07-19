import { Command } from '../core/Command.js';

export class CatCommand extends Command {
  constructor() {
    super('cat', 'Display file contents');
  }

  execute(params, context) {
    if (params.length === 0) {
      context.output.write(`<span class="error">cat: missing file operand</span>`);
      return;
    }

    const currentDir = context.fileSystem.getCurrentDirectory();
    const fileName = params[0];

    if (currentDir.contents[fileName] && currentDir.contents[fileName].type === 'file') {
      const content = currentDir.contents[fileName].content;
      context.output.write(`<span class="file">${content}</span>`);
    } else {
      context.output.write(`<span class="error">cat: ${fileName}: No such file</span>`);
    }
  }
}

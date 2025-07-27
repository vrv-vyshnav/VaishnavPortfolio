import { Command } from '../core/Command.js';

export class HeadCommand extends Command {
  constructor() {
    super('head', 'Show first lines of file');
  }

  execute(params, context) {
    if (params.length === 0) {
      context.output.write(`<span class="error">head: missing file operand</span>`);
      return;
    }

    const fileName = params[0];
    const currentDir = context.fileSystem.getCurrentDirectory();

    if (currentDir.contents[fileName] && currentDir.contents[fileName].type === 'file') {

      if (currentDir.contents[fileName].renderType == "html") {
        context.output.write(`<span class="error">head is only availabe for README.md files</span>`);
        return;
      }
      const content = currentDir.contents[fileName].content;
      const lines = content.split('\n').slice(0, 10);
      context.output.write(`<span class="file">${lines.join('\n')}</span>`);
    } else {
      context.output.write(`<span class="error">head: ${fileName}: No such file</span>`);
    }
  }
}

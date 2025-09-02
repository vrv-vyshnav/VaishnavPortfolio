import { Command } from '../core/Command.js';

export class GrepCommand extends Command {
  constructor() {
    super('grep', 'Search text in files', { category: 'Text Processing' });
  }

  execute(params, context) {
    if (params.length < 2) {
      context.output.write(`<span class="error">grep: usage: grep pattern file</span>`);
      return;
    }

    const pattern = params[0];
    const fileName = params[1];
    const currentDir = context.fileSystem.getCurrentDirectory();

    if (currentDir.contents[fileName] && currentDir.contents[fileName].type === 'file') {

      if (currentDir.contents[fileName].renderType == "html") {
        context.output.write(`<span class="error">grep is only availabe for README.md files</span>`);
        return;
      }

      const content = currentDir.contents[fileName].content;
      const lines = content.split('\n');
      const matches = lines.filter(line => 
        line.toLowerCase().includes(pattern.toLowerCase())
      );

      if (matches.length === 0) {
        context.output.write(`<span class="warning">No matches found for '${pattern}'</span>`);
      } else {
        matches.forEach(match => {
          const highlighted = match.replace(
            new RegExp(`(${pattern})`, 'gi'),
            `<span class="warning">$1</span>`
          );
          context.output.write(`<span class="info">${highlighted}</span>`);
        });
      }
    } else {
      context.output.write(`<span class="error">grep: ${fileName}: No such file</span>`);
    }
  }
}

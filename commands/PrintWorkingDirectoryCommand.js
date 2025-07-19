import { Command } from '../core/Command.js';

export class PrintWorkingDirectoryCommand extends Command {
  constructor() {
    super('pwd', 'Print working directory');
  }

  execute(params, context) {
    context.output.write(`<span class="info">${context.fileSystem.currentPath}</span>`);
  }
}

import { Command } from '../core/Command.js';

export class ChangeDirectoryCommand extends Command {
  constructor() {
    super('cd', 'Change directory');
  }

  execute(params, context) {
    if (params.length === 0) {
      // Go to portfolio directory instead of empty home directory
      context.fileSystem.currentPath = `/home/${context.fileSystem.userName}/portfolio`;
      return;
    }

    const success = context.fileSystem.changeDirectory(params[0]);
    if (!success) {
      context.output.write(`<span class="error">cd: ${params[0]}: No such directory</span>`);
    }
  }
}

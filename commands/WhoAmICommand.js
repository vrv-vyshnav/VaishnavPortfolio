import { Command } from '../core/Command.js';

export class WhoAmICommand extends Command {
  constructor() {
    super('whoami', 'Display current user');
  }

  execute(params, context) {
    context.output.write(`<span class="success">${context.fileSystem.userName}</span>`);
  }
}

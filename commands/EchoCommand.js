import { Command } from '../core/Command.js';

export class EchoCommand extends Command {
  constructor() {
    super('echo', 'Display text');
  }

  execute(params, context) {
    const text = params.join(' ');
    context.output.write(`<span class="info">${text}</span>`);
  }
}

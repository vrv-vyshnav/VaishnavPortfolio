import { Command } from '../core/Command.js';

export class EchoCommand extends Command {
  constructor() {
    super('echo', 'Display text', { category: 'Text Processing' });
  }

  execute(params, context) {
    const text = params.join(' ');
    context.output.write(`<span class="info">${text}</span>`);
  }
}

import { Command } from '../core/Command.js';

export class DateCommand extends Command {
  constructor() {
    super('date', 'Show current date and time');
  }

  execute(params, context) {
    const now = new Date();
    context.output.write(`<span class="success">${now.toString()}</span>`);
  }
}

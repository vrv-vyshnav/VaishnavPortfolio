import { Command } from '../core/Command.js';

export class HistoryCommand extends Command {
  constructor() {
    super('history', 'Show command history');
  }

  execute(params, context) {
    const history = context.history.getAll();
    if (history.length === 0) {
      context.output.write(`<span class="info">No commands in history</span>`);
      return;
    }

    history.forEach((cmd, index) => {
      context.output.write(`<span class="info">${index + 1}  ${cmd}</span>`);
    });
  }
}

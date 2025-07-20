import { Command } from '../core/Command.js';

export class ClearCommand extends Command {
  constructor() {
    super('clear', 'Clear terminal screen');
  }

  execute(params, context) {
    context.output.clear();
  }
}

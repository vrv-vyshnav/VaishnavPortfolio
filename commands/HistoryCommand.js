import { Command } from '../core/Command.js';

export class HistoryCommand extends Command {
  constructor() {
    super('history', 'Show command history');
  }

  execute(params, context) {
    // Check for flags
    if (params.includes('--clear') || params.includes('-c')) {
      context.history.clear();
      context.output.write(`<span class="success">Command history cleared</span>`);
      return;
    }

    if (params.includes('--size') || params.includes('-s')) {
      const size = context.history.size();
      context.output.write(`<span class="info">Command history size: ${size}</span>`);
      return;
    }

    // Show help if requested
    if (params.includes('--help') || params.includes('-h')) {
      this.showHelp(context.output);
      return;
    }

    // Default behavior: show history
    const history = context.history.getAll();
    if (history.length === 0) {
      context.output.write(`<span class="info">No commands in history</span>`);
      return;
    }

    history.forEach((cmd, index) => {
      context.output.write(`<span class="info">${index + 1}  ${cmd}</span>`);
    });
  }

  showHelp(output) {
    output.write(`<span class="info">Usage: history [options]</span>`);
    output.write(`<span class="info">Show command history</span>`);
    output.write(``);
    output.write(`<span class="help-table">`);
    output.write(`<span class="help-row"><span class="help-command-cell">--clear, -c</span><span class="help-desc-cell">Clear command history</span></span>`);
    output.write(`<span class="help-row"><span class="help-command-cell">--size, -s</span><span class="help-desc-cell">Show history size</span></span>`);
    output.write(`<span class="help-row"><span class="help-command-cell">--help, -h</span><span class="help-desc-cell">Show this help message</span></span>`);
    output.write(`</span>`);
  }
}

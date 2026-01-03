import { Command } from '../core/Command.js';
import { DemoModal } from '../utils/DemoModal.js';

export class DemoCommand extends Command {
  constructor() {
    super('demo', 'Interactive demo of terminal features', { category: 'Help' });
  }

  async execute(params, context) {
    const terminalManager = window.terminalManager;
    if (!terminalManager) {
      context.output.write('<span class="error">Terminal manager not available</span>');
      return;
    }

    try {
      const modal = new DemoModal(terminalManager);
      const result = await modal.show();

      // Execute help command after modal is fully closed
      const helpCommand = context.commandRegistry.get('help');
      if (helpCommand) {
        await helpCommand.execute([], context);
      }
    } catch (error) {
      console.error('Demo tour error:', error);
      context.output.write('<span class="error">Demo failed: ' + error.message + '</span>');
    }
  }

  getHelp() {
    return `
      <div class="help-section">
        <span class="command-name">demo</span> - Interactive demo of terminal features

        <div class="help-usage">
          Usage:
            demo                  Run interactive guided tour
        </div>

        <div class="help-description">
          The demo command provides an interactive tutorial showing:
          - UI features: Split screen, new tabs, and closing tabs
          - Command demonstrations: See common commands in action

          Navigate with Next/Skip buttons or press ESC to exit.
        </div>
      </div>
    `;
  }
}

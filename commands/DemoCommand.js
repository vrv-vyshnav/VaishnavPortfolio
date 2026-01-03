import { Command } from '../core/Command.js';
import { DemoManager } from '../utils/DemoManager.js';

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
      const result = await DemoManager.startDemo(terminalManager);

      if (result && result.forced) {
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const helpCommand = context.commandRegistry.get('help');
      if (helpCommand) {
        await helpCommand.execute([], context);
      }

      await new Promise(resolve => setTimeout(resolve, 50));

      if (context.output && context.output.addPrompt) {
        context.output.addPrompt();
        setTimeout(() => {
          if (context.output.scrollToBottom) {
            context.output.scrollToBottom();
          }
        }, 50);
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

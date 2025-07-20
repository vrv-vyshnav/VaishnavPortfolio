import { Command } from '../core/Command.js';

export class HelpCommand extends Command {
  constructor() {
    super('help', 'Show this help message');
  }

  execute(params, context) {
    const commands = context.commandRegistry.list();
    let output = `<span class="success">Available Commands:</span>\n\n`;
    output += '<div class="help-table">';

    commands.forEach(cmd => {
      output += `<div class="help-row">
        <div class="help-command-cell"><span class="help-command">${cmd.name}</span></div>
        <div class="help-desc-cell">${cmd.description}</div>
      </div>`;
    });

    output += '</div>';
    output += `\n<span class="info">Navigation Tips:</span>
    - Use 'ls' to see what's available
    - Use 'cd projects' to explore projects
    - Use 'cat about.txt' to learn more
    - Use Tab for auto-completion
    - Use Up/Down arrows for command history`;

    context.output.write(output);
  }
}

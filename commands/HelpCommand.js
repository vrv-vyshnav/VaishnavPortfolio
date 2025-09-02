import { Command } from '../core/Command.js';

export class HelpCommand extends Command {
  constructor() {
    super('help', 'Show this help message', { category: 'Help' });
  }

  execute(params, context) {
    const allCommands = context.commandRegistry.list();
    const visibleCommands = allCommands.filter(cmd => !cmd.hidden);
    
    // Sort commands alphabetically
    const sortedCommands = visibleCommands.sort((a, b) => a.name.localeCompare(b.name));
    
    let output = '<div class="claude-help">';
    output += '<div class="help-header">Available commands:</div>';
    output += '<div class="help-commands">';

    sortedCommands.forEach(cmd => {
      output += `<div class="help-item">
        <span class="cmd-name">${cmd.name}</span>
        <span class="cmd-desc">${cmd.description}</span>
      </div>`;
    });

    output += '</div>';
    
    output += `<div class="help-footer">
<div class="help-tips">Tips:</div>
• Use Tab for auto-completion
• Use ↑/↓ arrows for command history  
• Use 'ls' to see what's available
• Use 'cat about.txt' to learn more about me
• Use Ctrl+R for interactive history search</div>`;

    output += '</div>';
    context.output.write(output);
  }
}

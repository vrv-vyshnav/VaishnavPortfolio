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
<div class="help-section">
  <div class="help-tips">📋 Available Content Files:</div>
  • about.txt - Personal information and background
  • contact.info - Professional contact information
  • skills.conf - Technical skills and proficiency levels
  • experience.txt - Work experience and achievements
  • education.txt - Educational background
</div>

<div class="help-section">
  <div class="help-tips">⌨️ Keyboard Shortcuts:</div>
  • Tab - Auto-complete or accept suggestion
  • ↑/↓ - Navigate command history
  • Ctrl+↑/↓ - Navigate smart suggestions
  • Escape - Clear suggestions
  • Ctrl+C - Cancel current input
</div>

<div class="help-section">
  <div class="help-tips">💡 Pro Tips:</div>
  • Use 'ls' to explore available files and directories
  • Use 'cat <filename>' to view file contents
  • Use 'find <pattern>' to search for files
  • Use 'grep <pattern> <file>' to search within files
  • Use 'vim <file>' to edit files in vim mode
  • Try 'tree' for a visual directory structure
  • Smart suggestions help you discover commands
  • Chain commands with '&' (e.g., 'ls & pwd & date')
</div>
`;

    output += '</div>';
    context.output.write(output);
  }
}

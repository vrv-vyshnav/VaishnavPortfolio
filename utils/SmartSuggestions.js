export class SmartSuggestions {
  constructor(commandRegistry, fileSystem) {
    this.commandRegistry = commandRegistry;
    this.fileSystem = fileSystem;
    
    // Command patterns that expect file arguments
    this.fileCommands = new Set(['cat', 'head', 'tail', 'wc', 'grep', 'rm', 'vim', 'vi']);
    
    // Command patterns that expect directory arguments
    this.dirCommands = new Set(['cd', 'find', 'tree']);
    
    // Commands that don't need arguments
    this.standaloneCommands = new Set(['help', 'clear', 'pwd', 'whoami', 'date', 'ls', 'exit']);
    
    // Common command patterns
    this.commonPatterns = [
      'ls -la',
      'cat about.txt',
      'cat skills.conf',
      'cat experience.txt',
      'cd projects',
      'find .',
      'tree',
      'help'
    ];
  }

  getSuggestions(input) {
    if (!input || input.length === 0) {
      return this.getDefaultSuggestions();
    }

    const suggestions = [];
    const inputLower = input.toLowerCase();
    const parts = input.trim().split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    // If user is still typing the command
    if (parts.length === 1) {
      suggestions.push(...this.getCommandSuggestions(inputLower));
      suggestions.push(...this.getPatternSuggestions(inputLower));
    } 
    // If user has typed a command and is working on arguments
    else {
      suggestions.push(...this.getArgumentSuggestions(command, args, input));
    }

    // History functionality removed

    // Remove duplicates and limit results
    const uniqueSuggestions = this.removeDuplicates(suggestions);
    return this.rankSuggestions(uniqueSuggestions, input).slice(0, 8);
  }

  getDefaultSuggestions() {
    return [
      { text: 'help', type: 'command' },
      { text: 'ls', type: 'command' },
      { text: 'cat about.txt', type: 'pattern' },
      { text: 'cat skills.conf', type: 'pattern' },
      { text: 'tree', type: 'command' }
    ];
  }

  getCommandSuggestions(inputLower) {
    const commands = this.commandRegistry.list();
    return commands
      .filter(cmd => cmd.name.toLowerCase().startsWith(inputLower) && !cmd.hidden)
      .map(cmd => ({
        text: cmd.name,
        type: 'command',
        priority: this.getCommandPriority(cmd.name)
      }));
  }

  getPatternSuggestions(inputLower) {
    return this.commonPatterns
      .filter(pattern => pattern.toLowerCase().startsWith(inputLower))
      .map(pattern => ({
        text: pattern,
        type: 'pattern',
        priority: 5
      }));
  }

  getArgumentSuggestions(command, args, fullInput) {
    const suggestions = [];
    const commandLower = command.toLowerCase();

    // File-based command suggestions
    if (this.fileCommands.has(commandLower)) {
      suggestions.push(...this.getFileSuggestions(args, fullInput));
    }

    // Directory-based command suggestions
    if (this.dirCommands.has(commandLower)) {
      suggestions.push(...this.getDirectorySuggestions(args, fullInput));
    }

    // Special command-specific logic
    switch (commandLower) {
      case 'grep':
        if (args.length === 1) {
          suggestions.push(...this.getFileSuggestions(args.slice(1), fullInput));
        }
        break;
      case 'find':
        if (args.length === 0) {
          suggestions.push({ text: `${command} .`, type: 'completion', description: 'Search current directory' });
        }
        break;
      case 'cd':
        suggestions.push({ text: `${command} ..`, type: 'completion', description: 'Go to parent directory' });
        break;
    }

    return suggestions;
  }

  getFileSuggestions(args, fullInput) {
    const currentDir = this.fileSystem.getCurrentDirectory();
    const files = this.fileSystem.list();
    const lastArg = args.length > 0 ? args[args.length - 1] : '';
    
    return Object.keys(files)
      .filter(name => {
        const item = files[name];
        return item.type === 'file' && name.toLowerCase().startsWith(lastArg.toLowerCase());
      })
      .map(fileName => {
        const baseParts = fullInput.trim().split(' ');
        baseParts[baseParts.length - 1] = fileName;
        return {
          text: baseParts.join(' '),
          type: 'completion',
          description: `File in ${currentDir}`,
          priority: 3
        };
      });
  }

  getDirectorySuggestions(args, fullInput) {
    const currentDir = this.fileSystem.getCurrentDirectory();
    const files = this.fileSystem.list();
    const lastArg = args.length > 0 ? args[args.length - 1] : '';
    
    return Object.keys(files)
      .filter(name => {
        const item = files[name];
        return item.type === 'directory' && name.toLowerCase().startsWith(lastArg.toLowerCase());
      })
      .map(dirName => {
        const baseParts = fullInput.trim().split(' ');
        baseParts[baseParts.length - 1] = dirName;
        return {
          text: baseParts.join(' '),
          type: 'completion',
          description: `Directory in ${currentDir}`,
          priority: 3
        };
      });
  }

  // History suggestions removed

  getCommandPriority(commandName) {
    // Prioritize commonly used commands
    const highPriority = ['help', 'ls', 'cat', 'cd', 'pwd'];
    const mediumPriority = ['clear', 'tree', 'find', 'grep'];
    
    if (highPriority.includes(commandName)) return 10;
    if (mediumPriority.includes(commandName)) return 7;
    return 5;
  }

  // Pattern description method removed - no longer displaying descriptions

  removeDuplicates(suggestions) {
    const seen = new Set();
    return suggestions.filter(suggestion => {
      const key = suggestion.text.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  rankSuggestions(suggestions, input) {
    return suggestions.sort((a, b) => {
      // First, sort by priority
      const priorityDiff = (b.priority || 0) - (a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;

      // Then by exact match
      const aExact = a.text.toLowerCase().startsWith(input.toLowerCase()) ? 1 : 0;
      const bExact = b.text.toLowerCase().startsWith(input.toLowerCase()) ? 1 : 0;
      const exactDiff = bExact - aExact;
      if (exactDiff !== 0) return exactDiff;

      // Then by type preference (commands > patterns > completions)
      const typeOrder = { 'command': 4, 'pattern': 3, 'completion': 2 };
      const typeDiff = (typeOrder[b.type] || 0) - (typeOrder[a.type] || 0);
      if (typeDiff !== 0) return typeDiff;

      // Finally by alphabetical order
      return a.text.localeCompare(b.text);
    });
  }

  // History learning functionality removed
}
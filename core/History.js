export class HistoryService {
  constructor() {
    this.storageKey = 'terminal_command_history';
    this.maxHistorySize = 100;  // Limit history to 100 commands
    this.commands = this.loadFromStorage();  // Load history from localStorage
    this.currentIndex = this.commands.length;  // Set index to the end
  }

  // Load command history from localStorage
  loadFromStorage() {
    try {
      const history = localStorage.getItem(this.storageKey);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.warn('Failed to load command history from localStorage:', error);
      return [];
    }
  }

  // Save command history to localStorage
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.commands));
    } catch (error) {
      console.warn('Failed to save command history to localStorage:', error);
    }
  }

  // Adds a new command to the history
  add(command) {
    // If the command is not empty and not a duplicate of the last command
    if (command.trim() && 
        (this.commands.length === 0 || this.commands[this.commands.length - 1] !== command)) {
      
      this.commands.push(command);
      
      // Limit history size
      if (this.commands.length > this.maxHistorySize) {
        this.commands.shift();  // Remove oldest command
      }
      
      this.currentIndex = this.commands.length;  // Reset index to the end
      this.saveToStorage();  // Persist to localStorage
    }
  }

  // Returns the previous command from the history
  getPrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.commands[this.currentIndex];
    }
    return null;  // No previous command
  }

  // Returns the next command from the history
  getNext() {
    if (this.currentIndex < this.commands.length - 1) {
      this.currentIndex++;
      return this.commands[this.currentIndex];
    } else {
      this.currentIndex = this.commands.length;  // Reset to the latest command
      return '';
    }
  }

  // Returns all commands in the history
  getAll() {
    return [...this.commands];  // Return a copy of the commands array
  }

  // Clear command history
  clear() {
    this.commands = [];
    this.currentIndex = 0;
    this.saveToStorage();
  }

  // Get history size
  size() {
    return this.commands.length;
  }

  // Search command history (for Ctrl+R functionality)
  search(term) {
    if (!term) return [];
    const searchTerm = term.toLowerCase();
    return this.commands
      .map((cmd, index) => ({ cmd, index }))
      .filter(item => item.cmd.toLowerCase().includes(searchTerm))
      .reverse(); // Most recent first
  }

  // Get command by index
  getByIndex(index) {
    return this.commands[index] || null;
  }
}

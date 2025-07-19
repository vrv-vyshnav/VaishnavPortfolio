export class HistoryService {
  constructor() {
    this.commands = [];  // Stores all commands entered
    this.currentIndex = -1;  // Keeps track of the current index in the history
  }

  // Adds a new command to the history
  add(command) {
    // If the command is not empty, add it to the history
    if (command.trim()) {
      this.commands.push(command);
      this.currentIndex = this.commands.length;  // Reset index to the end
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
}

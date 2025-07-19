export class CommandRegistry {
  constructor() {
    // Holds all registered commands
    this.commands = new Map();
  }

  // Register a new command by adding it to the map
  register(command) {
    if (this.commands.has(command.name)) {
      console.warn(`Command '${command.name}' is already registered.`);
    } else {
      this.commands.set(command.name, command);
    }
  }

  // Get a command by its name
  get(name) {
    const command = this.commands.get(name);
    if (!command) {
      console.error(`Command '${name}' not found.`);
    }
    return command;
  }

  // Check if a command exists
  has(name) {
    return this.commands.has(name);
  }

  // List all registered commands
  list() {
    return Array.from(this.commands.values());
  }
}

export class Command {
  constructor(name, description) {
    this.name = name;        // The name of the command (e.g., 'ls', 'pwd', etc.)
    this.description = description;  // A brief description of what the command does
  }

  // The 'execute' method will be overridden by each specific command
  execute(params, context) {
    throw new Error('Execute method must be implemented');
  }
}

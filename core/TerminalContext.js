export class TerminalContext {
  constructor(fileSystem, output, history, commandRegistry) {
    this.fileSystem = fileSystem;        // The file system instance
    this.output = output;                // The output instance
    this.history = history;              // The history instance
    this.commandRegistry = commandRegistry; // The command registry instance
  }
}

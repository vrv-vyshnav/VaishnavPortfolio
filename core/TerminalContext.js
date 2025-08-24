export class TerminalContext {
  constructor(fileSystem, output, history, commandRegistry, terminalId = null) {
    this.fileSystem = fileSystem;        // The file system instance
    this.output = output;                // The output instance
    this.history = history;              // The history instance
    this.commandRegistry = commandRegistry; // The command registry instance
    this.terminalId = terminalId;        // The terminal ID (for multi-terminal support)
  }
}

import { typeWriter } from './typeWriter.js';

export class AutomatedDemo {
  constructor(terminalManager, context) {
    this.terminalManager = terminalManager;
    this.context = context;
    this.demoTerminalId = null;
    this.demoTerminal = null;
    this.isSkipped = false;
    this.skipHandler = null;
  }

  async run() {
    try {
      this.createDemoTerminal();
      this.setupSkipHandlers();
      await this.runCommandSequence();
      this.cleanup();

      return {
        skipped: this.isSkipped,
        completed: !this.isSkipped
      };
    } catch (error) {
      console.error('Automated demo error:', error);
      this.cleanup();
      return {
        skipped: true,
        completed: false
      };
    }
  }

  createDemoTerminal() {
    this.demoTerminalId = this.terminalManager.createTerminal(false);
    this.demoTerminal = this.terminalManager.terminals.get(this.demoTerminalId);

    if (!this.demoTerminal) {
      throw new Error('Failed to create demo terminal');
    }

    const contentElement = document.getElementById(`${this.demoTerminalId}-content`);
    if (contentElement) {
      const header = document.createElement('div');
      header.className = 'output';
      header.innerHTML = `
        <span class="info">╔════════════════════════════════════════════════════════╗</span><br>
        <span class="info">║     <span class="success">INTERACTIVE TERMINAL DEMO</span>                      ║</span><br>
        <span class="info">║     Watch these commands in action!                ║</span><br>
        <span class="info">║     Press ESC anytime to skip and take control     ║</span><br>
        <span class="info">╚════════════════════════════════════════════════════════╝</span><br>
      `;
      contentElement.appendChild(header);
    }
  }

  async runCommandSequence() {
    const commands = [
      {
        name: 'ls',
        explanation: 'The "ls" command lists all available files and folders in the current directory.',
        command: 'ls',
        pauseAfter: 2000
      },
      {
        name: 'pwd',
        explanation: 'The "pwd" command shows your current location in the file system.',
        command: 'pwd',
        pauseAfter: 1500
      },
      {
        name: 'cat',
        explanation: 'The "cat" command reads and displays the contents of a file.',
        command: 'cat about.txt',
        pauseAfter: 3000
      },
      {
        name: 'tree',
        explanation: 'The "tree" command visualizes the directory structure as a tree.',
        command: 'tree',
        pauseAfter: 2500
      },
      {
        name: 'help',
        explanation: 'The "help" command shows all available commands you can use.',
        command: 'help',
        pauseAfter: 2000
      }
    ];

    for (const cmdObj of commands) {
      if (this.isSkipped) break;
      await this.demonstrateCommand(cmdObj);
      if (this.isSkipped) break;
      await this.delay(cmdObj.pauseAfter);
    }

    if (!this.isSkipped) {
      this.writeCompletionMessage();
    }
  }

  async demonstrateCommand(cmdObj) {
    const contentElement = document.getElementById(`${this.demoTerminalId}-content`);
    if (!contentElement || this.isSkipped) return;

    const separator = document.createElement('div');
    separator.className = 'output';
    separator.innerHTML = '<span class="info">────────────────────────────────────────────────</span>';
    contentElement.appendChild(separator);

    await this.delay(300);
    if (this.isSkipped) return;

    const explanation = document.createElement('div');
    explanation.className = 'output';
    const explanationSpan = document.createElement('span');
    explanationSpan.className = 'warning';
    explanation.appendChild(explanationSpan);
    contentElement.appendChild(explanation);

    await this.typeWriterAsync(cmdObj.explanation, explanationSpan, 15);
    if (this.isSkipped) return;

    await this.delay(500);
    if (this.isSkipped) return;

    await this.typeCommand(cmdObj.command);
    if (this.isSkipped) return;

    await this.delay(500);
    if (this.isSkipped) return;

    await this.executeCommand(cmdObj.command);
  }

  async typeCommand(command) {
    const contentElement = document.getElementById(`${this.demoTerminalId}-content`);
    if (!contentElement || this.isSkipped) return;

    const promptText = this.demoTerminal.fileSystem.getPrompt();

    const commandLine = document.createElement('div');
    commandLine.className = 'demo-command-line';
    commandLine.style.display = 'flex';
    commandLine.style.alignItems = 'center';
    commandLine.style.margin = '6px 0';

    const promptSpan = document.createElement('span');
    promptSpan.className = 'prompt';
    promptSpan.style.marginRight = '8px';
    promptSpan.textContent = promptText;

    const commandSpan = document.createElement('span');
    commandSpan.className = 'info';

    commandLine.appendChild(promptSpan);
    commandLine.appendChild(commandSpan);
    contentElement.appendChild(commandLine);

    contentElement.scrollTop = contentElement.scrollHeight;

    await this.typeWriterAsync(command, commandSpan, 30);
  }

  async executeCommand(command) {
    if (this.isSkipped || !this.demoTerminal) return;

    try {
      await this.demoTerminal.executeForegroundProcess(command);
    } catch (error) {
      console.error('Command execution error:', error);
    }

    const contentElement = document.getElementById(`${this.demoTerminalId}-content`);
    if (contentElement) {
      contentElement.scrollTop = contentElement.scrollHeight;
    }
  }

  writeCompletionMessage() {
    const contentElement = document.getElementById(`${this.demoTerminalId}-content`);
    if (!contentElement) return;

    const completion = document.createElement('div');
    completion.className = 'output';
    completion.innerHTML = `
      <br>
      <span class="success">╔════════════════════════════════════════════════════════╗</span><br>
      <span class="success">║     Demo Complete!                                 ║</span><br>
      <span class="success">║     You can now use any command in this terminal   ║</span><br>
      <span class="success">║     Type "help" to see all available commands      ║</span><br>
      <span class="success">╚════════════════════════════════════════════════════════╝</span><br>
    `;
    contentElement.appendChild(completion);

    contentElement.scrollTop = contentElement.scrollHeight;
  }

  setupSkipHandlers() {
    this.skipHandler = (e) => {
      if (e.key === 'Escape' && !this.isSkipped) {
        this.isSkipped = true;
        this.showSkipMessage();
      }
    };
    document.addEventListener('keydown', this.skipHandler);
  }

  removeSkipHandlers() {
    if (this.skipHandler) {
      document.removeEventListener('keydown', this.skipHandler);
      this.skipHandler = null;
    }
  }

  showSkipMessage() {
    const contentElement = document.getElementById(`${this.demoTerminalId}-content`);
    if (!contentElement) return;

    const skipMsg = document.createElement('div');
    skipMsg.className = 'output';
    skipMsg.innerHTML = '<br><span class="warning">Demo skipped - you now have control!</span><br>';
    contentElement.appendChild(skipMsg);

    contentElement.scrollTop = contentElement.scrollHeight;
  }

  cleanup() {
    this.removeSkipHandlers();
  }

  typeWriterAsync(text, element, speed) {
    return new Promise((resolve) => {
      if (this.isSkipped) {
        element.textContent = text;
        resolve();
        return;
      }

      let i = 0;
      element.textContent = '';

      const type = () => {
        if (this.isSkipped) {
          element.textContent = text;
          resolve();
          return;
        }

        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;

          const contentElement = document.getElementById(`${this.demoTerminalId}-content`);
          if (contentElement) {
            contentElement.scrollTop = contentElement.scrollHeight;
          }

          setTimeout(type, speed);
        } else {
          resolve();
        }
      };

      type();
    });
  }

  delay(ms) {
    return new Promise(resolve => {
      if (this.isSkipped) {
        resolve();
        return;
      }

      setTimeout(() => resolve(), ms);
    });
  }
}

import { DemoStorage } from './DemoStorage.js';

export class DemoModal {
  constructor(terminalManager) {
    this.terminalManager = terminalManager;
    this.currentStep = 0;
    this.isActive = false;
    this.overlayElement = null;
    this.tooltipElement = null;
    this.escapeHandler = null;
    this.resolvePromise = null;

    this.steps = [
      {
        type: 'ui',
        target: '.layout-toggle',
        title: 'Split Screen',
        description: 'Click this icon to toggle between tabbed and split screen view. View multiple terminals side-by-side!',
        position: 'bottom'
      },
      {
        type: 'ui',
        target: '.terminal-tab.new-tab',
        title: 'New Terminal',
        description: 'Click the + button to open a new terminal tab. Work on multiple tasks simultaneously!',
        position: 'bottom'
      },
      {
        type: 'ui',
        target: '.close-tab',
        title: 'Close Terminal',
        description: 'Click the × on any tab to close it. Closing the last terminal will close the entire application.',
        position: 'bottom'
      },
      {
        type: 'command',
        title: 'whoami - User Information',
        description: 'The "whoami" command shows information about the current user.',
        command: 'whoami'
      },
      {
        type: 'command',
        title: 'ls - List Files',
        description: 'The "ls" command lists all available files and folders in the current directory.',
        command: 'ls'
      },
      {
        type: 'command',
        title: 'pwd - Current Directory',
        description: 'The "pwd" command shows your current location in the file system.',
        command: 'pwd'
      },
      {
        type: 'command',
        title: 'cat - View File Contents',
        description: 'The "cat" command reads and displays the contents of a file.',
        command: 'cat about.txt'
      },
      {
        type: 'command',
        title: 'cat - View Skills',
        description: 'View technical skills and proficiency levels.',
        command: 'cat skills.conf'
      },
      {
        type: 'command',
        title: 'cat - View Education',
        description: 'View educational background and qualifications.',
        command: 'cat education.txt'
      },
      {
        type: 'command',
        title: 'curl - Download Resume',
        description: 'The "curl -O" command downloads files. Here we download the resume PDF.',
        command: 'curl -O resume.pdf'
      },
      {
        type: 'command',
        title: 'find - Search Files',
        description: 'The "find" command searches for files by name or pattern.',
        command: 'find .txt'
      },
      {
        type: 'command',
        title: 'grep - Search Content',
        description: 'The "grep" command searches for text within files.',
        command: 'grep Strengths skills.conf'
      },
      {
        type: 'command',
        title: 'tree - Directory Structure',
        description: 'The "tree" command visualizes the entire directory structure as a tree.',
        command: 'tree'
      },
      {
        type: 'command',
        title: 'help - Available Commands',
        description: 'The "help" command shows all available commands you can use in this terminal.',
        command: 'help'
      }
    ];
  }

  async show() {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.currentStep = 0;
      this.isActive = true;

      this.createOverlay();
      this.showStep(this.currentStep);
      this.addEventListeners();
    });
  }

  createOverlay() {
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'demo-tour-overlay';
    document.body.appendChild(this.overlayElement);
  }

  showStep(stepIndex) {
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = null;
    }

    document.querySelectorAll('.demo-highlight').forEach(el => {
      el.classList.remove('demo-highlight');
    });

    if (stepIndex >= this.steps.length) {
      this.complete();
      return;
    }

    const step = this.steps[stepIndex];

    if (step.type === 'ui') {
      const targetElement = document.querySelector(step.target);

      if (!targetElement) {
        console.warn(`Target not found: ${step.target}`);
        this.nextStep();
        return;
      }

      targetElement.classList.add('demo-highlight');
      this.createTooltip(step, targetElement);
    } else if (step.type === 'command') {
      this.createCommandTooltip(step);
    }
  }

  createTooltip(step, targetElement) {
    const rect = targetElement.getBoundingClientRect();

    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'demo-tooltip';

    this.tooltipElement.innerHTML = `
      <div class="demo-tooltip-content">
        <div class="demo-tooltip-header">
          <h3>${step.title}</h3>
          <span class="demo-step-counter">${this.currentStep + 1}/${this.steps.length}</span>
        </div>
        <p class="demo-tooltip-description">${step.description}</p>
        <div class="demo-tooltip-actions">
          <button class="demo-btn-secondary" id="demo-skip-btn">Skip Tour</button>
          <button class="demo-btn-primary" id="demo-next-btn">
            ${this.currentStep === this.steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
        <div class="demo-tooltip-hint">Press ESC to skip</div>
      </div>
      <div class="demo-tooltip-arrow"></div>
    `;

    document.body.appendChild(this.tooltipElement);

    this.positionTooltip(step.position, rect);

    document.getElementById('demo-next-btn').addEventListener('click', () => this.nextStep());
    document.getElementById('demo-skip-btn').addEventListener('click', () => this.skip());
  }

  positionTooltip(position, targetRect) {
    const tooltip = this.tooltipElement;
    const arrow = tooltip.querySelector('.demo-tooltip-arrow');
    const tooltipRect = tooltip.getBoundingClientRect();

    let top, left;

    if (position === 'bottom') {
      top = targetRect.bottom + 15;
      left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

      arrow.style.cssText = `
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 8px solid #161b22;
      `;
    } else if (position === 'top') {
      top = targetRect.top - tooltipRect.height - 15;
      left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

      arrow.style.cssText = `
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid #161b22;
      `;
    }

    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }
    if (top < 10) top = 10;

    tooltip.style.position = 'fixed';
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.zIndex = '9999';
  }

  async createCommandTooltip(step) {
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'demo-command-tooltip';

    this.tooltipElement.innerHTML = `
      <div class="demo-command-content">
        <div class="demo-tooltip-header">
          <h3>${step.title}</h3>
          <span class="demo-step-counter">${this.currentStep + 1}/${this.steps.length}</span>
        </div>
        <p class="demo-tooltip-description">${step.description}</p>

        <div class="demo-mini-terminal">
          <div class="demo-terminal-header">
            <div class="demo-terminal-buttons">
              <span class="demo-dot red"></span>
              <span class="demo-dot yellow"></span>
              <span class="demo-dot green"></span>
            </div>
            <span class="demo-terminal-title">vaishnav@dev: ~/portfolio</span>
          </div>
          <div class="demo-terminal-body" id="demo-terminal-body">
            <div class="demo-prompt-line">
              <span class="demo-prompt">vaishnav@dev:~/portfolio$</span>
              <span class="demo-command-text" id="demo-command-text"></span>
            </div>
            <div class="demo-output" id="demo-command-output"></div>
          </div>
        </div>

        <div class="demo-tooltip-actions">
          <button class="demo-btn-secondary" id="demo-skip-btn">Skip Tour</button>
          <button class="demo-btn-primary" id="demo-next-btn">
            ${this.currentStep === this.steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
        <div class="demo-tooltip-hint">Press ESC to skip</div>
      </div>
    `;

    document.body.appendChild(this.tooltipElement);

    this.tooltipElement.style.position = 'fixed';
    this.tooltipElement.style.top = '50%';
    this.tooltipElement.style.left = '50%';
    this.tooltipElement.style.transform = 'translate(-50%, -50%)';
    this.tooltipElement.style.zIndex = '9999';

    document.getElementById('demo-next-btn').addEventListener('click', () => this.nextStep());
    document.getElementById('demo-skip-btn').addEventListener('click', () => this.skip());

    await this.animateCommand(step.command);
  }

  async animateCommand(command) {
    const commandText = document.getElementById('demo-command-text');
    const outputDiv = document.getElementById('demo-command-output');

    if (!commandText || !outputDiv) {
      console.error('Demo elements not found');
      return;
    }

    for (let i = 0; i < command.length; i++) {
      commandText.textContent += command[i];
      await this.delay(50);
    }

    await this.delay(500);

    outputDiv.innerHTML = '<span class="info">Executing...</span>';

    try {
      const terminal = this.terminalManager.terminals.values().next().value;
      if (!terminal) {
        outputDiv.innerHTML = '<span class="error">Terminal not available</span>';
        return;
      }

      const tempContainer = document.createElement('div');
      tempContainer.id = 'demo-temp-output-' + Date.now();
      tempContainer.style.display = 'none';
      document.body.appendChild(tempContainer);

      const originalOutput = terminal.output;
      const originalPath = terminal.fileSystem.currentPath;
      const capturedOutputs = [];

      const mockOutput = {
        contentId: tempContainer.id,
        contentElement: tempContainer,
        fileSystem: terminal.fileSystem,

        write: function(text) {
          console.log('Mock write called:', text);
          capturedOutputs.push(text);

          this.contentElement = document.getElementById(this.contentId);

          if (!this.contentElement) {
            console.error('Temp container not found!');
            return;
          }

          const output = document.createElement('div');
          output.className = 'output';

          const isHTML = /<\/?[a-z][\s\S]*>/i.test(text);
          if (isHTML) {
            output.innerHTML = text;
          } else {
            output.textContent = text;
          }

          this.contentElement.appendChild(output);
        },

        clear: function() {
          this.contentElement = document.getElementById(this.contentId);
          if (this.contentElement) {
            this.contentElement.innerHTML = '';
          }
        },

        addPrompt: function() {
        },

        setFileSystem: function(fs) {
          this.fileSystem = fs;
        },

        scrollToBottom: function() {
        }
      };

      terminal.output = mockOutput;

      console.log('Executing command:', command);

      const args = command.split(' ');
      const commandName = args[0];
      const params = args.slice(1);

      const commandObj = terminal.commandRegistry.get(commandName);

      if (!commandObj) {
        outputDiv.innerHTML = `<span class="error">Command not found: ${commandName}</span>`;
        terminal.output = originalOutput;
        document.body.removeChild(tempContainer);
        return;
      }

      const customContext = {
        fileSystem: terminal.fileSystem,
        output: mockOutput,
        history: terminal.history,
        commandRegistry: terminal.commandRegistry,
        terminalId: terminal.terminalId,
        terminalInstance: terminal,
        isDemoMode: true
      };

      await commandObj.execute(params, customContext);

      await this.delay(300);

      terminal.output = originalOutput;
      terminal.fileSystem.currentPath = originalPath;

      const capturedHTML = tempContainer.innerHTML;

      document.body.removeChild(tempContainer);

      console.log('Total captured outputs:', capturedOutputs.length);
      console.log('Temp container HTML:', capturedHTML);

      if (capturedHTML.trim()) {
        outputDiv.innerHTML = capturedHTML;
      } else if (capturedOutputs.length > 0) {
        outputDiv.innerHTML = capturedOutputs.join('');
      } else {
        outputDiv.innerHTML = '<span class="warning">Command executed but produced no output</span>';
      }
    } catch (error) {
      console.error('Command execution error:', error);
      outputDiv.innerHTML = `<span class="error">Error: ${error.message}</span>`;
    }
  }

  nextStep() {
    this.currentStep++;
    this.showStep(this.currentStep);
  }

  skip() {
    this.close(true);
  }

  complete() {
    this.close(false);
  }

  addEventListeners() {
    this.escapeHandler = (e) => {
      if (e.key === 'Escape' && this.isActive) {
        this.skip();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);
  }

  removeEventListeners() {
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }
  }

  close(skipped = false) {
    if (!this.isActive) return;

    this.isActive = false;

    document.querySelectorAll('.demo-highlight').forEach(el => {
      el.classList.remove('demo-highlight');
    });

    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = null;
    }

    if (this.overlayElement) {
      // Immediately disable pointer events to prevent blocking
      this.overlayElement.style.pointerEvents = 'none';
      this.overlayElement.style.opacity = '0';

      setTimeout(() => {
        if (this.overlayElement && this.overlayElement.parentNode) {
          this.overlayElement.parentNode.removeChild(this.overlayElement);
        }
        this.overlayElement = null;

        // Clean up any stray demo elements
        document.querySelectorAll('.demo-tour-overlay, .demo-tooltip, .demo-command-tooltip').forEach(el => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });

        // Resolve promise AFTER overlay is fully removed
        if (this.resolvePromise) {
          this.resolvePromise({
            skipped,
            completed: !skipped
          });
          this.resolvePromise = null;
        }
      }, 300);
    } else {
      // No overlay, resolve immediately
      if (this.resolvePromise) {
        this.resolvePromise({
          skipped,
          completed: !skipped
        });
        this.resolvePromise = null;
      }
    }

    this.removeEventListeners();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

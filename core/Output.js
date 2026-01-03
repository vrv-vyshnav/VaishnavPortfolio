import { SecurityManager } from '../utils/security.js';

export class DOMOutput {
  constructor(contentId) {
    this.contentId = contentId;
    this.contentElement = document.getElementById(contentId);
    this.fileSystem = null;
  }

  setFileSystem(fileSystem) {
    this.fileSystem = fileSystem;
  }

  write(text) {
    try {
      this.contentElement = document.getElementById(this.contentId);

      if (!this.contentElement) {
        console.error('Content element not found');
        return;
      }

      const output = document.createElement('div');
      output.className = 'output';

      const isHTML = /<\/?[a-z][\s\S]*>/i.test(text);
      if (isHTML) {
        const clean = SecurityManager.sanitizeHTML(text);
        output.innerHTML = clean;
      } else {
        output.textContent = text;
      }

      const currentInput = this.contentElement.querySelector('.command-line');
      if (currentInput) currentInput.remove();

      this.contentElement.appendChild(output);
      this.scrollToBottom();
    } catch (error) {
      console.error('Error writing to terminal:', error);
      const output = document.createElement('div');
      output.className = 'output';
      output.textContent = text;
      this.contentElement.appendChild(output);
      this.scrollToBottom();
    }
  }

  clear() {
    try {
      this.contentElement = document.getElementById(this.contentId);

      if (this.contentElement) {
        this.contentElement.innerHTML = '';
      }
    } catch (error) {
      console.error('Error clearing terminal:', error);
    }
  }

  addPrompt() {
    try {
      this.contentElement = document.getElementById(this.contentId);

      if (!this.contentElement) {
        console.error('Content element not found');
        return;
      }

      const existingPrompt = this.contentElement.querySelector('.command-line');
      if (existingPrompt) {
        existingPrompt.remove();
      }

      const promptLine = document.createElement('div');
      promptLine.className = 'command-line';

      const inputId = `${this.contentId}-input`;
      const promptText = this.fileSystem ? this.fileSystem.getPrompt() : 'user@system:~$';
      promptLine.innerHTML = `
        <span class="prompt">${promptText}</span>
        <input type="text" class="user-input" id="${inputId}" autofocus autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
        <span class="cursor">█</span>
      `;

      this.contentElement.appendChild(promptLine);

      const newInput = document.getElementById(inputId);
      if (newInput) {
        newInput.focus();
        newInput.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      this.scrollToBottom();

      setTimeout(() => {
        const input = document.getElementById(inputId);
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        this.scrollToBottom();
      }, 100);

      setTimeout(() => {
        const input = document.getElementById(inputId);
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        this.scrollToBottom();
      }, 200);
    } catch (error) {
      console.error('Error adding prompt:', error);
    }
  }

  scrollToBottom() {
    try {
      this.contentElement = document.getElementById(this.contentId);

      if (this.contentElement) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.contentElement = document.getElementById(this.contentId);
            if (this.contentElement) {
              this.contentElement.scrollTop = this.contentElement.scrollHeight;
            }
          });
        });
      }
    } catch (error) {
      console.error('Error scrolling to bottom:', error);
    }
  }

  ensurePromptVisible() {
    return new Promise((resolve) => {
      try {
        this.contentElement = document.getElementById(this.contentId);

        if (!this.contentElement) {
          console.error('Content element not found');
          resolve();
          return;
        }

        const existingPrompt = this.contentElement.querySelector('.command-line');
        if (existingPrompt) {
          this.scrollToBottom();
          setTimeout(() => this.scrollToBottom(), 50);
          resolve();
          return;
        }

        const observer = new MutationObserver(() => {
          const prompt = this.contentElement.querySelector('.command-line');
          if (prompt) {
            observer.disconnect();
            this.scrollToBottom();
            setTimeout(() => this.scrollToBottom(), 50);
            resolve();
          }
        });

        observer.observe(this.contentElement, {
          childList: true,
          subtree: true
        });

        setTimeout(() => {
          observer.disconnect();
          this.scrollToBottom();
          resolve();
        }, 500);
      } catch (error) {
        console.error('Error ensuring prompt visible:', error);
        this.scrollToBottom();
        resolve();
      }
    });
  }
}
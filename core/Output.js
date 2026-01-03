import { SecurityManager } from '../utils/security.js';

export class DOMOutput {
  constructor(contentId) {
    this.contentId = contentId;  // Store the content ID
    this.contentElement = document.getElementById(contentId);
    this.fileSystem = null;  // Will hold the file system instance
  }

  // Set the file system to interact with
  setFileSystem(fileSystem) {
    this.fileSystem = fileSystem;
  }

  // Write text to the terminal
  write(text) {
    try {
      // Re-fetch the element in case it was recreated
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
      // Fallback to plain text if HTML sanitization fails
      const output = document.createElement('div');
      output.className = 'output';
      output.textContent = text;
      this.contentElement.appendChild(output);
      this.scrollToBottom();
    }
  }


  // Clear the terminal content
  clear() {
    try {
      // Re-fetch the element in case it was recreated
      this.contentElement = document.getElementById(this.contentId);
      
      if (this.contentElement) {
        this.contentElement.innerHTML = '';
      }
    } catch (error) {
      console.error('Error clearing terminal:', error);
    }
  }

  // Add the command prompt with input field
  addPrompt() {
    try {
      // Re-fetch the element in case it was recreated
      this.contentElement = document.getElementById(this.contentId);
      
      if (!this.contentElement) {
        console.error('Content element not found');
        return;
      }

      const promptLine = document.createElement('div');
      promptLine.className = 'command-line';
      
      // Generate a unique ID for the input field based on the content ID
      const inputId = `${this.contentId}-input`;
      const promptText = this.fileSystem ? this.fileSystem.getPrompt() : 'user@system:~$';
      promptLine.innerHTML = `
        <span class="prompt">${promptText}</span>
        <input type="text" class="user-input" id="${inputId}" autofocus autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
        <span class="cursor">█</span>
      `;
      
      this.contentElement.appendChild(promptLine);

      // Focus input and scroll to bottom
      const newInput = document.getElementById(inputId);
      if (newInput) {
        newInput.focus();
      }
      this.scrollToBottom();

      // Additional delayed focus and scroll for reliability
      setTimeout(() => {
        const input = document.getElementById(inputId);
        if (input) {
          input.focus();
        }
        this.scrollToBottom();
      }, 50);
    } catch (error) {
      console.error('Error adding prompt:', error);
    }
  }

  // Scroll the terminal content to the bottom
  scrollToBottom() {
    try {
      // Re-fetch the element in case it was recreated
      this.contentElement = document.getElementById(this.contentId);

      if (this.contentElement) {
        // Use double requestAnimationFrame for more reliable scrolling
        // First frame: DOM updates are applied
        requestAnimationFrame(() => {
          // Second frame: Layout is calculated
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
}
export class DOMOutput {
  constructor(contentId) {
    this.contentElement = document.getElementById(contentId);
    this.fileSystem = null;  // Will hold the file system instance
  }

  // Set the file system to interact with
  setFileSystem(fileSystem) {
    this.fileSystem = fileSystem;
  }

  // Write text to the terminal
  write(text) {
    const output = document.createElement('div');
    output.className = 'output';
    output.innerHTML = text;

    const currentInput = this.contentElement.querySelector('.command-line');
    if (currentInput) {
      currentInput.remove();  // Remove the current input field before appending new output
    }

    this.contentElement.appendChild(output);
    this.scrollToBottom();
  }

  // Clear the terminal content
  clear() {
    this.contentElement.innerHTML = '';
  }

  // Add the command prompt with input field
  addPrompt() {
    const promptLine = document.createElement('div');
    promptLine.className = 'command-line';
    promptLine.innerHTML = `
      <span class="prompt">${this.fileSystem.getPrompt()}</span>
      <input type="text" class="user-input" id="user-input" autofocus>
      <span class="cursor">█</span>
    `;
    this.contentElement.appendChild(promptLine);
    
    const newInput = document.getElementById('user-input');
    newInput.focus();
    this.scrollToBottom();
  }

  // Scroll the terminal content to the bottom
  scrollToBottom() {
    this.contentElement.scrollTop = this.contentElement.scrollHeight;
  }
}

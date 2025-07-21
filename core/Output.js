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

    const isHTML = /<\/?[a-z][\s\S]*>/i.test(text);
    if (isHTML) {
      const clean = this.sanitizeHTML(text);
      output.innerHTML = clean;
    } else {
      output.textContent = text;
    }

    const currentInput = this.contentElement.querySelector('.command-line');
    if (currentInput) currentInput.remove();

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
  sanitizeHTML(str) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, 'text/html');
    const body = doc.body || document.createElement('body');

    // Remove <script> elements
    body.querySelectorAll('script').forEach(el => el.remove());

    function clean(node) {
      // Attribute cleanup
      if (node.attributes) {
        [...node.attributes].forEach(attr => {
          const { name, value } = attr;
          const val = value.trim().toLowerCase();
          if (
            name.startsWith('on') ||
            (['src', 'href', 'xlink:href'].includes(name) &&
              (val.startsWith('javascript:') || val.startsWith('data:')))
          ) {
            node.removeAttribute(name);
          }
        });
      }
      // Recurse into children
      node.childNodes.forEach(child => clean(child));
    }

    clean(body);
    return body.innerHTML;
  }
}

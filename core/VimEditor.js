import { VimSyntax } from './VimSyntax.js';

export class VimEditor {
  constructor(container, content = '', filename = '') {
    this.container = container;
    this.content = content.split('\n');
    this.filename = filename;
    this.mode = 'VIEW';
    this.cursor = { line: 0, col: 0 };
    this.viewport = { startLine: 0, endLine: 0 };
    this.register = '';
    this.searchTerm = '';
    this.statusMessage = '';
    this.commandBuffer = '';
    this.syntax = new VimSyntax();
    this.fileType = this.syntax.getFileType(filename);
    this.updateDisplayDebounced = this.debounce(this.updateDisplay.bind(this), 16); // 60 FPS
    
    this.init();
  }

  init() {
    this.createEditorElements();
    this.bindEvents();
    this.updateDisplay();
    this.updateStatusLine();
  }

  createEditorElements() {
    this.container.innerHTML = `
      <div class="vim-editor">
        <div class="vim-content" tabindex="0">
          <div class="vim-lines"></div>
          <div class="vim-cursor"></div>
        </div>
        <div class="vim-status">
          <span class="vim-mode">${this.mode}</span>
          <span class="vim-filename">${this.filename}</span>
          <span class="vim-position">${this.cursor.line + 1},${this.cursor.col + 1}</span>
        </div>
        <div class="vim-command-line">
          <span class="vim-command-prompt"></span>
          <span class="vim-command-input"></span>
        </div>
        <div class="vim-help-bar">
          <span class="vim-help-item">hjkl: Navigate</span>
          <span class="vim-help-item">gg/G: Top/Bottom</span>
          <span class="vim-help-item">/: Search</span>
          <span class="vim-help-item">n/N: Next/Prev</span>
          <span class="vim-help-item">:q: Quit</span>
          <span class="vim-help-item">:help: Help</span>
        </div>
      </div>
    `;

    this.contentEl = this.container.querySelector('.vim-content');
    this.linesEl = this.container.querySelector('.vim-lines');
    this.cursorEl = this.container.querySelector('.vim-cursor');
    this.statusEl = this.container.querySelector('.vim-status');
    this.commandLineEl = this.container.querySelector('.vim-command-line');
    this.commandPromptEl = this.container.querySelector('.vim-command-prompt');
    this.commandInputEl = this.container.querySelector('.vim-command-input');

    this.contentEl.focus();
  }

  bindEvents() {
    this.contentEl.addEventListener('keydown', (e) => {
      e.preventDefault();
      this.handleKeypress(e);
    });

    this.contentEl.addEventListener('blur', () => {
      setTimeout(() => this.contentEl.focus(), 0);
    });

    // Add scroll event listener to update display during scrolling
    this.contentEl.addEventListener('scroll', () => {
      this.updateDisplayDebounced();
    });
    
    // Add resize event listener for responsive updates
    window.addEventListener('resize', () => {
      this.updateDisplayDebounced();
      this.updateCursor();
    });
  }

  handleKeypress(e) {
    const key = e.key;

    if (this.mode === 'COMMAND') {
      this.handleCommandMode(key);
    } else if (this.mode === 'VIEW') {
      this.handleViewMode(key);
    }

    this.updateDisplayDebounced();
    this.updateStatusLine();
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  handleViewMode(key) {
    switch (key) {
      case 'h':
      case 'ArrowLeft':
        this.moveCursor(-1, 0);
        break;
      case 'j':
      case 'ArrowDown':
        this.moveCursor(0, 1);
        break;
      case 'k':
      case 'ArrowUp':
        this.moveCursor(0, -1);
        break;
      case 'l':
      case 'ArrowRight':
        this.moveCursor(1, 0);
        break;
      case 'g':
        if (this.lastKey === 'g') {
          this.goToTop();
        }
        break;
      case 'G':
        this.goToBottom();
        break;
      case '0':
      case 'Home':
        this.goToLineStart();
        break;
      case '$':
      case 'End':
        this.goToLineEnd();
        break;
      case 'w':
        this.moveToNextWord();
        break;
      case 'b':
        this.moveToPrevWord();
        break;
      case '/':
        this.startSearch();
        break;
      case 'n':
        this.searchNext();
        break;
      case 'N':
        this.searchPrev();
        break;
      case ':':
        this.setMode('COMMAND');
        break;
      case 'Escape':
        this.clearSearch();
        break;
      case 'PageUp':
        this.pageUp();
        break;
      case 'PageDown':
        this.pageDown();
        break;
      // Block editing keys with status message
      case 'i':
      case 'a':
      case 'o':
      case 'O':
      case 'x':
      case 'd':
        this.statusMessage = 'Read-only mode - editing disabled';
        break;
    }
    
    this.lastKey = key;
  }


  handleCommandMode(key) {
    switch (key) {
      case 'Escape':
        this.setMode('VIEW');
        this.commandBuffer = '';
        break;
      case 'Enter':
        this.executeCommand();
        break;
      case 'Backspace':
        this.commandBuffer = this.commandBuffer.slice(0, -1);
        break;
      default:
        if (key.length === 1) {
          this.commandBuffer += key;
        }
        break;
    }
    this.updateCommandLine();
  }

  setMode(mode) {
    this.mode = mode;
    this.statusMessage = '';
    
    if (mode === 'COMMAND') {
      this.commandBuffer = '';
      this.updateCommandLine();
    }
  }

  moveCursor(deltaX, deltaY) {
    const newLine = Math.max(0, Math.min(this.content.length - 1, this.cursor.line + deltaY));
    const newCol = Math.max(0, Math.min(this.content[newLine].length - 1, this.cursor.col + deltaX));
    
    this.cursor.line = newLine;
    this.cursor.col = Math.max(0, newCol);
    
    this.updateViewport();
  }

  updateViewport() {
    this.scrollToCursor();
    this.updateDisplayDebounced();
  }


  goToTop() {
    this.cursor.line = 0;
    this.cursor.col = 0;
    this.updateViewport();
  }

  goToBottom() {
    this.cursor.line = this.content.length - 1;
    this.cursor.col = 0;
    this.updateViewport();
  }

  goToLineStart() {
    this.cursor.col = 0;
  }

  goToLineEnd() {
    this.cursor.col = Math.max(0, this.content[this.cursor.line].length - 1);
  }

  moveToNextWord() {
    const line = this.content[this.cursor.line];
    let col = this.cursor.col;
    
    while (col < line.length && /\S/.test(line[col])) col++;
    while (col < line.length && /\s/.test(line[col])) col++;
    
    this.cursor.col = Math.min(col, line.length - 1);
  }

  moveToPrevWord() {
    const line = this.content[this.cursor.line];
    let col = this.cursor.col;
    
    if (col > 0) col--;
    while (col > 0 && /\s/.test(line[col])) col--;
    while (col > 0 && /\S/.test(line[col - 1])) col--;
    
    this.cursor.col = col;
  }

  startSearch() {
    this.setMode('COMMAND');
    this.commandBuffer = '/';
    this.updateCommandLine();
  }

  clearSearch() {
    this.searchTerm = '';
    this.statusMessage = '';
  }

  pageUp() {
    const linesPerPage = Math.floor(this.contentEl.clientHeight / 20) - 2;
    this.moveCursor(0, -linesPerPage);
  }

  pageDown() {
    const linesPerPage = Math.floor(this.contentEl.clientHeight / 20) - 2;
    this.moveCursor(0, linesPerPage);
  }

  executeCommand() {
    const cmd = this.commandBuffer;
    this.commandBuffer = '';
    
    if (cmd.startsWith('/')) {
      this.searchTerm = cmd.slice(1);
      this.searchNext();
    } else if (cmd === 'q' || cmd === 'quit') {
      this.quit();
    } else if (cmd === 'w' || cmd === 'write' || cmd === 'wq') {
      this.statusMessage = `"${this.filename}" [Read-only] - Cannot write`;
    } else if (cmd === 'help' || cmd === '?') {
      this.showHelp();
    } else if (cmd === 'contact') {
      this.jumpToContact();
    } else if (cmd === 'skills') {
      this.jumpToSkills();
    } else if (cmd === 'projects') {
      this.jumpToProjects();
    } else if (cmd.match(/^\d+$/)) {
      // Go to line number
      const lineNum = parseInt(cmd) - 1;
      if (lineNum >= 0 && lineNum < this.content.length) {
        this.cursor.line = lineNum;
        this.cursor.col = 0;
        this.updateViewport();
      }
    } else if (cmd !== '') {
      this.statusMessage = `Not an editor command: ${cmd}`;
    }
    
    this.setMode('VIEW');
    this.updateCommandLine();
  }

  searchNext() {
    if (!this.searchTerm) return;
    
    for (let i = this.cursor.line; i < this.content.length; i++) {
      const startCol = i === this.cursor.line ? this.cursor.col + 1 : 0;
      const index = this.content[i].indexOf(this.searchTerm, startCol);
      
      if (index !== -1) {
        this.cursor.line = i;
        this.cursor.col = index;
        this.updateViewport();
        return;
      }
    }
    
    this.statusMessage = 'Pattern not found';
  }

  searchPrev() {
    if (!this.searchTerm) return;
    
    for (let i = this.cursor.line; i >= 0; i--) {
      const endCol = i === this.cursor.line ? this.cursor.col - 1 : this.content[i].length;
      const index = this.content[i].lastIndexOf(this.searchTerm, endCol);
      
      if (index !== -1) {
        this.cursor.line = i;
        this.cursor.col = index;
        this.updateViewport();
        return;
      }
    }
    
    this.statusMessage = 'Pattern not found';
  }

  quit() {
    this.container.style.display = 'none';
    document.querySelector('#terminal-tabs').style.display = 'flex';
    document.querySelector('.terminal-content.active').style.display = 'block';
  }

  showHelp() {
    this.statusMessage = 'hjkl=navigate gg/G=top/bottom /=search n/N=next/prev :q=quit | Portfolio: :contact :skills :projects';
  }

  jumpToContact() {
    const contactLine = this.content.findIndex(line => line.toLowerCase().includes('contact'));
    if (contactLine !== -1) {
      this.cursor.line = contactLine;
      this.cursor.col = 0;
      this.updateViewport();
    }
  }

  jumpToSkills() {
    const skillsLine = this.content.findIndex(line => line.toLowerCase().includes('skill'));
    if (skillsLine !== -1) {
      this.cursor.line = skillsLine;
      this.cursor.col = 0;
      this.updateViewport();
    }
  }

  jumpToProjects() {
    this.statusMessage = 'Use: cd projects && ls';
  }

  updateDisplay() {
    // Responsive line height based on screen size
    const isSmallScreen = window.innerWidth <= 480;
    const isMobile = window.innerWidth <= 320;
    
    let lineHeight;
    if (isMobile) {
      lineHeight = 16;
    } else if (isSmallScreen) {
      lineHeight = 16;
    } else {
      lineHeight = 20;
    }
    
    const topPadding = 10;
    const containerHeight = this.contentEl.clientHeight;
    const scrollTop = this.contentEl.scrollTop;
    
    // Calculate visible range based on scroll position, accounting for padding
    const adjustedScrollTop = Math.max(0, scrollTop - topPadding);
    const linesPerScreen = Math.floor(containerHeight / lineHeight);
    const startLine = Math.floor(adjustedScrollTop / lineHeight);
    const endLine = Math.min(startLine + linesPerScreen + 5, this.content.length); // +5 buffer
    const actualStartLine = Math.max(0, startLine - 2); // -2 buffer above
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Clear existing content
    this.linesEl.innerHTML = '';
    
    for (let i = actualStartLine; i < endLine; i++) {
      const lineEl = document.createElement('div');
      lineEl.className = 'vim-line';
      lineEl.style.transform = `translateY(${topPadding + i * lineHeight}px)`;
      
      const lineContent = this.content[i] || '';
      const highlightedContent = this.syntax.highlightLine(lineContent, this.fileType);
      lineEl.innerHTML = `<span class="vim-line-number">${i + 1}</span><span class="vim-line-content">${highlightedContent}</span>`;
      fragment.appendChild(lineEl);
    }
    
    this.linesEl.appendChild(fragment);
    this.linesEl.style.height = `${topPadding + this.content.length * lineHeight}px`;
    
    this.updateCursor();
  }

  updateCursor() {
    // Responsive cursor sizing based on screen width
    const isSmallScreen = window.innerWidth <= 480;
    const isMobile = window.innerWidth <= 320;
    
    let lineHeight, charWidth, lineNumberWidth;
    
    if (isMobile) {
      lineHeight = 16;
      charWidth = 6;
      lineNumberWidth = 0; // No line numbers on very small screens
    } else if (isSmallScreen) {
      lineHeight = 16;
      charWidth = 6;
      lineNumberWidth = 0; // No line numbers on small screens
    } else {
      lineHeight = 20;
      charWidth = 8;
      lineNumberWidth = 40;
    }
    
    const topPadding = 10;
    
    this.cursorEl.style.top = `${topPadding + this.cursor.line * lineHeight}px`;
    this.cursorEl.style.left = `${lineNumberWidth + 8 + this.cursor.col * charWidth}px`;
    this.cursorEl.className = `vim-cursor vim-cursor-${this.mode.toLowerCase()}`;
  }

  scrollToCursor() {
    // Responsive line height based on screen size
    const isSmallScreen = window.innerWidth <= 480;
    const isMobile = window.innerWidth <= 320;
    
    let lineHeight;
    if (isMobile) {
      lineHeight = 16;
    } else if (isSmallScreen) {
      lineHeight = 16;
    } else {
      lineHeight = 20;
    }
    
    const topPadding = 10;
    const cursorTop = topPadding + this.cursor.line * lineHeight;
    const containerHeight = this.contentEl.clientHeight;
    const scrollTop = this.contentEl.scrollTop;
    
    // Scroll if cursor is outside visible area
    if (cursorTop < scrollTop + topPadding) {
      this.contentEl.scrollTop = Math.max(0, cursorTop - topPadding - lineHeight);
    } else if (cursorTop >= scrollTop + containerHeight - lineHeight * 2) {
      this.contentEl.scrollTop = cursorTop - containerHeight + lineHeight * 3;
    }
  }

  updateStatusLine() {
    const modeEl = this.statusEl.querySelector('.vim-mode');
    const filenameEl = this.statusEl.querySelector('.vim-filename');
    const positionEl = this.statusEl.querySelector('.vim-position');
    
    modeEl.textContent = this.mode;
    modeEl.className = `vim-mode vim-mode-${this.mode.toLowerCase()}`;
    filenameEl.textContent = this.filename || '[No Name]';
    positionEl.textContent = `${this.cursor.line + 1},${this.cursor.col + 1}`;
    
    if (this.statusMessage) {
      this.commandInputEl.textContent = this.statusMessage;
      setTimeout(() => {
        this.statusMessage = '';
        this.updateCommandLine();
      }, 2000);
    }
  }

  updateCommandLine() {
    if (this.mode === 'COMMAND') {
      this.commandPromptEl.textContent = ':';
      this.commandInputEl.textContent = this.commandBuffer;
    } else {
      this.commandPromptEl.textContent = '';
      this.commandInputEl.textContent = this.statusMessage || '';
    }
  }

  getContent() {
    return this.content.join('\n');
  }
}
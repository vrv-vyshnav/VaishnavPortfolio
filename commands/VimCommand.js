import { Command } from '../core/Command.js';
import { VimEditor } from '../core/VimEditor.js';

// Simple cache for file contents
const contentCache = new Map();

export class VimCommand extends Command {
  constructor() {
    super('vim', 'Open file in vim editor', { category: 'Editor' });
  }

  async execute(params, context) {
    if (!params.length) {
      context.output.write('<span class="error">vim: missing file operand</span>');
      context.output.write('Usage: vim <filename>');
      return;
    }

    const filename = params[0];
    const dir = context.fileSystem.getCurrentDirectory();
    const entry = dir.contents[filename];

    if (!entry || entry.type !== 'file') {
      context.output.write(`<span class="error">vim: ${filename}: No such file or directory</span>`);
      return;
    }

    try {
      let content = '';
      const fullPath = context.fileSystem.currentPath + '/' + filename;
      const cacheKey = `${fullPath}-${entry.renderType}`;
      
      // Check cache first
      if (contentCache.has(cacheKey)) {
        content = contentCache.get(cacheKey);
        this.openVimEditor(content, filename);
        return;
      }
      
      // Show loading message and get proper element reference
      const outputElement = context.output.contentElement;
      const loadingElement = document.createElement('div');
      loadingElement.innerHTML = '<span class="loading">Loading vim editor...</span>';
      loadingElement.className = 'vim-loading-message';
      outputElement.appendChild(loadingElement);
      
      try {
        if (entry.renderType === 'html') {
          // Convert HTML to plain text for vim viewing
          const res = await fetch(entry.content);
          const html = await res.text();
          content = this.convertHtmlToText(html);
        } else if (entry.renderType === 'text') {
          // Check if content is a URL path or direct content
          if (entry.content.startsWith('content/') || entry.content.startsWith('/') || entry.content.startsWith('http')) {
            // Load text file content from URL
            const res = await fetch(entry.content);
            content = await res.text();
          } else {
            // Content is embedded directly (like project files)
            content = entry.content || '';
          }
        } else {
          content = entry.content || '';
        }

        // Cache the content
        contentCache.set(cacheKey, content);
        
        // Remove loading message safely
        if (loadingElement && loadingElement.parentNode) {
          loadingElement.parentNode.removeChild(loadingElement);
        }

        this.openVimEditor(content, filename);
      } catch (fetchError) {
        // Remove loading message on error
        if (loadingElement && loadingElement.parentNode) {
          loadingElement.parentNode.removeChild(loadingElement);
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Vim loading error:', error);
      context.output.write(`<span class="error">vim: ${filename}: failed to load file content - ${error.message}</span>`);
    }
  }

  convertHtmlToText(html) {
    // Parse HTML and convert to vim-friendly text format
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    let text = '';
    
    // Handle different content sections
    const sections = doc.querySelectorAll('.grid > div, .personal-info, .contact, .bio, .specialties');
    
    sections.forEach(section => {
      const heading = section.querySelector('.terminal-heading');
      if (heading) {
        text += `\n=== ${heading.textContent.toUpperCase()} ===\n\n`;
      }
      
      // Handle ASCII art
      const asciiArt = section.querySelector('.ascii-art');
      if (asciiArt) {
        text += asciiArt.textContent + '\n\n';
      }
      
      // Handle key-value pairs
      const keys = section.querySelectorAll('.terminal-key');
      keys.forEach(key => {
        const nextSibling = key.nextSibling;
        if (nextSibling && nextSibling.textContent.trim()) {
          text += `${key.textContent.trim()}: ${nextSibling.textContent.trim()}\n`;
        }
      });
      
      // Handle paragraphs and plain text
      const textNodes = this.getTextContent(section);
      if (textNodes && !keys.length) {
        text += textNodes + '\n\n';
      }
    });
    
    return text.trim();
  }

  getTextContent(element) {
    let text = '';
    
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const content = node.textContent.trim();
        if (content && !content.match(/^[=•]+$/)) {
          text += content + ' ';
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains('terminal-key') || 
            node.classList.contains('terminal-heading') ||
            node.classList.contains('ascii-art')) {
          continue;
        }
        
        const childText = this.getTextContent(node);
        if (childText.trim()) {
          if (node.tagName === 'BR') {
            text += '\n';
          } else {
            text += childText;
          }
        }
      }
    }
    
    return text.trim();
  }

  openVimEditor(content, filename) {
    // Hide terminal interface
    const terminalTabs = document.querySelector('#terminal-tabs');
    const activeTerminal = document.querySelector('.terminal-content.active');
    
    if (terminalTabs) terminalTabs.style.display = 'none';
    if (activeTerminal) activeTerminal.style.display = 'none';
    
    // Create vim editor container with enhanced dark theme
    const vimContainer = document.createElement('div');
    vimContainer.id = 'vim-editor-container';
    vimContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #0d1117;
      z-index: 1000;
      display: block;
      opacity: 0;
      transition: opacity 0.3s ease-out;
    `;
    
    document.body.appendChild(vimContainer);
    
    // Initialize vim editor with view-only mode
    const vimEditor = new VimEditor(vimContainer, content, filename);
    
    // Add read-only indicator
    const readonlyIndicator = document.createElement('div');
    readonlyIndicator.className = 'vim-readonly-indicator';
    readonlyIndicator.textContent = 'READ-ONLY';
    vimContainer.appendChild(readonlyIndicator);
    
    // Fade in animation
    requestAnimationFrame(() => {
      vimContainer.style.opacity = '1';
    });
    
    // Store reference for cleanup
    window.currentVimEditor = vimEditor;
    
    // Add escape handler for quick exit
    const handleEscape = (e) => {
      if (e.key === 'Escape' && e.ctrlKey) {
        vimEditor.quit();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  getHelp() {
    return {
      'vim <file>': 'Open file in vim editor',
      'vi <file>': 'Alias for vim command'
    };
  }
}

// Also create an alias for 'vi' command
export class ViCommand extends VimCommand {
  constructor() {
    super();
    this.name = 'vi';
    this.description = 'Open file in vi editor (alias for vim)';
  }
}
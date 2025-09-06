export class VimSyntax {
  constructor() {
    this.rules = {
      'txt': this.getTextRules(),
      'conf': this.getConfigRules(),
      'info': this.getConfigRules(),
      'md': this.getMarkdownRules()
    };
  }

  getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    return this.rules[extension] ? extension : 'txt';
  }

  highlightLine(line, fileType) {
    const rules = this.rules[fileType] || this.rules['txt'];
    let highlightedLine = line;

    // Apply syntax highlighting rules in order
    rules.forEach(rule => {
      highlightedLine = highlightedLine.replace(rule.pattern, rule.replacement);
    });

    return highlightedLine;
  }

  getTextRules() {
    return [
      // Headers and sections
      {
        pattern: /^(===.*===)/g,
        replacement: '<span class="header">$1</span>'
      },
      // ASCII art
      {
        pattern: /^[\s]*[/\\|_\-═┌┐└┘│─┬┴┼]+.*$/g,
        replacement: '<span class="comment">$&</span>'
      },
      // Key-value pairs
      {
        pattern: /^([A-Za-z\s]+):\s*(.+)$/g,
        replacement: '<span class="key">$1:</span> $2'
      },
      // Bullet points
      {
        pattern: /^(\s*[•★▼])\s*(.+)$/g,
        replacement: '$1 <span class="string">$2</span>'
      },
      // Email addresses
      {
        pattern: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        replacement: '<span class="string">$1</span>'
      },
      // URLs
      {
        pattern: /(https?:\/\/[^\s]+)/g,
        replacement: '<span class="string">$1</span>'
      },
      // Numbers
      {
        pattern: /\b(\d{4}|\d+\+?|\d+%)\b/g,
        replacement: '<span class="number">$1</span>'
      }
    ];
  }

  getConfigRules() {
    return [
      // Comments
      {
        pattern: /^#.*$/g,
        replacement: '<span class="comment">$&</span>'
      },
      // Section headers
      {
        pattern: /^\[([^\]]+)\]/g,
        replacement: '<span class="header">[$1]</span>'
      },
      // Key-value assignments
      {
        pattern: /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*"([^"]*)"/g,
        replacement: '<span class="key">$1</span> = <span class="string">"$2"</span>'
      },
      {
        pattern: /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([^"]+)$/g,
        replacement: '<span class="key">$1</span> = <span class="string">$2</span>'
      },
      // Numbers
      {
        pattern: /\b(\d+)\b/g,
        replacement: '<span class="number">$1</span>'
      }
    ];
  }

  getMarkdownRules() {
    return [
      // Headers
      {
        pattern: /^(#+)\s*(.+)$/g,
        replacement: '<span class="header">$1 $2</span>'
      },
      // Bold
      {
        pattern: /\*\*([^*]+)\*\*/g,
        replacement: '<span class="keyword">**$1**</span>'
      },
      // Italic
      {
        pattern: /\*([^*]+)\*/g,
        replacement: '<span class="string">*$1*</span>'
      },
      // Code blocks
      {
        pattern: /`([^`]+)`/g,
        replacement: '<span class="keyword">`$1`</span>'
      },
      // Links
      {
        pattern: /\[([^\]]+)\]\(([^)]+)\)/g,
        replacement: '<span class="string">[$1]</span>(<span class="keyword">$2</span>)'
      },
      // List items
      {
        pattern: /^(\s*[-*+])\s*(.+)$/g,
        replacement: '<span class="comment">$1</span> $2'
      }
    ];
  }

  // Helper method to get all supported file types
  getSupportedTypes() {
    return Object.keys(this.rules);
  }

  // Method to add custom syntax rules
  addCustomRules(fileType, rules) {
    if (!this.rules[fileType]) {
      this.rules[fileType] = [];
    }
    this.rules[fileType] = this.rules[fileType].concat(rules);
  }
}
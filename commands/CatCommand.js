import { Command } from '../core/Command.js';
import { FetchUtils } from '../utils/fetchUtils.js';

export class CatCommand extends Command {
  constructor() {
    super('cat', 'Display file contents', { category: 'File System' });
  }

  async execute(params, context) {
    if (!params.length) {
      context.output.write('cat: missing file operand');
      return;
    }

    const name = params[0];
    const dir = context.fileSystem.getCurrentDirectory();
    const entry = dir.contents[name];

    if (!entry || entry.type !== 'file') {
      context.output.write(`cat: ${name}: No such file`);
      return;
    }

   if (entry.renderType === 'html') {
      try {
        const html = await FetchUtils.fetchText(entry.content);
        context.output.write(html);
      } catch (error) {
        context.output.write(`<span class="error">cat: ${params[0]}: ${error.message}</span>`);
      }
      return;
    }

    if (entry.renderType === 'text') {
      try {
        let text = '';
        // Check if content is a URL path or direct content
        if (entry.content.startsWith('content/') || entry.content.startsWith('/') || entry.content.startsWith('http')) {
          // Load text file content from URL
          text = await FetchUtils.fetchText(entry.content);
        } else {
          // Content is embedded directly (like project files)
          text = entry.content || '';
        }
        
        // Remove ASCII borders on mobile devices (including device rotation)
        if (window.innerWidth <= 768) {
          text = this.removeMobileASCIIBorders(text);
        }
        
        context.output.write(`<pre class="file-content">${text}</pre>`);
      } catch (error) {
        context.output.write(`<span class="error">cat: ${params[0]}: ${error.message}</span>`);
      }
      return;
    }

    // fallback for binary or unsupported types
    context.output.write(
      `<span class="">${entry.content || ''}</span>`
    );
        
  }
  
  removeMobileASCIIBorders(text) {
    // Remove ASCII border lines that cause horizontal overflow on mobile
    const lines = text.split('\n');
    const filteredLines = lines.filter(line => {
      // Remove lines that contain only ASCII border characters
      const trimmedLine = line.trim();
      
      // Match lines with only box drawing characters and spaces/dashes
      const borderPattern = /^[┌┐└┘│─\s]+$/;
      const isOnlyBorders = borderPattern.test(trimmedLine);
      
      // Also remove empty lines that are adjacent to borders for better spacing
      if (isOnlyBorders) {
        return false;
      }
      
      return true;
    });
    
    return filteredLines.join('\n');
  }
}

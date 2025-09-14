import { Command } from '../core/Command.js';
import { FetchUtils } from '../utils/fetchUtils.js';

export class WordCountCommand extends Command {
  constructor() {
    super('wc', 'Count lines, words, characters', { category: 'Text Processing' });
  }

  async execute(params, context) {
    if (params.length === 0) {
      context.output.write(`<span class="error">wc: missing file operand</span>`);
      return;
    }

    const fileName = params[0];
    const currentDir = context.fileSystem.getCurrentDirectory();
    const entry = currentDir.contents[fileName];

    if (!entry || entry.type !== 'file') {
      context.output.write(`<span class="error">wc: ${fileName}: No such file</span>`);
      return;
    }

    try {
      let content = '';

      // Load content based on render type, similar to other text processing commands
      if (entry.renderType === 'html') {
        const html = await FetchUtils.fetchText(entry.content);
        // Strip HTML tags for word counting
        content = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
      } else if (entry.renderType === 'text') {
        // Check if content is a URL path or direct content
        if (entry.content.startsWith('content/') || entry.content.startsWith('/') || entry.content.startsWith('http')) {
          content = await FetchUtils.fetchText(entry.content);
        } else {
          // Content is embedded directly (like project files)
          content = entry.content || '';
        }
      } else {
        // Fallback - try to use content as-is
        content = entry.content || '';
      }

      // Count lines, words, and characters
      const lines = content.split('\n').length;
      const words = content.split(/\s+/).filter(w => w.length > 0).length;
      const chars = content.length;

      // Format output like standard wc command: lines words chars filename
      context.output.write(`<span class="info">  ${lines.toString().padStart(7)}  ${words.toString().padStart(7)}  ${chars.toString().padStart(7)} ${fileName}</span>`);
    } catch (error) {
      context.output.write(`<span class="error">wc: ${fileName}: ${error.message}</span>`);
    }
  }
}

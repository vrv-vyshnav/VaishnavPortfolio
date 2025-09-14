import { Command } from '../core/Command.js';
import { FetchUtils } from '../utils/fetchUtils.js';

export class TailCommand extends Command {
  constructor() {
    super('tail', 'Show last lines of file', { category: 'Text Processing' });
  }

  async execute(params, context) {
    if (params.length === 0) {
      context.output.write(`<span class="error">tail: missing file operand</span>`);
      return;
    }

    const fileName = params[0];
    const currentDir = context.fileSystem.getCurrentDirectory();
    const entry = currentDir.contents[fileName];

    if (!entry || entry.type !== 'file') {
      context.output.write(`<span class="error">tail: ${fileName}: No such file</span>`);
      return;
    }

    try {
      let content = '';

      // Load content based on render type, similar to CatCommand
      if (entry.renderType === 'html') {
        const html = await FetchUtils.fetchText(entry.content);
        // Strip HTML tags for text processing
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

      // Show last 10 lines
      const lines = content.split('\n').slice(-10);
      context.output.write(`<pre class="file-content">${lines.join('\n')}</pre>`);
    } catch (error) {
      context.output.write(`<span class="error">tail: ${fileName}: ${error.message}</span>`);
    }
  }
}

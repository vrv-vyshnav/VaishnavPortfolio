import { Command } from '../core/Command.js';
import { FetchUtils } from '../utils/fetchUtils.js';

export class GrepCommand extends Command {
  constructor() {
    super('grep', 'Search text in files', { category: 'Text Processing' });
  }

  async execute(params, context) {
    if (params.length < 2) {
      context.output.write(`<span class="error">grep: usage: grep pattern file</span>`);
      return;
    }

    const pattern = params[0];
    const fileName = params[1];
    const currentDir = context.fileSystem.getCurrentDirectory();
    const entry = currentDir.contents[fileName];

    if (!entry || entry.type !== 'file') {
      context.output.write(`<span class="error">grep: ${fileName}: No such file</span>`);
      return;
    }

    try {
      let content = '';

      // Load content based on render type, similar to CatCommand
      if (entry.renderType === 'html') {
        const html = await FetchUtils.fetchText(entry.content);
        // Strip HTML tags for text searching
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

      // Search for pattern in the content
      const lines = content.split('\n');
      const matches = lines.filter(line =>
        line.toLowerCase().includes(pattern.toLowerCase())
      ).map(line => line.trim()).filter(line => line.length > 0);

      if (matches.length === 0) {
        context.output.write(`<span class="warning">No matches found for '${pattern}' in ${fileName}</span>`);
      } else {
        context.output.write(`<span class="info">Found ${matches.length} matches in ${fileName}:</span>`);
        matches.forEach(match => {
          const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const highlighted = match.replace(
            new RegExp(`(${escapedPattern})`, 'gi'),
            `<span class="warning">$1</span>`
          );
          context.output.write(`<span class="info">${highlighted}</span>`);
        });
      }
    } catch (error) {
      context.output.write(`<span class="error">grep: ${fileName}: ${error.message}</span>`);
    }
  }
}

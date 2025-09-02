import { Command } from '../core/Command.js';

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
        const res = await fetch(entry.content);
        const html = await res.text();
        context.output.write(html);
      } catch {
        context.output.write(`<span class="error">cat: ${params[0]}: failed to load HTML content</span>`);
      }
      return;
    }

    if (entry.renderType === 'text') {
      try {
        let text = '';
        // Check if content is a URL path or direct content
        if (entry.content.startsWith('content/') || entry.content.startsWith('/') || entry.content.startsWith('http')) {
          // Load text file content from URL
          const res = await fetch(entry.content);
          text = await res.text();
        } else {
          // Content is embedded directly (like project files)
          text = entry.content || '';
        }
        context.output.write(`<pre class="file-content">${text}</pre>`);
      } catch {
        context.output.write(`<span class="error">cat: ${params[0]}: failed to load text content</span>`);
      }
      return;
    }

    // fallback for binary or unsupported types
    context.output.write(
      `<span class="">${entry.content || ''}</span>`
    );
        
  }
}

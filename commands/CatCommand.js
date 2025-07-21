import { Command } from '../core/Command.js';

export class CatCommand extends Command {
  constructor() {
    super('cat', 'Display file contents');
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
        context.output.write(`<span class="error">cat: ${fileName}: failed to load HTML content</span>`);
      }
      return;
    }

    // fallback for binary or unsupported types
    context.output.write(
      `<span class="">${entry.content || ''}</span>`
    );
        
  }
}

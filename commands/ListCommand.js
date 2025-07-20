import { Command } from '../core/Command.js';

export class ListCommand extends Command {
  constructor() {
    super('ls', 'List directory contents');
  }

  execute(params, context) {
    const items = context.fileSystem.list();
    const itemNames = Object.keys(items);
    
    if (itemNames.length === 0) {
      context.output.write(`<span class="info">Directory is empty</span>`);
      return;
    }

    let output = '';
    itemNames.forEach(item => {
      const itemObj = items[item];
      if (itemObj.type === 'directory') {
        output += `<span class="directory">${item}/</span>  `;
      } else {
        output += `<span class="file">${item}</span>  `;
      }
    });

    context.output.write(output);
  }
}

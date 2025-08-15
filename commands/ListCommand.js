import { Command } from '../core/Command.js';
import { FileIcons } from '../utils/fileIcons.js';

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
      const icon = FileIcons.getIcon(item, itemObj.type);
      
      if (itemObj.type === 'directory') {
        output += `<span class="directory">${icon} ${item}/</span>  `;
      } else {
        // Check if it's an executable file
        if (FileIcons.isExecutable(item)) {
          output += `<span class="executable">${icon} ${item}</span>  `;
        } else {
          output += `<span class="file">${icon} ${item}</span>  `;
        }
      }
    });

    context.output.write(output);
  }
}

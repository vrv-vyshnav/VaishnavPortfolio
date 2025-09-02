import { Command } from '../core/Command.js';
import { FileIcons } from '../utils/fileIcons.js';

export class TreeCommand extends Command {
  constructor() {
    super('tree', 'Show directory tree', { category: 'File System' });
  }

  execute(params, context) {
    const showTree = (path, prefix = '', isLast = true) => {
      const dir = context.fileSystem.getItem(path);
      if (!dir || dir.type !== 'directory') return '';

      let result = '';
      const items = Object.keys(dir.contents);
      items.forEach((item, index) => {
        const isLastItem = index === items.length - 1;
        const itemPath = path + '/' + item;
        const itemObj = dir.contents[item];

        const connector = isLastItem ? '└── ' : '├── ';
        const icon = FileIcons.getIcon(item, itemObj.type);
        
        let colorClass = 'file';
        if (itemObj.type === 'directory') {
          colorClass = 'directory';
        } else if (FileIcons.isExecutable(item)) {
          colorClass = 'executable';
        }

        result += `${prefix}${connector}<span class="${colorClass}">${icon} ${item}</span>\n`;

        if (itemObj.type === 'directory') {
          const nextPrefix = prefix + (isLastItem ? '    ' : '│   ');
          result += showTree(itemPath, nextPrefix, isLastItem);
        }
      });

      return result;
    };

    const treeOutput = showTree(context.fileSystem.currentPath);
    context.output.write(`<span class="directory">📁 .</span>\n${treeOutput}`);
  }
}

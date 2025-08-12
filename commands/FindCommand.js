import { Command } from '../core/Command.js';
import { FileIcons } from '../utils/fileIcons.js';

export class FindCommand extends Command {
  constructor() {
    super('find', 'Find files by name');
  }

  execute(params, context) {
    if (params.length === 0) {
      context.output.write(`<span class="error">find: missing argument</span>`);
      return;
    }

    const searchTerm = params[0];
    const findInDirectory = (path) => {
      const dir = context.fileSystem.getItem(path);
      if (!dir || dir.type !== 'directory') return [];

      let results = [];
      Object.keys(dir.contents).forEach(item => {
        const itemPath = path + '/' + item;
        if (item.includes(searchTerm)) {
          const itemObj = dir.contents[item];
          const icon = FileIcons.getIcon(item, itemObj.type);
          results.push({ path: itemPath, name: item, type: itemObj.type, icon });
        }

        if (dir.contents[item].type === 'directory') {
          results = results.concat(findInDirectory(itemPath));
        }
      });

      return results;
    };

    const results = findInDirectory(context.fileSystem.currentPath);
    if (results.length === 0) {
      context.output.write(`<span class="warning">No files found matching '${searchTerm}'</span>`);
    } else {
      results.forEach(result => {
        let colorClass = 'file';
        if (result.type === 'directory') {
          colorClass = 'directory';
        } else if (FileIcons.isExecutable(result.name)) {
          colorClass = 'executable';
        }
        
        context.output.write(`<span class="${colorClass}">${result.icon} ${result.path}</span>`);
      });
    }
  }
}

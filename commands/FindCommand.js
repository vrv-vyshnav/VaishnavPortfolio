import { Command } from '../core/Command.js';

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
          results.push(itemPath);
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
        context.output.write(`<span class="info">${result}</span>`);
      });
    }
  }
}

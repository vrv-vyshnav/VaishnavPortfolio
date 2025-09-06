import { Command } from '../core/Command.js';

export class RmCommand extends Command {
  constructor() {
    super('rm', 'Delete a file or directory. Use -rf to remove directories and their contents.', { category: 'File Operations' });
  }

  async execute(args, context) {
    if (args.length === 0) {
      context.output.write('<span class="error">Error: Missing argument. Usage: rm [-rf] <path></span>');
      return;
    }

    // Parse flags and arguments
    const flags = [];
    const paths = [];
    
    for (const arg of args) {
      if (arg.startsWith('-')) {
        flags.push(arg);
      } else {
        paths.push(arg);
      }
    }

    if (paths.length === 0) {
      context.output.write('<span class="error">Error: Missing path argument. Usage: rm [-rf] <path></span>');
      return;
    }

    const hasRfFlag = flags.includes('-rf') || flags.includes('-r') || flags.includes('-f');
    const path = paths[0]; // Take the first path argument

    const resolvedPath = path.startsWith('/') ? path : context.fileSystem.resolvePath(path);

    if (!context.fileSystem.exists(resolvedPath)) {
      context.output.write(`<span class="error">Error: No such file or directory: ${resolvedPath}</span>`);
      return;
    }

    const item = context.fileSystem.getItem(resolvedPath);

    if (item.type === 'directory') {
      if (!hasRfFlag) {
        context.output.write('<span class="error">Error: Use rm -rf to remove directories.</span>');
        return;
      }
      
      // Remove directory recursively
      this.removeDirectory(resolvedPath, context);
      const dirName = resolvedPath.substring(resolvedPath.lastIndexOf('/') + 1);
      context.output.write(`<span class="success">Directory ${dirName} and its contents deleted successfully.</span>`);
    } else {
      // Remove file
      this.removeFile(resolvedPath, context);
      const fileName = resolvedPath.substring(resolvedPath.lastIndexOf('/') + 1);
      context.output.write(`<span class="success">File ${fileName} deleted successfully.</span>`);
    }
  }

  removeFile(filePath, context) {
    const parentDirPath = filePath.substring(0, filePath.lastIndexOf('/'));
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);

    if (context.fileSystem.fileSystem[parentDirPath] && 
        context.fileSystem.fileSystem[parentDirPath].type === 'directory') {
      delete context.fileSystem.fileSystem[parentDirPath].contents[fileName];
    }
  }

  removeDirectory(dirPath, context) {
    const directory = context.fileSystem.fileSystem[dirPath];
    
    if (directory && directory.type === 'directory') {
      // Recursively remove all contents first
      for (const [name, item] of Object.entries(directory.contents)) {
        const itemPath = `${dirPath}/${name}`;
        
        if (item.type === 'directory') {
          this.removeDirectory(itemPath, context);
        } else {
          this.removeFile(itemPath, context);
        }
      }
      
      // Remove the directory itself
      const parentDirPath = dirPath.substring(0, dirPath.lastIndexOf('/'));
      const dirName = dirPath.substring(dirPath.lastIndexOf('/') + 1);
      
      if (context.fileSystem.fileSystem[parentDirPath] && 
          context.fileSystem.fileSystem[parentDirPath].type === 'directory') {
        delete context.fileSystem.fileSystem[parentDirPath].contents[dirName];
      }
      
      // Also remove from the main fileSystem object
      delete context.fileSystem.fileSystem[dirPath];
    }
  }
}
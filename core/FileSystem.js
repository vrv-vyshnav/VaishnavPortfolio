export class PortfolioFileSystem {
  constructor() {
    this.currentPath = '';  // Current path where the user is located
    this.userName = '';      // User's name
    this.hostName = '';      // Hostname of the system
    this.fileSystem = {};    // The file system, represented as an object
  }

  // Initialize the file system by loading data from a JSON file
  async initialize() {
    try {
      const response = await fetch('portfolio-data.json'); // Replace with actual path to JSON file
      const data = await response.json();
      
      this.userName = data.user.name;
      this.hostName = data.user.hostname;
      this.currentPath = data.user.homePath;
      this.fileSystem = this.expandFileSystem(data.fileSystem); // Expands the file system structure
    } catch (error) {
      throw new Error('Failed to load portfolio data');
    }
  }

  // Recursively expand the file system to handle nested directories
  expandFileSystem(fileSystem) {
    const expanded = {};

    function expandDirectory(path, contents) {
      expanded[path] = {
        type: 'directory',
        contents: {}
      };

      Object.keys(contents).forEach(name => {
        const item = contents[name];
        if (item.type === 'directory') {
          const subPath = path + '/' + name;
          expanded[path].contents[name] = item;
          expandDirectory(subPath, item.contents);
        } else {
          expanded[path].contents[name] = item;
        }
      });
    }

    Object.keys(fileSystem).forEach(path => {
      expandDirectory(path, fileSystem[path].contents);
    });

    return expanded;
  }

  // Get the current directory object
  getCurrentDirectory() {
    return this.fileSystem[this.currentPath];
  }

  // Resolve a path to its absolute path
  resolvePath(path) {
    if (path.startsWith('/')) {
      return path;  // Absolute path
    } else if (path === '..') {
      const parts = this.currentPath.split('/');
      parts.pop();
      return parts.join('/') || '/';
    } else if (path === '.') {
      return this.currentPath;  // Current directory
    } else {
      return this.currentPath + '/' + path;  // Relative path
    }
  }

  // Check if a given path exists in the file system
  exists(path) {
    return !!this.fileSystem[path];
  }

  // Retrieve an item (file or directory) from the file system
  getItem(path) {
    return this.fileSystem[path];
  }

  // List contents of a directory (defaults to the current directory)
  list(path = this.currentPath) {
    const dir = this.fileSystem[path];
    return dir && dir.type === 'directory' ? dir.contents : {};
  }

  // Change the current directory
  changeDirectory(path) {
    const resolvedPath = this.resolvePath(path);
    if (this.exists(resolvedPath) && this.getItem(resolvedPath).type === 'directory') {
      this.currentPath = resolvedPath;
      return true;
    }
    return false;
  }

  // Get the terminal prompt, which includes the user's home directory shorthand
  getPrompt() {
    const shortPath = this.currentPath.replace(`/home/${this.userName}`, '~');
    return `${this.userName}@${this.hostName}:${shortPath}$`;
  }
}

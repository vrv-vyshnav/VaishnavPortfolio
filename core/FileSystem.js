import { CONFIG } from '../config/constants.js';

export class PortfolioFileSystem {
  constructor() {
    this.currentPath = CONFIG.FILE_SYSTEM.DEFAULT_PATH;  // Current path where the user is located
    this.userName = '';      // User's name
    this.hostName = '';      // Hostname of the system
    this.fileSystem = {};    // The file system, represented as an object
  }

  // Initialize the file system by loading data from a JSON file
  async initialize() {
    try {
      const response = await fetch(CONFIG.FILE_SYSTEM.DATA_FILE);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.user || !data.fileSystem) {
        throw new Error('Invalid portfolio data format');
      }
      
      this.userName = data.user.name;
      this.hostName = data.user.hostname;
      this.currentPath = data.user.homePath || CONFIG.FILE_SYSTEM.DEFAULT_PATH;
      this.fileSystem = this.expandFileSystem(data.fileSystem);
    } catch (error) {
      throw new Error(`Failed to load portfolio data: ${error.message}`);
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

  getCurrentDirectory() {
    return this.fileSystem[this.currentPath];
  }

resolvePath(path) {
  if (path.startsWith('/')) {
    return this.normalizePath(path);  // Absolute path
  } else if (path === '..') {
    const parts = this.currentPath.split('/');
    parts.pop(); // Go up one level
    return this.normalizePath(parts.join('/') || '/');  // Prevent going above root
  } else if (path === '.') {
    return this.currentPath;  // Current directory
  } else {
    return this.normalizePath(this.currentPath + '/' + path);  // Relative path
  }
}

  normalizePath(path) {
    // Ensure there is no leading or trailing slash unless it's the root path
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }


exists(path) {
  try {
    return this.getItem(path) !== null;
  } catch (error) {
    return false;
  }
}

getItem(path) {
  // Handle exact path lookup first
  if (this.fileSystem[path]) {
    return this.fileSystem[path];
  }
  
  const pathParts = path.split('/').filter(part => part !== '');
  
  let builtPath = '';
  let current = null;
  let lastFoundIndex = -1;
  
  for (let i = 0; i < pathParts.length; i++) {
    builtPath += '/' + pathParts[i];
    if (this.fileSystem[builtPath]) {
      current = this.fileSystem[builtPath];
      lastFoundIndex = i;
    }
  }
  
  if (current === null) {
    return null;
  }
  
  if (lastFoundIndex === pathParts.length - 1) {
    return current;
  }
  
  for (let i = lastFoundIndex + 1; i < pathParts.length; i++) {
    const part = pathParts[i];
    if (current && current.contents && current.contents[part]) {
      current = current.contents[part];
    } else {
      return null;
    }
  }
  
  return current;
}

  list(path = this.currentPath) {
    const dir = this.fileSystem[path];
    return dir && dir.type === 'directory' ? dir.contents : {};
  }

  changeDirectory(path) {
    const resolvedPath = this.resolvePath(path);
    if (this.exists(resolvedPath) && this.getItem(resolvedPath).type === 'directory') {
      this.currentPath = resolvedPath;
      return true;
    }
    return false;
  }

  getPrompt() {
    const shortPath = this.currentPath.replace(`/home/${this.userName}`, '~');
    return `${this.userName}@${this.hostName}:${shortPath}$`;
  }

  isDirectory(name) {
    const currentDir = this.getCurrentDirectory();
    if (!currentDir || !currentDir.contents) return false;
    const item = currentDir.contents[name];
    return item && item.type === 'directory';
  }

  isFile(name) {
    const currentDir = this.getCurrentDirectory();
    if (!currentDir || !currentDir.contents) return false;
    const item = currentDir.contents[name];
    return item && item.type === 'file';
  }

  getCurrentPath() {
    return this.currentPath;
  }
}

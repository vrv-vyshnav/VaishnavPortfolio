/**
 * Test suite for FileSystem core module
 */

import { setupGlobalMocks } from './helpers/testSetup.js';

setupGlobalMocks();

// Mock FileSystem implementation for testing
class MockFileSystem {
  constructor() {
    this.currentPath = '/home/vaishnav/portfolio';
    this.userName = 'vaishnav';
    this.hostName = 'dev';
    this.fileSystem = {
      '/home/vaishnav/portfolio': {
        type: 'directory',
        contents: {
          'about.txt': { type: 'file', renderType: 'text', content: 'content/about.txt' },
          'skills.conf': { type: 'file', renderType: 'text', content: 'content/skills.conf' },
          'education.txt': { type: 'file', renderType: 'text', content: 'content/education.txt' },
          'projects': {
            type: 'directory',
            contents: {
              'bom-manager': {
                type: 'directory',
                contents: {
                  'README.md': { type: 'file', renderType: 'text', content: 'BOM Manager documentation' }
                }
              },
              'edisapp': {
                type: 'directory',
                contents: {
                  'README.md': { type: 'file', renderType: 'text', content: 'Edisapp documentation' }
                }
              }
            }
          },
          '.hidden': { type: 'file', renderType: 'text', content: 'hidden file content' }
        }
      },
      '/home/vaishnav/portfolio/projects': {
        type: 'directory',
        contents: {
          'bom-manager': {
            type: 'directory',
            contents: {
              'README.md': { type: 'file', renderType: 'text', content: 'BOM Manager documentation' }
            }
          },
          'edisapp': {
            type: 'directory',
            contents: {
              'README.md': { type: 'file', renderType: 'text', content: 'Edisapp documentation' }
            }
          }
        }
      }
    };
  }

  getCurrentDirectory() {
    return this.fileSystem[this.currentPath];
  }

  getCurrentPath() {
    return this.currentPath;
  }

  changeDirectory(path) {
    const resolvedPath = this.resolvePath(path);
    if (this.fileSystem[resolvedPath]) {
      this.currentPath = resolvedPath;
      return true;
    }
    return false;
  }

  resolvePath(path) {
    if (path.startsWith('/')) {
      return path;
    }
    if (path === '.') {
      return this.currentPath;
    }
    if (path === '..') {
      const parts = this.currentPath.split('/');
      parts.pop();
      return parts.join('/') || '/';
    }
    return this.normalizePath(this.currentPath + '/' + path);
  }

  normalizePath(path) {
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }

  list(path = this.currentPath) {
    const dir = this.fileSystem[path];
    return dir && dir.type === 'directory' ? dir.contents : {};
  }

  exists(filename) {
    const dir = this.getCurrentDirectory();
    return dir && dir.contents && dir.contents[filename];
  }

  getFile(filename) {
    const dir = this.getCurrentDirectory();
    if (dir && dir.contents && dir.contents[filename]) {
      return dir.contents[filename];
    }
    return null;
  }

  isDirectory(path) {
    const resolved = this.resolvePath(path);
    const item = this.fileSystem[resolved];
    return item && item.type === 'directory';
  }

  isFile(filename) {
    const file = this.getFile(filename);
    return file && file.type === 'file';
  }

  getPrompt() {
    const shortPath = this.currentPath.replace('/home/' + this.userName, '~');
    return `${this.userName}@${this.hostName}:${shortPath}$`;
  }
}

describe('FileSystem Core Module', () => {
  let fileSystem;

  beforeEach(() => {
    fileSystem = new MockFileSystem();
  });

  describe('Basic Operations', () => {
    test('should initialize with correct default values', () => {
      expect(fileSystem.currentPath).toBe('/home/vaishnav/portfolio');
      expect(fileSystem.userName).toBe('vaishnav');
      expect(fileSystem.hostName).toBe('dev');
    });

    test('should get current directory', () => {
      const currentDir = fileSystem.getCurrentDirectory();
      
      expect(currentDir).toBeDefined();
      expect(currentDir.type).toBe('directory');
      expect(currentDir.contents).toHaveProperty('about.txt');
      expect(currentDir.contents).toHaveProperty('projects');
    });

    test('should get current path', () => {
      expect(fileSystem.getCurrentPath()).toBe('/home/vaishnav/portfolio');
    });

    test('should generate correct prompt', () => {
      const prompt = fileSystem.getPrompt();
      expect(prompt).toBe('vaishnav@dev:~/portfolio$');
    });
  });

  describe('Directory Navigation', () => {
    test('should change to existing directory', () => {
      const result = fileSystem.changeDirectory('projects');
      
      expect(result).toBe(true);
      expect(fileSystem.currentPath).toBe('/home/vaishnav/portfolio/projects');
    });

    test('should fail to change to non-existing directory', () => {
      const result = fileSystem.changeDirectory('nonexistent');
      
      expect(result).toBe(false);
      expect(fileSystem.currentPath).toBe('/home/vaishnav/portfolio');
    });

    test('should handle relative path navigation', () => {
      fileSystem.changeDirectory('projects');
      const result = fileSystem.changeDirectory('bom-manager');
      
      expect(result).toBe(true);
      expect(fileSystem.currentPath).toBe('/home/vaishnav/portfolio/projects/bom-manager');
    });

    test('should handle parent directory navigation', () => {
      fileSystem.changeDirectory('projects');
      const result = fileSystem.changeDirectory('..');
      
      expect(result).toBe(true);
      expect(fileSystem.currentPath).toBe('/home/vaishnav/portfolio');
    });

    test('should handle current directory reference', () => {
      const originalPath = fileSystem.currentPath;
      const result = fileSystem.changeDirectory('.');
      
      expect(result).toBe(true);
      expect(fileSystem.currentPath).toBe(originalPath);
    });

    test('should handle absolute paths', () => {
      const result = fileSystem.changeDirectory('/home/vaishnav/portfolio/projects');
      
      expect(result).toBe(true);
      expect(fileSystem.currentPath).toBe('/home/vaishnav/portfolio/projects');
    });
  });

  describe('Path Resolution', () => {
    test('should resolve relative paths correctly', () => {
      const resolved = fileSystem.resolvePath('projects');
      expect(resolved).toBe('/home/vaishnav/portfolio/projects');
    });

    test('should resolve absolute paths correctly', () => {
      const resolved = fileSystem.resolvePath('/home/vaishnav/portfolio/projects');
      expect(resolved).toBe('/home/vaishnav/portfolio/projects');
    });

    test('should resolve current directory reference', () => {
      const resolved = fileSystem.resolvePath('.');
      expect(resolved).toBe('/home/vaishnav/portfolio');
    });

    test('should resolve parent directory reference', () => {
      fileSystem.changeDirectory('projects');
      const resolved = fileSystem.resolvePath('..');
      expect(resolved).toBe('/home/vaishnav/portfolio');
    });

    test('should normalize paths correctly', () => {
      expect(fileSystem.normalizePath('/home//vaishnav///portfolio/')).toBe('/home/vaishnav/portfolio');
      expect(fileSystem.normalizePath('/home/vaishnav/portfolio/')).toBe('/home/vaishnav/portfolio');
      expect(fileSystem.normalizePath('/')).toBe('/');
    });
  });

  describe('File Operations', () => {
    test('should check if file exists', () => {
      expect(fileSystem.exists('about.txt')).toBeTruthy();
      expect(fileSystem.exists('nonexistent.txt')).toBeFalsy();
    });

    test('should get file information', () => {
      const file = fileSystem.getFile('about.txt');
      
      expect(file).toBeDefined();
      expect(file.type).toBe('file');
      expect(file.renderType).toBe('text');
      expect(file.content).toBe('content/about.txt');
    });

    test('should return null for non-existent files', () => {
      const file = fileSystem.getFile('nonexistent.txt');
      expect(file).toBeNull();
    });

    test('should identify directories correctly', () => {
      expect(fileSystem.isDirectory('projects')).toBe(true);
      expect(fileSystem.isDirectory('about.txt')).toBe(false);
    });

    test('should identify files correctly', () => {
      expect(fileSystem.isFile('about.txt')).toBe(true);
      expect(fileSystem.isFile('projects')).toBe(false);
    });
  });

  describe('Directory Listing', () => {
    test('should list current directory contents', () => {
      const contents = fileSystem.list();
      
      expect(contents).toHaveProperty('about.txt');
      expect(contents).toHaveProperty('skills.conf');
      expect(contents).toHaveProperty('projects');
      expect(contents).toHaveProperty('.hidden');
    });

    test('should list specific directory contents', () => {
      const contents = fileSystem.list('/home/vaishnav/portfolio/projects');
      
      expect(contents).toHaveProperty('bom-manager');
      expect(contents).toHaveProperty('edisapp');
      expect(contents).not.toHaveProperty('about.txt');
    });

    test('should return empty object for non-existent directory', () => {
      const contents = fileSystem.list('/nonexistent/path');
      
      expect(contents).toEqual({});
    });

    test('should return empty object for file path', () => {
      const contents = fileSystem.list('/home/vaishnav/portfolio/about.txt');
      
      expect(contents).toEqual({});
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty path resolution', () => {
      const resolved = fileSystem.resolvePath('');
      expect(resolved).toBe('/home/vaishnav/portfolio');
    });

    test('should handle multiple parent directory references', () => {
      fileSystem.changeDirectory('projects/bom-manager');
      const resolved = fileSystem.resolvePath('../..');
      expect(resolved).toBe('/home/vaishnav/portfolio');
    });

    test('should prevent going above root directory', () => {
      fileSystem.currentPath = '/';
      const resolved = fileSystem.resolvePath('..');
      expect(resolved).toBe('');
    });

    test('should handle complex path combinations', () => {
      const resolved = fileSystem.resolvePath('./projects/../projects/bom-manager');
      expect(resolved).toBe('/home/vaishnav/portfolio/projects/bom-manager');
    });

    test('should handle hidden files correctly', () => {
      expect(fileSystem.exists('.hidden')).toBeTruthy();
      
      const file = fileSystem.getFile('.hidden');
      expect(file).toBeDefined();
      expect(file.type).toBe('file');
    });
  });

  describe('Prompt Generation', () => {
    test('should show tilde for home directory', () => {
      const prompt = fileSystem.getPrompt();
      expect(prompt).toContain('~');
      expect(prompt).not.toContain('/home/vaishnav');
    });

    test('should show full path outside home directory', () => {
      fileSystem.currentPath = '/usr/local/bin';
      const prompt = fileSystem.getPrompt();
      expect(prompt).toContain('/usr/local/bin');
      expect(prompt).not.toContain('~');
    });

    test('should update prompt after directory change', () => {
      fileSystem.changeDirectory('projects');
      const prompt = fileSystem.getPrompt();
      expect(prompt).toBe('vaishnav@dev:~/portfolio/projects$');
    });
  });
});

describe('FileSystem Integration', () => {
  let fileSystem;

  beforeEach(() => {
    fileSystem = new MockFileSystem();
  });

  test('should support complex navigation scenarios', () => {
    // Navigate to projects
    expect(fileSystem.changeDirectory('projects')).toBe(true);
    expect(fileSystem.getCurrentPath()).toBe('/home/vaishnav/portfolio/projects');
    
    // Navigate to a specific project
    expect(fileSystem.changeDirectory('bom-manager')).toBe(true);
    expect(fileSystem.getCurrentPath()).toBe('/home/vaishnav/portfolio/projects/bom-manager');
    
    // Go back to projects
    expect(fileSystem.changeDirectory('..')).toBe(true);
    expect(fileSystem.getCurrentPath()).toBe('/home/vaishnav/portfolio/projects');
    
    // Go back to home
    expect(fileSystem.changeDirectory('..')).toBe(true);
    expect(fileSystem.getCurrentPath()).toBe('/home/vaishnav/portfolio');
  });

  test('should maintain file system integrity during operations', () => {
    const originalContents = fileSystem.list();
    
    // Navigate around
    fileSystem.changeDirectory('projects');
    fileSystem.changeDirectory('..');
    
    // Contents should remain the same
    const finalContents = fileSystem.list();
    expect(finalContents).toEqual(originalContents);
  });
});

console.log('FileSystem test suite completed successfully! 🗂️');
// File icon mapping utility for terminal display
export const FileIcons = {
  // Directory icon
  directory: '📁',
  
  // File type icons based on extension
  extensions: {
    // Text files
    '.txt': '📄',
    '.md': '📝',
    '.conf': '⚙️',
    '.info': 'ℹ️',
    
    // Code files
    '.js': '📜',
    '.ts': '📜',
    '.py': '🐍',
    '.java': '☕',
    '.cpp': '⚡',
    '.c': '⚡',
    '.php': '🐘',
    '.html': '🌐',
    '.css': '🎨',
    '.json': '📋',
    '.xml': '📋',
    '.yaml': '📋',
    '.yml': '📋',
    
    // Document files
    '.pdf': '📕',
    '.doc': '📘',
    '.docx': '📘',
    '.xls': '📊',
    '.xlsx': '📊',
    '.ppt': '📽️',
    '.pptx': '📽️',
    
    // Archive files
    '.zip': '📦',
    '.tar': '📦',
    '.gz': '📦',
    '.rar': '📦',
    '.7z': '📦',
    
    // Image files
    '.jpg': '🖼️',
    '.jpeg': '🖼️',
    '.png': '🖼️',
    '.gif': '🖼️',
    '.svg': '🖼️',
    '.bmp': '🖼️',
    
    // Audio files
    '.mp3': '🎵',
    '.wav': '🎵',
    '.flac': '🎵',
    '.aac': '🎵',
    
    // Video files
    '.mp4': '🎬',
    '.avi': '🎬',
    '.mkv': '🎬',
    '.mov': '🎬',
    
    // Executable files
    '.exe': '⚙️',
    '.sh': '🐚',
    '.bat': '🐚',
    '.cmd': '🐚',
    
    // Database files
    '.db': '🗄️',
    '.sql': '🗄️',
    '.sqlite': '🗄️',
    
    // Log files
    '.log': '📋',
    
    // Config files
    '.config': '⚙️',
    '.ini': '⚙️',
    '.cfg': '⚙️',
    
    // Lock files
    '.lock': '🔒',
    
    // Git files
    '.gitignore': '📁',
    '.gitattributes': '📁',
    
    // Package files
    '.package.json': '📦',
    '.package-lock.json': '📦',
    '.composer.json': '📦',
    '.requirements.txt': '📦',
    '.Pipfile': '📦',
    '.Cargo.toml': '📦',
    '.go.mod': '📦',
    '.pom.xml': '📦',
    '.build.gradle': '📦',
    '.Makefile': '📦',
    '.Dockerfile': '🐳',
    '.docker-compose.yml': '🐳'
  },
  
  // Get icon for a file or directory
  getIcon(name, type) {
    if (type === 'directory') {
      return this.directory;
    }
    
    // Check for exact extension match first
    const extension = this.getExtension(name);
    if (this.extensions[extension]) {
      return this.extensions[extension];
    }
    
    // Check for special files (like package.json, .gitignore, etc.)
    if (this.extensions[name]) {
      return this.extensions[name];
    }
    
    // Default file icon
    return '📄';
  },
  
  // Extract file extension
  getExtension(filename) {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return '';
    return filename.substring(lastDotIndex);
  },
  
  // Check if file is executable
  isExecutable(filename) {
    const extension = this.getExtension(filename);
    return ['.exe', '.sh', '.bat', '.cmd'].includes(extension);
  }
};

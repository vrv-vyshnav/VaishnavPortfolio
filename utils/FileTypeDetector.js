/**
 * Centralized file type detection utility
 * Handles all file type classification logic in one place
 */
export class FileTypeDetector {
  constructor() {
    // Portfolio-specific files that are always text content
    this.portfolioTextFiles = new Set([
      'about.txt', 'skills.conf', 'experience.txt', 'education.txt',
      'contact.info', 'README.md'
    ]);

    // File extensions that are readable/viewable with text commands
    this.textFileExtensions = new Set([
      '.txt', '.md', '.conf', '.log', '.json', '.js', '.html', '.css',
      '.xml', '.yaml', '.yml', '.ini', '.cfg', '.sh', '.py', '.java',
      '.cpp', '.c', '.h', '.php', '.rb', '.pl', '.sql', '.csv'
    ]);

    // File extensions that should not be suggested for text commands
    this.binaryFileExtensions = new Set([
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.ico',
      '.mp3', '.mp4', '.avi', '.mkv', '.zip', '.rar', '.tar', '.gz',
      '.exe', '.dll', '.so', '.bin', '.iso'
    ]);

    // Commands that work better with text files
    this.textOnlyCommands = new Set(['cat', 'head', 'tail', 'grep', 'wc']);
  }

  /**
   * Get the file extension from a filename
   * @param {string} fileName - The filename to analyze
   * @returns {string|null} - The file extension (with dot) or null if no extension
   */
  getFileExtension(fileName) {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot === -1 ? null : fileName.substring(lastDot).toLowerCase();
  }

  /**
   * Check if a file is suitable for text commands
   * @param {string} fileName - The filename to check
   * @param {string} ext - Optional pre-computed extension
   * @returns {boolean} - True if the file is suitable for text commands
   */
  isTextFile(fileName, ext = null) {
    // Check if it's a known portfolio text file first
    if (this.portfolioTextFiles.has(fileName)) {
      return true;
    }

    const fileExt = ext || this.getFileExtension(fileName);

    // Check if it's explicitly a binary file that should be excluded
    if (fileExt && this.binaryFileExtensions.has(fileExt)) {
      return false;
    }

    // For other files, if no extension or text extension, consider it text
    if (!fileExt) return true; // Files without extension are likely text
    return this.textFileExtensions.has(fileExt);
  }

  /**
   * Check if a command should only work with text files
   * @param {string} command - The command name to check
   * @returns {boolean} - True if the command should only suggest text files
   */
  isTextOnlyCommand(command) {
    return this.textOnlyCommands.has(command.toLowerCase());
  }

  /**
   * Check if a filename has a binary file extension
   * @param {string} fileName - The filename to check
   * @returns {boolean} - True if the file has a binary extension
   */
  isBinaryFile(fileName) {
    const ext = this.getFileExtension(fileName);
    return ext && this.binaryFileExtensions.has(ext);
  }

  /**
   * Get all portfolio text files
   * @returns {Set<string>} - Set of portfolio text file names
   */
  getPortfolioTextFiles() {
    return new Set(this.portfolioTextFiles);
  }

  /**
   * Get all text-only commands
   * @returns {Set<string>} - Set of command names that work only with text files
   */
  getTextOnlyCommands() {
    return new Set(this.textOnlyCommands);
  }
}
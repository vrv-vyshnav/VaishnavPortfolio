import { FileIcons } from '../utils/fileIcons.js';

describe('FileIcons', () => {
  test('should return directory icon for directories', () => {
    expect(FileIcons.getIcon('folder', 'directory')).toBe('📁');
  });

  test('should return correct icon for .txt files', () => {
    expect(FileIcons.getIcon('document.txt', 'file')).toBe('📄');
  });

  test('should return correct icon for .md files', () => {
    expect(FileIcons.getIcon('README.md', 'file')).toBe('📝');
  });

  test('should return correct icon for .js files', () => {
    expect(FileIcons.getIcon('script.js', 'file')).toBe('📜');
  });

  test('should return correct icon for .pdf files', () => {
    expect(FileIcons.getIcon('document.pdf', 'file')).toBe('📕');
  });

  test('should return correct icon for .exe files', () => {
    expect(FileIcons.getIcon('program.exe', 'file')).toBe('⚙️');
  });

  test('should return default file icon for unknown extensions', () => {
    expect(FileIcons.getIcon('unknown.xyz', 'file')).toBe('📄');
  });

  test('should identify executable files correctly', () => {
    expect(FileIcons.isExecutable('script.sh')).toBe(true);
    expect(FileIcons.isExecutable('program.exe')).toBe(true);
    expect(FileIcons.isExecutable('document.txt')).toBe(false);
  });

  test('should extract file extensions correctly', () => {
    expect(FileIcons.getExtension('file.txt')).toBe('.txt');
    expect(FileIcons.getExtension('document.pdf')).toBe('.pdf');
    expect(FileIcons.getExtension('noextension')).toBe('');
    expect(FileIcons.getExtension('.hidden')).toBe('.hidden');
  });
});

import { setupGlobalMocks } from './helpers/testSetup.js';

setupGlobalMocks();

// Mock History Service with search functionality
class MockHistoryWithSearch {
  constructor() {
    this.commands = [];
    this.currentIndex = -1;
    this.maxHistorySize = 100;
  }

  add(command) {
    if (command.trim() && 
        (this.commands.length === 0 || this.commands[this.commands.length - 1] !== command)) {
      this.commands.push(command);
      if (this.commands.length > this.maxHistorySize) {
        this.commands.shift();
      }
      this.currentIndex = this.commands.length;
    }
  }

  search(term) {
    if (!term) return [];
    const searchTerm = term.toLowerCase();
    const matchingCommands = this.commands
      .map((cmd, index) => ({ cmd, index }))
      .filter(item => item.cmd.toLowerCase().startsWith(searchTerm))
      .reverse(); // Most recent first
    
    // Remove duplicates, keeping the most recent occurrence of each command
    const seen = new Set();
    return matchingCommands.filter(item => {
      if (seen.has(item.cmd)) {
        return false;
      }
      seen.add(item.cmd);
      return true;
    });
  }

  getByIndex(index) {
    return this.commands[index] || null;
  }

  getAll() {
    return [...this.commands];
  }

  clear() {
    this.commands = [];
    this.currentIndex = -1;
  }

  size() {
    return this.commands.length;
  }
}

// Mock Terminal with history search functionality
class MockTerminalWithHistorySearch {
  constructor() {
    this.history = new MockHistoryWithSearch();
    this.isSearchingHistory = false;
    this.searchTerm = '';
    this.searchResults = [];
    this.searchIndex = 0;
    this.originalInput = '';
  }

  startHistorySearch(input) {
    this.isSearchingHistory = true;
    this.searchTerm = '';
    this.searchResults = [];
    this.searchIndex = 0;
    this.originalInput = input.value;
    this.updateSearchDisplay(input);
  }

  exitHistorySearch(input) {
    this.isSearchingHistory = false;
    this.searchTerm = '';
    this.searchResults = [];
    this.searchIndex = 0;
    input.value = this.originalInput || '';
    input.style.backgroundColor = '';
    input.placeholder = '';
  }

  updateSearchTerm(input) {
    this.searchTerm = input.value;
    this.searchResults = this.history.search(this.searchTerm);
    this.searchIndex = 0;
    this.updateSearchDisplay(input);
  }

  updateSearchDisplay(input) {
    input.value = this.searchTerm;
    input.placeholder = '';
    
    if (this.searchResults.length > 0) {
      input.style.backgroundColor = '#2a4a3a';
    } else {
      input.style.backgroundColor = '#4a2a2a';
    }
  }

  navigateSearchResults(direction, input) {
    if (this.searchResults.length === 0) return;
    
    this.searchIndex += direction;
    if (this.searchIndex < 0) this.searchIndex = this.searchResults.length - 1;
    if (this.searchIndex >= this.searchResults.length) this.searchIndex = 0;
    
    this.updateSearchDisplay(input);
  }

  selectSearchResult(input) {
    if (this.searchResults.length > 0) {
      const selectedCommand = this.searchResults[this.searchIndex].cmd;
      input.value = selectedCommand;
    }
    // Don't call exitHistorySearch here as it overwrites the input value
    this.isSearchingHistory = false;
    this.searchTerm = '';
    this.searchResults = [];
    this.searchIndex = 0;
  }

  handleKeyDown(e, input) {
    // Handle Ctrl+R for history search
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      this.startHistorySearch(input);
      return true;
    }

    // Handle escape to exit history search
    if (e.key === 'Escape' && this.isSearchingHistory) {
      e.preventDefault();
      this.exitHistorySearch(input);
      return true;
    }

    // If we're in history search mode
    if (this.isSearchingHistory) {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.selectSearchResult(input);
        return true;
      } else if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'p')) {
        e.preventDefault();
        this.navigateSearchResults(-1, input);
        return true;
      } else if (e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'n')) {
        e.preventDefault();
        this.navigateSearchResults(1, input);
        return true;
      }
    }

    return false;
  }
}

describe('History Search Functionality', () => {
  let history;
  let terminal;
  let mockInput;

  beforeEach(() => {
    history = new MockHistoryWithSearch();
    terminal = new MockTerminalWithHistorySearch();
    mockInput = {
      value: '',
      style: { backgroundColor: '' },
      placeholder: '',
      focus: global.jest.fn(),
      blur: global.jest.fn()
    };
  });

  describe('History Search Basic Functionality', () => {
    beforeEach(() => {
      // Add some commands to history
      history.add('ls -la');
      history.add('cat file.txt');
      history.add('grep pattern file.txt');
      history.add('ls projects');
      history.add('cd projects');
    });

    test('should find commands containing search term', () => {
      const results = history.search('ls');
      expect(results).toHaveLength(2);
      expect(results[0].cmd).toBe('ls projects'); // Most recent first
      expect(results[1].cmd).toBe('ls -la');
    });

    test('should perform case-insensitive search', () => {
      const results = history.search('LS');
      expect(results).toHaveLength(2);
      expect(results.some(r => r.cmd === 'ls -la')).toBe(true);
      expect(results.some(r => r.cmd === 'ls projects')).toBe(true);
    });

    test('should return empty array for no matches', () => {
      const results = history.search('nonexistent');
      expect(results).toHaveLength(0);
    });

    test('should return empty array for empty search term', () => {
      const results = history.search('');
      expect(results).toHaveLength(0);
    });

    test('should search only for commands starting with term', () => {
      const results = history.search('cat');
      expect(results).toHaveLength(1);
      expect(results[0].cmd).toBe('cat file.txt');
    });

    test('should not match substrings within commands', () => {
      history.add('skills file');
      const results = history.search('ls');
      expect(results).toHaveLength(2);
      expect(results[0].cmd).toBe('ls projects');
      expect(results[1].cmd).toBe('ls -la');
      // Should not include 'skills file' even though it contains 'ls'
      expect(results.some(r => r.cmd === 'skills file')).toBe(false);
    });

    test('should remove duplicate commands from search results', () => {
      // Add the same command multiple times with other commands in between
      history.add('ls -la'); // This should be overridden by the one already in history
      history.add('cd temp');
      history.add('ls projects'); // This should be overridden by the one already in history
      history.add('pwd');
      history.add('ls -la'); // Duplicate
      
      const results = history.search('ls');
      expect(results).toHaveLength(2); // Should only show unique commands
      expect(results[0].cmd).toBe('ls -la'); // Most recent occurrence
      expect(results[1].cmd).toBe('ls projects'); // Most recent occurrence
      
      // Verify no duplicates
      const commandTexts = results.map(r => r.cmd);
      const uniqueCommands = [...new Set(commandTexts)];
      expect(commandTexts.length).toBe(uniqueCommands.length);
    });
  });

  describe('Terminal History Search Integration', () => {
    beforeEach(() => {
      // Add commands to terminal history
      terminal.history.add('echo hello');
      terminal.history.add('ls -la');
      terminal.history.add('cat README.md');
      terminal.history.add('grep test *.js');
      terminal.history.add('npm test');
    });

    test('should start history search mode', () => {
      terminal.startHistorySearch(mockInput);
      
      expect(terminal.isSearchingHistory).toBe(true);
      expect(terminal.searchTerm).toBe('');
      expect(terminal.searchResults).toEqual([]);
      expect(terminal.searchIndex).toBe(0);
    });

    test('should save original input when starting search', () => {
      mockInput.value = 'some input';
      terminal.startHistorySearch(mockInput);
      
      expect(terminal.originalInput).toBe('some input');
    });

    test('should exit history search mode', () => {
      terminal.startHistorySearch(mockInput);
      terminal.exitHistorySearch(mockInput);
      
      expect(terminal.isSearchingHistory).toBe(false);
      expect(terminal.searchTerm).toBe('');
      expect(terminal.searchResults).toEqual([]);
      expect(mockInput.style.backgroundColor).toBe('');
      expect(mockInput.placeholder).toBe('');
    });

    test('should restore original input on exit', () => {
      mockInput.value = 'original';
      terminal.startHistorySearch(mockInput);
      mockInput.value = 'changed during search';
      terminal.exitHistorySearch(mockInput);
      
      expect(mockInput.value).toBe('original');
    });
  });

  describe('Search Term Updates', () => {
    beforeEach(() => {
      terminal.history.add('git status');
      terminal.history.add('git add .');
      terminal.history.add('git commit -m "test"');
      terminal.history.add('npm install');
      terminal.history.add('npm test');
    });

    test('should update search results when term changes', () => {
      terminal.startHistorySearch(mockInput);
      mockInput.value = 'git';
      terminal.updateSearchTerm(mockInput);
      
      expect(terminal.searchTerm).toBe('git');
      expect(terminal.searchResults).toHaveLength(3);
      expect(terminal.searchIndex).toBe(0);
    });

    test('should display first match when search term updates', () => {
      terminal.startHistorySearch(mockInput);
      mockInput.value = 'npm';
      terminal.updateSearchTerm(mockInput);
      
      expect(mockInput.value).toBe('npm');
      expect(mockInput.style.backgroundColor).toBe('#2a4a3a');
      expect(mockInput.placeholder).toBe('');
    });

    test('should show no matches state', () => {
      terminal.startHistorySearch(mockInput);
      mockInput.value = 'nonexistent';
      terminal.updateSearchTerm(mockInput);
      
      expect(mockInput.value).toBe('nonexistent');
      expect(mockInput.style.backgroundColor).toBe('#4a2a2a');
      expect(mockInput.placeholder).toBe('');
    });
  });

  describe('Search Result Navigation', () => {
    beforeEach(() => {
      terminal.history.add('test command 1');
      terminal.history.add('test command 2');
      terminal.history.add('test command 3');
      
      terminal.startHistorySearch(mockInput);
      mockInput.value = 'test';
      terminal.updateSearchTerm(mockInput);
    });

    test('should navigate forward through results', () => {
      expect(mockInput.value).toBe('test'); // Search term stays in input
      expect(terminal.searchIndex).toBe(0); // First result (most recent)
      
      terminal.navigateSearchResults(1, mockInput);
      expect(mockInput.value).toBe('test');
      expect(terminal.searchIndex).toBe(1);
      
      terminal.navigateSearchResults(1, mockInput);
      expect(mockInput.value).toBe('test');
      expect(terminal.searchIndex).toBe(2);
    });

    test('should navigate backward through results', () => {
      terminal.navigateSearchResults(-1, mockInput);
      expect(mockInput.value).toBe('test'); // Search term stays in input
      expect(terminal.searchIndex).toBe(2); // Wraps to last
      
      terminal.navigateSearchResults(-1, mockInput);
      expect(mockInput.value).toBe('test');
      expect(terminal.searchIndex).toBe(1);
    });

    test('should wrap around when navigating past boundaries', () => {
      // Go past the end
      terminal.navigateSearchResults(1, mockInput);
      terminal.navigateSearchResults(1, mockInput);
      terminal.navigateSearchResults(1, mockInput); // Should wrap to first
      expect(mockInput.value).toBe('test');
      expect(terminal.searchIndex).toBe(0);
    });

    test('should handle navigation with no results', () => {
      mockInput.value = 'nomatch';
      terminal.updateSearchTerm(mockInput);
      
      terminal.navigateSearchResults(1, mockInput);
      expect(terminal.searchIndex).toBe(0); // Should not change
    });
  });

  describe('Keyboard Event Handling', () => {
    test('should handle Ctrl+R to start search', () => {
      const mockEvent = {
        ctrlKey: true,
        key: 'r',
        preventDefault: global.jest.fn()
      };
      
      const handled = terminal.handleKeyDown(mockEvent, mockInput);
      
      expect(handled).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(terminal.isSearchingHistory).toBe(true);
    });

    test('should handle Escape to exit search', () => {
      terminal.startHistorySearch(mockInput);
      
      const mockEvent = {
        key: 'Escape',
        preventDefault: global.jest.fn()
      };
      
      const handled = terminal.handleKeyDown(mockEvent, mockInput);
      
      expect(handled).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(terminal.isSearchingHistory).toBe(false);
    });

    test('should handle Enter to select result', () => {
      terminal.history.add('selected command');
      terminal.startHistorySearch(mockInput);
      mockInput.value = 'selected';
      terminal.updateSearchTerm(mockInput);
      
      const mockEvent = {
        key: 'Enter',
        preventDefault: global.jest.fn()
      };
      
      const handled = terminal.handleKeyDown(mockEvent, mockInput);
      
      expect(handled).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockInput.value).toBe('selected command');
      expect(terminal.isSearchingHistory).toBe(false);
    });

    test('should handle arrow keys for navigation', () => {
      terminal.history.add('cmd1');
      terminal.history.add('cmd2');
      terminal.startHistorySearch(mockInput);
      mockInput.value = 'cmd';
      terminal.updateSearchTerm(mockInput);
      
      const upEvent = {
        key: 'ArrowUp',
        preventDefault: global.jest.fn()
      };
      
      const handled = terminal.handleKeyDown(upEvent, mockInput);
      
      expect(handled).toBe(true);
      expect(upEvent.preventDefault).toHaveBeenCalled();
    });

    test('should handle Ctrl+P and Ctrl+N for navigation', () => {
      terminal.history.add('cmd1');
      terminal.history.add('cmd2');
      terminal.startHistorySearch(mockInput);
      mockInput.value = 'cmd';
      terminal.updateSearchTerm(mockInput);
      
      const ctrlPEvent = {
        ctrlKey: true,
        key: 'p',
        preventDefault: global.jest.fn()
      };
      
      const handled = terminal.handleKeyDown(ctrlPEvent, mockInput);
      
      expect(handled).toBe(true);
      expect(ctrlPEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Search Result Selection', () => {
    beforeEach(() => {
      terminal.history.add('command to select');
      terminal.startHistorySearch(mockInput);
      mockInput.value = 'command';
      terminal.updateSearchTerm(mockInput);
    });

    test('should select current search result', () => {
      terminal.selectSearchResult(mockInput);
      
      expect(mockInput.value).toBe('command to select');
      expect(terminal.isSearchingHistory).toBe(false);
    });

    test('should handle selection with no results', () => {
      mockInput.value = 'nomatch';
      terminal.updateSearchTerm(mockInput);
      terminal.selectSearchResult(mockInput);
      
      expect(terminal.isSearchingHistory).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty history during search', () => {
      terminal.startHistorySearch(mockInput);
      mockInput.value = 'anything';
      terminal.updateSearchTerm(mockInput);
      
      expect(terminal.searchResults).toHaveLength(0);
      expect(mockInput.style.backgroundColor).toBe('#4a2a2a');
    });

    test('should handle special characters in search term', () => {
      terminal.history.add('"test pattern" file.txt');
      terminal.startHistorySearch(mockInput);
      mockInput.value = '"test';
      terminal.updateSearchTerm(mockInput);
      
      expect(terminal.searchResults).toHaveLength(1);
      expect(terminal.searchResults[0].cmd).toBe('"test pattern" file.txt');
    });

    test('should handle very long search terms', () => {
      const longTerm = 'a'.repeat(1000);
      terminal.history.add(longTerm);
      terminal.startHistorySearch(mockInput);
      mockInput.value = longTerm.substring(0, 50);
      terminal.updateSearchTerm(mockInput);
      
      expect(terminal.searchResults).toHaveLength(1);
    });

    test('should maintain search state during rapid updates', () => {
      terminal.history.add('rapid test command');
      terminal.startHistorySearch(mockInput);
      
      // Simulate rapid typing
      ['r', 'ra', 'rap', 'rapi', 'rapid'].forEach(term => {
        mockInput.value = term;
        terminal.updateSearchTerm(mockInput);
      });
      
      expect(terminal.searchTerm).toBe('rapid');
      expect(terminal.searchResults).toHaveLength(1);
    });
  });
});
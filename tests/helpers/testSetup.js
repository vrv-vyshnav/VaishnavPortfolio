/**
 * Test setup utilities and mocks for the portfolio terminal tests
 */
import jest from 'jest-mock';

// Make jest available globally
global.jest = jest;

export const mockDOM = {
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    innerHTML: '',
    textContent: '',
    className: '',
    style: {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false,
      toggle: () => {},
    },
    setAttribute: () => {},
    getAttribute: () => null,
    appendChild: () => {},
    removeChild: () => {},
    insertBefore: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    focus: () => {},
    blur: () => {},
    click: () => {},
    scrollTop: 0,
    scrollHeight: 100,
    offsetHeight: 100,
    clientHeight: 100,
    parentNode: null,
    childNodes: [],
    children: [],
    value: '',
    checked: false,
    disabled: false,
  }),
  
  getElementById: (id) => ({
    id,
    innerHTML: '',
    textContent: '',
    appendChild: () => {},
    removeChild: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    scrollTop: 0,
    scrollHeight: 100,
    style: {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false,
    },
  }),
  
  querySelectorAll: () => [],
  querySelector: () => null,
  body: {
    appendChild: () => {},
    removeChild: () => {},
    querySelector: () => null,
  },
  head: {
    appendChild: () => {},
  },
};

export const mockWindow = {
  location: { 
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  setTimeout: (fn, delay) => setTimeout(fn, delay),
  clearTimeout: (id) => clearTimeout(id),
  setInterval: (fn, delay) => setInterval(fn, delay),
  clearInterval: (id) => clearInterval(id),
  requestAnimationFrame: (fn) => setTimeout(fn, 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
};

export const mockLocalStorage = {
  _store: {},
  getItem(key) { return this._store[key] || null; },
  setItem(key, value) { this._store[key] = String(value); },
  removeItem(key) { delete this._store[key]; },
  clear() { this._store = {}; },
  get length() { return Object.keys(this._store).length; },
  key(index) { return Object.keys(this._store)[index] || null; },
};

export const setupGlobalMocks = () => {
  global.document = mockDOM;
  global.window = mockWindow;
  global.localStorage = mockLocalStorage;
  global.navigator = {
    userAgent: 'Mozilla/5.0 (Test Browser)',
    platform: 'Test',
  };
  global.performance = {
    now: () => Date.now(),
  };
  global.Node = {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3,
    COMMENT_NODE: 8,
  };
  global.DOMParser = class {
    parseFromString(str, type) {
      const cleaned = str.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
      return {
        body: {
          innerHTML: cleaned,
          childNodes: [],
          querySelector: () => null,
          querySelectorAll: () => [],
        }
      };
    }
  };
};

export const createMockFileSystem = () => ({
  currentPath: '/home/vaishnav/portfolio',
  data: {
    '/home/vaishnav/portfolio': {
      type: 'directory',
      children: {
        'about.txt': {
          type: 'file',
          content: 'Test about content',
          size: 100,
        },
        'skills.conf': {
          type: 'file', 
          content: 'JavaScript\nPython\nReact',
          size: 50,
        },
        'projects': {
          type: 'directory',
          children: {
            'project1.md': {
              type: 'file',
              content: '# Project 1\nDescription',
              size: 75,
            },
          },
        },
      },
    },
  },
  readFile: global.jest.fn().mockResolvedValue('Mock file content'),
  listDirectory: global.jest.fn().mockReturnValue([
    { name: 'about.txt', type: 'file', size: 100 },
    { name: 'projects', type: 'directory', size: 0 },
  ]),
  changeDirectory: global.jest.fn().mockReturnValue(true),
  isDirectory: global.jest.fn().mockReturnValue(false),
  isFile: global.jest.fn().mockReturnValue(true),
  exists: global.jest.fn().mockReturnValue(true),
  getCurrentDirectory: global.jest.fn().mockReturnValue('/home/vaishnav/portfolio'),
});

export const createMockTerminal = () => ({
  currentPath: '/home/vaishnav/portfolio',
  history: [],
  output: {
    addLine: global.jest.fn(),
    addHTML: global.jest.fn(),
    addError: global.jest.fn(),
    clear: global.jest.fn(),
  },
  fileSystem: createMockFileSystem(),
  commandRegistry: {
    execute: global.jest.fn(),
    register: global.jest.fn(),
    getCommands: global.jest.fn(() => ['ls', 'cat', 'cd', 'help']),
    getCommandHelp: global.jest.fn(() => null),
  },
});

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const captureConsole = () => {
  const originalConsole = { ...console };
  const logs = [];
  
  console.log = (...args) => logs.push({ type: 'log', args });
  console.warn = (...args) => logs.push({ type: 'warn', args });
  console.error = (...args) => logs.push({ type: 'error', args });
  
  return {
    logs,
    restore: () => {
      Object.assign(console, originalConsole);
    },
  };
};
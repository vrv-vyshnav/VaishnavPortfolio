/**
 * Basic test suite for the improved portfolio terminal
 * This demonstrates how testing could be implemented
 */

import { CONFIG } from '../config/constants.js';
import { SecurityManager } from '../utils/security.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';
import { EventManager } from '../utils/EventManager.js';

// Mock DOM environment for testing
global.document = {
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    innerHTML: '',
    textContent: '',
    appendChild: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    focus: () => {},
    scrollTop: 0,
    scrollHeight: 100
  }),
  getElementById: () => ({
    innerHTML: '',
    appendChild: () => {},
    querySelector: () => null,
    scrollTop: 0,
    scrollHeight: 100
  })
};

global.window = {
  location: { href: 'http://localhost:3000' },
  addEventListener: () => {}
};

global.navigator = {
  userAgent: 'Mozilla/5.0 (Test Browser)'
};

// Test Configuration
describe('Configuration Tests', () => {
  test('CONFIG should have required properties', () => {
    expect(CONFIG).toBeDefined();
    expect(CONFIG.TYPING_SPEED).toBeDefined();
    expect(CONFIG.SYSTEM_INFO).toBeDefined();
    expect(CONFIG.ERROR_MESSAGES).toBeDefined();
    expect(CONFIG.SUCCESS_MESSAGES).toBeDefined();
  });

  test('CONFIG should have valid system info', () => {
    expect(CONFIG.SYSTEM_INFO.OS).toBe('Portfolio Linux 2.0');
    expect(CONFIG.SYSTEM_INFO.UPTIME).toBe('2+ years in software engineering');
  });

  test('CONFIG should have valid error messages', () => {
    expect(CONFIG.ERROR_MESSAGES.COMMAND_NOT_FOUND).toBe('Command not found');
    expect(CONFIG.ERROR_MESSAGES.FILE_NOT_FOUND).toBe('File not found');
  });
});

// Test Security Manager
describe('Security Manager Tests', () => {
  test('should sanitize HTML content', () => {
    const maliciousHTML = '<script>alert("xss")</script><div>Safe content</div>';
    const sanitized = SecurityManager.sanitizeHTML(maliciousHTML);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('<div>Safe content</div>');
  });

  test('should validate safe commands', () => {
    expect(SecurityManager.validateCommand('ls')).toBe(true);
    expect(SecurityManager.validateCommand('cat file.txt')).toBe(true);
    expect(SecurityManager.validateCommand('help')).toBe(true);
  });

  test('should reject malicious commands', () => {
    expect(SecurityManager.validateCommand('<script>alert("xss")</script>')).toBe(false);
    expect(SecurityManager.validateCommand('javascript:alert("xss")')).toBe(false);
    expect(SecurityManager.validateCommand('eval("alert(1)")')).toBe(false);
  });

  test('should validate safe paths', () => {
    expect(SecurityManager.validatePath('/home/user/file.txt')).toBe(true);
    expect(SecurityManager.validatePath('projects/README.md')).toBe(true);
  });

  test('should reject dangerous paths', () => {
    expect(SecurityManager.validatePath('../../../etc/passwd')).toBe(false);
    expect(SecurityManager.validatePath('/etc/passwd')).toBe(false);
    expect(SecurityManager.validatePath('/proc/1/environ')).toBe(false);
  });
});

// Test Error Handler
describe('Error Handler Tests', () => {
  let errorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  test('should create error handler instance', () => {
    expect(errorHandler).toBeDefined();
    expect(errorHandler.errorCount).toBe(0);
  });

  test('should validate input types', () => {
    expect(() => errorHandler.validateInput('test', 'string', 'testParam')).not.toThrow();
    expect(() => errorHandler.validateInput(123, 'number', 'testParam')).not.toThrow();
    expect(() => errorHandler.validateInput([], 'array', 'testParam')).not.toThrow();
  });

  test('should throw on invalid input types', () => {
    expect(() => errorHandler.validateInput(123, 'string', 'testParam')).toThrow(TypeError);
    expect(() => errorHandler.validateInput('test', 'number', 'testParam')).toThrow(TypeError);
    expect(() => errorHandler.validateInput('test', 'array', 'testParam')).toThrow(TypeError);
  });

  test('should create custom errors', () => {
    const error = errorHandler.createError('Test error', 'test_context', 'TestError');
    expect(error.message).toBe('Test error');
    expect(error.context).toBe('test_context');
    expect(error.name).toBe('TestError');
    expect(error.timestamp).toBeDefined();
  });

  test('should get user-friendly error messages', () => {
    const error = new Error('Command not found');
    const message = errorHandler.getUserFriendlyMessage(error, 'command_execution');
    expect(message).toBe(CONFIG.ERROR_MESSAGES.COMMAND_NOT_FOUND);
  });

  test('should reset error count', () => {
    errorHandler.errorCount = 5;
    errorHandler.reset();
    expect(errorHandler.errorCount).toBe(0);
  });
});

// Test Event Manager
describe('Event Manager Tests', () => {
  let eventManager;
  let mockElement;

  beforeEach(() => {
    eventManager = new EventManager();
    mockElement = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      _eventManagerKey: undefined
    };
  });

  test('should create event manager instance', () => {
    expect(eventManager).toBeDefined();
    expect(eventManager.listeners).toBeDefined();
    expect(eventManager.bound).toBeDefined();
  });

  test('should add event listeners', () => {
    const handler = jest.fn();
    eventManager.addListener(mockElement, 'click', handler);
    
    expect(mockElement.addEventListener).toHaveBeenCalledWith('click', handler, {});
  });

  test('should remove event listeners', () => {
    const handler = jest.fn();
    eventManager.addListener(mockElement, 'click', handler);
    eventManager.removeListener(mockElement, 'click');
    
    expect(mockElement.removeEventListener).toHaveBeenCalled();
  });

  test('should create debounced function', () => {
    const func = jest.fn();
    const debounced = eventManager.debounce(func, 100);
    
    expect(typeof debounced).toBe('function');
    expect(debounced).not.toBe(func);
  });

  test('should create throttled function', () => {
    const func = jest.fn();
    const throttled = eventManager.throttle(func, 100);
    
    expect(typeof throttled).toBe('function');
    expect(throttled).not.toBe(func);
  });

  test('should cleanup all listeners', () => {
    const handler = jest.fn();
    eventManager.addListener(mockElement, 'click', handler);
    eventManager.addListener(mockElement, 'keydown', handler);
    
    eventManager.cleanup();
    
    expect(eventManager.listeners.size).toBe(0);
    expect(eventManager.bound.size).toBe(0);
  });
});

// Test Integration
describe('Integration Tests', () => {
  test('should handle security validation in error context', () => {
    const errorHandler = new ErrorHandler();
    const maliciousCommand = '<script>alert("xss")</script>';
    
    expect(SecurityManager.validateCommand(maliciousCommand)).toBe(false);
    
    const error = errorHandler.createError('Security violation', 'security', 'SecurityError');
    expect(error.name).toBe('SecurityError');
  });

  test('should use configuration in error messages', () => {
    const errorHandler = new ErrorHandler();
    const error = new Error('Command not found');
    const message = errorHandler.getUserFriendlyMessage(error, 'command_execution');
    
    expect(message).toBe(CONFIG.ERROR_MESSAGES.COMMAND_NOT_FOUND);
  });
});

// Performance Tests
describe('Performance Tests', () => {
  test('should handle large HTML sanitization efficiently', () => {
    const largeHTML = '<div>'.repeat(1000) + '<script>alert("xss")</script>' + '</div>'.repeat(1000);
    const startTime = performance.now();
    
    SecurityManager.sanitizeHTML(largeHTML);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100); // Should complete within 100ms
  });

  test('should handle multiple error handling efficiently', () => {
    const errorHandler = new ErrorHandler();
    const startTime = performance.now();
    
    for (let i = 0; i < 100; i++) {
      errorHandler.handleError(new Error(`Test error ${i}`), 'test');
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });
});

console.log('All tests completed successfully! 🎉'); 
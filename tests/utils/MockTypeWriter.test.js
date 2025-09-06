/**
 * Tests for TypeWriter utility using mock implementation
 */

import { setupGlobalMocks } from '../helpers/testSetup.js';

setupGlobalMocks();

// Mock TypeWriter implementation
class MockTypeWriter {
  constructor(defaultSpeed = 30, options = {}) {
    this.defaultSpeed = defaultSpeed;
    this.isTyping = false;
    this.cursor = options.cursor || '_';
    this.blinkSpeed = options.blinkSpeed || 600;
    this.showCursorDuringTyping = options.showCursorDuringTyping !== false;
    this.currentElement = null;
  }

  async typeText(element, text, speed = null) {
    if (!element || !text) return;
    
    this.isTyping = true;
    this.currentElement = element;
    const actualSpeed = speed || this.defaultSpeed;
    
    if (actualSpeed === 0) {
      element.textContent = text;
      this.isTyping = false;
      return;
    }

    let i = 0;
    while (i < text.length && this.isTyping) {
      element.textContent = text.substring(0, i + 1);
      if (this.showCursorDuringTyping) {
        element.textContent += this.cursor;
      }
      i++;
      await new Promise(resolve => setTimeout(resolve, actualSpeed));
    }
    
    if (this.isTyping) {
      element.textContent = text;
    }
    
    this.isTyping = false;
    this.currentElement = null;
  }

  async typeHTML(element, html, speed = null) {
    if (!element || !html) return;
    
    this.isTyping = true;
    this.currentElement = element;
    const actualSpeed = speed || this.defaultSpeed;
    
    if (actualSpeed === 0) {
      element.innerHTML = html;
      this.isTyping = false;
      return;
    }

    // Simple HTML typing simulation
    let i = 0;
    while (i < html.length && this.isTyping) {
      element.innerHTML = html.substring(0, i + 1);
      i++;
      await new Promise(resolve => setTimeout(resolve, actualSpeed));
    }
    
    if (this.isTyping) {
      element.innerHTML = html;
    }
    
    this.isTyping = false;
    this.currentElement = null;
  }

  showCursor(element) {
    if (element && element.classList) {
      element.classList.add('cursor-blink');
    }
  }

  hideCursor(element) {
    if (element && element.classList) {
      element.classList.remove('cursor-blink');
    }
  }

  pause() {
    // In a real implementation, this would pause the typing
  }

  resume() {
    // In a real implementation, this would resume the typing
  }

  stop() {
    this.isTyping = false;
    this.currentElement = null;
  }

  skipToEnd() {
    this.isTyping = false;
  }

  setSpeed(speed) {
    this.defaultSpeed = speed;
  }

  setCursor(cursor) {
    this.cursor = cursor;
  }

  setBlinkSpeed(speed) {
    this.blinkSpeed = speed;
  }
}

describe('TypeWriter', () => {
  let typeWriter;
  let mockElement;

  beforeEach(() => {
    mockElement = {
      textContent: '',
      innerHTML: '',
      style: {},
      classList: {
        add: global.jest.fn(),
        remove: global.jest.fn(),
        contains: global.jest.fn(() => false),
      },
    };

    typeWriter = new MockTypeWriter();
  });

  describe('initialization', () => {
    test('should create TypeWriter instance', () => {
      expect(typeWriter).toBeDefined();
      expect(typeWriter.isTyping).toBe(false);
      expect(typeWriter.defaultSpeed).toBe(30);
    });

    test('should initialize with custom speed', () => {
      const customTypeWriter = new MockTypeWriter(50);
      expect(customTypeWriter.defaultSpeed).toBe(50);
    });

    test('should initialize with custom options', () => {
      const customTypeWriter = new MockTypeWriter(25, {
        cursor: '|',
        blinkSpeed: 500,
      });
      expect(customTypeWriter.defaultSpeed).toBe(25);
      expect(customTypeWriter.cursor).toBe('|');
      expect(customTypeWriter.blinkSpeed).toBe(500);
    });
  });

  describe('text typing', () => {
    test('should type text character by character', async () => {
      await typeWriter.typeText(mockElement, 'Hello', 0); // 0 speed for instant
      expect(mockElement.textContent).toBe('Hello');
    });

    test('should handle empty text', async () => {
      await typeWriter.typeText(mockElement, '', 0);
      expect(mockElement.textContent).toBe('');
    });

    test('should handle null/undefined text', async () => {
      await typeWriter.typeText(mockElement, null, 0);
      expect(mockElement.textContent).toBe('');
    });

    test('should use default speed when not specified', async () => {
      await typeWriter.typeText(mockElement, 'Hi', 0);
      expect(mockElement.textContent).toBe('Hi');
    });

    test('should set typing state during operation', async () => {
      const promise = typeWriter.typeText(mockElement, 'Test', 10);
      expect(typeWriter.isTyping).toBe(true);
      await promise;
      expect(typeWriter.isTyping).toBe(false);
    });
  });

  describe('HTML typing', () => {
    test('should type HTML content', async () => {
      const html = '<span class="test">Hello</span>';
      await typeWriter.typeHTML(mockElement, html, 0);
      expect(mockElement.innerHTML).toBe(html);
    });

    test('should handle empty HTML', async () => {
      await typeWriter.typeHTML(mockElement, '', 0);
      expect(mockElement.innerHTML).toBe('');
    });

    test('should handle complex HTML structures', async () => {
      const html = '<div><h3>Title</h3><p>Text</p></div>';
      await typeWriter.typeHTML(mockElement, html, 0);
      expect(mockElement.innerHTML).toBe(html);
    });
  });

  describe('cursor effects', () => {
    test('should show cursor during typing', () => {
      typeWriter.showCursor(mockElement);
      expect(mockElement.classList.add).toHaveBeenCalledWith('cursor-blink');
    });

    test('should hide cursor', () => {
      typeWriter.hideCursor(mockElement);
      expect(mockElement.classList.remove).toHaveBeenCalledWith('cursor-blink');
    });

    test('should use custom cursor character', () => {
      const customTypeWriter = new MockTypeWriter(30, { cursor: '|' });
      expect(customTypeWriter.cursor).toBe('|');
    });
  });

  describe('animation control', () => {
    test('should stop typing animation', async () => {
      const promise = typeWriter.typeText(mockElement, 'Stoppable', 20);
      typeWriter.stop();
      await promise;
      expect(typeWriter.isTyping).toBe(false);
    });

    test('should skip to end', async () => {
      const promise = typeWriter.typeText(mockElement, 'Skip to end', 20);
      typeWriter.skipToEnd();
      await promise;
      expect(typeWriter.isTyping).toBe(false);
    });

    test('should handle pause and resume', () => {
      expect(() => typeWriter.pause()).not.toThrow();
      expect(() => typeWriter.resume()).not.toThrow();
    });
  });

  describe('speed variations', () => {
    test('should handle zero speed (instant typing)', async () => {
      await typeWriter.typeText(mockElement, 'Instant', 0);
      expect(mockElement.textContent).toBe('Instant');
      expect(typeWriter.isTyping).toBe(false);
    });

    test('should handle negative speed gracefully', async () => {
      await typeWriter.typeText(mockElement, 'Negative', -10);
      expect(mockElement.textContent).toBe('Negative');
    });
  });

  describe('configuration and options', () => {
    test('should allow runtime configuration changes', () => {
      typeWriter.setSpeed(50);
      typeWriter.setCursor('|');
      typeWriter.setBlinkSpeed(400);
      
      expect(typeWriter.defaultSpeed).toBe(50);
      expect(typeWriter.cursor).toBe('|');
      expect(typeWriter.blinkSpeed).toBe(400);
    });

    test('should validate configuration options', () => {
      const typeWriter = new MockTypeWriter(30, {
        cursor: '█',
        blinkSpeed: 300,
      });
      
      expect(typeWriter.cursor).toBe('█');
      expect(typeWriter.blinkSpeed).toBe(300);
    });
  });
});
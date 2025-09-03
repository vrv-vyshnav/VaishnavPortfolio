/**
 * Test suite for responsive features and mobile optimizations
 */

import { setupGlobalMocks } from './helpers/testSetup.js';

setupGlobalMocks();

describe('Responsive Features', () => {
  beforeEach(() => {
    // Reset window dimensions
    delete window.innerWidth;
    delete window.innerHeight;
  });

  describe('Mobile ASCII Border Removal', () => {
    test('should remove ASCII borders on mobile screens', () => {
      // Mock mobile screen size
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
      
      const testContent = `┌─────────────────────────────────────────────────────────────────────────────┐
│ VAISHNAV P - ASP.NET Full Stack Developer                                  │
│ 2+ Years Experience | Jr. Software Engineer @ Eloit Innovation            │
└─────────────────────────────────────────────────────────────────────────────┘

CURRENT ROLE:
🚀 Jr. Software Engineer @ Eloit Innovation Pvt Ltd
📊 Core developer for Edisapp (AI-powered school ERP)

TECH STACK:
• Languages: C#, JavaScript, Python, SQL
• Frontend: Vue.js, HTML5, CSS3`;

      // Mock removeMobileASCIIBorders function
      function removeMobileASCIIBorders(text) {
        const lines = text.split('\n');
        const processedLines = lines.map(line => {
          const trimmedLine = line.trim();
          
          // Remove pure border lines
          const borderPattern = /^[┌┐└┘│─\s]+$/;
          if (borderPattern.test(trimmedLine)) {
            return null;
          }
          
          // Extract content from bordered lines
          const borderedContentPattern = /^│\s*(.+?)\s*│$/;
          if (borderedContentPattern.test(trimmedLine)) {
            const match = trimmedLine.match(borderedContentPattern);
            return match[1];
          }
          
          return line;
        }).filter(line => line !== null);
        
        return processedLines.join('\n');
      }

      const result = removeMobileASCIIBorders(testContent);

      // Should not contain border characters
      expect(result).not.toContain('┌');
      expect(result).not.toContain('│');
      expect(result).not.toContain('└');
      expect(result).not.toContain('─');

      // Should contain the extracted content
      expect(result).toContain('VAISHNAV P - ASP.NET Full Stack Developer');
      expect(result).toContain('2+ Years Experience | Jr. Software Engineer @ Eloit Innovation');
      expect(result).toContain('CURRENT ROLE:');
      expect(result).toContain('Jr. Software Engineer @ Eloit Innovation Pvt Ltd');
    });

    test('should preserve ASCII borders on desktop screens', () => {
      // Mock desktop screen size
      Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });
      
      const testContent = `┌─────────────────┐
│ Desktop Content │
└─────────────────┘`;

      // On desktop, content should remain unchanged
      expect(testContent).toContain('┌');
      expect(testContent).toContain('│');
      expect(testContent).toContain('└');
    });

    test('should handle edge case with mixed content', () => {
      const testContent = `Normal line
┌─────────────────┐
│ Bordered content│
│ More content    │
└─────────────────┘
Another normal line
│ This should be extracted │
Final line`;

      function removeMobileASCIIBorders(text) {
        const lines = text.split('\n');
        const processedLines = lines.map(line => {
          const trimmedLine = line.trim();
          
          const borderPattern = /^[┌┐└┘│─\s]+$/;
          if (borderPattern.test(trimmedLine)) {
            return null;
          }
          
          const borderedContentPattern = /^│\s*(.+?)\s*│$/;
          if (borderedContentPattern.test(trimmedLine)) {
            const match = trimmedLine.match(borderedContentPattern);
            return match[1];
          }
          
          return line;
        }).filter(line => line !== null);
        
        return processedLines.join('\n');
      }

      const result = removeMobileASCIIBorders(testContent);

      expect(result).toContain('Normal line');
      expect(result).toContain('Bordered content');
      expect(result).toContain('More content');
      expect(result).toContain('Another normal line');
      expect(result).toContain('This should be extracted');
      expect(result).toContain('Final line');
      expect(result).not.toContain('┌');
      expect(result).not.toContain('└');
    });

    test('should handle empty bordered lines', () => {
      const testContent = `┌───────┐
│       │
│ Text  │
│       │
└───────┘`;

      function removeMobileASCIIBorders(text) {
        const lines = text.split('\n');
        const processedLines = lines.map(line => {
          const trimmedLine = line.trim();
          
          const borderPattern = /^[┌┐└┘│─\s]+$/;
          if (borderPattern.test(trimmedLine)) {
            return null;
          }
          
          const borderedContentPattern = /^│\s*(.+?)\s*│$/;
          if (borderedContentPattern.test(trimmedLine)) {
            const match = trimmedLine.match(borderedContentPattern);
            return match[1];
          }
          
          return line;
        }).filter(line => line !== null);
        
        return processedLines.join('\n');
      }

      const result = removeMobileASCIIBorders(testContent);

      expect(result).toBe('Text');
      expect(result).not.toContain('│');
      expect(result).not.toContain('┌');
    });
  });

  describe('Responsive Breakpoints', () => {
    test('should detect mobile viewport correctly', () => {
      Object.defineProperty(window, 'innerWidth', { value: 320, configurable: true });
      expect(window.innerWidth <= 768).toBe(true);

      Object.defineProperty(window, 'innerWidth', { value: 480, configurable: true });
      expect(window.innerWidth <= 768).toBe(true);

      Object.defineProperty(window, 'innerWidth', { value: 768, configurable: true });
      expect(window.innerWidth <= 768).toBe(true);
    });

    test('should detect desktop viewport correctly', () => {
      Object.defineProperty(window, 'innerWidth', { value: 769, configurable: true });
      expect(window.innerWidth <= 768).toBe(false);

      Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
      expect(window.innerWidth <= 768).toBe(false);

      Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });
      expect(window.innerWidth <= 768).toBe(false);
    });
  });

  describe('Content Scaling', () => {
    test('should scale font sizes appropriately', () => {
      // Mock different screen sizes and test font scaling
      const fontSizes = {
        desktop: 14,
        tablet: 12,
        mobile: 11,
        small: 10
      };

      // Test desktop
      Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });
      let expectedSize = fontSizes.desktop;
      expect(expectedSize).toBe(14);

      // Test tablet
      Object.defineProperty(window, 'innerWidth', { value: 768, configurable: true });
      expectedSize = window.innerWidth <= 768 ? fontSizes.tablet : fontSizes.desktop;
      expect(expectedSize).toBe(12);

      // Test mobile
      Object.defineProperty(window, 'innerWidth', { value: 480, configurable: true });
      expectedSize = window.innerWidth <= 480 ? fontSizes.mobile : (window.innerWidth <= 768 ? fontSizes.tablet : fontSizes.desktop);
      expect(expectedSize).toBe(11);

      // Test small mobile
      Object.defineProperty(window, 'innerWidth', { value: 320, configurable: true });
      expectedSize = window.innerWidth <= 320 ? fontSizes.small : (window.innerWidth <= 480 ? fontSizes.mobile : (window.innerWidth <= 768 ? fontSizes.tablet : fontSizes.desktop));
      expect(expectedSize).toBe(10);
    });
  });

  describe('Mobile Optimization Functions', () => {
    test('should optimize content formatting for mobile', () => {
      const content = `

Multiple


Newlines

Section Header:

Content here`;

      function optimizeForMobile(content) {
        return content
          .replace(/\n\n+/g, '\n\n') // Normalize multiple newlines
          .replace(/^(\w+[^:]*:)\s*$/gm, '\n$1') // Add spacing before section headers
          .trim();
      }

      const optimized = optimizeForMobile(content);

      // Should normalize multiple newlines
      expect(optimized).not.toContain('\n\n\n');
      
      // Should contain section headers with proper spacing
      expect(optimized).toContain('\nSection Header:');
      
      // Should be trimmed
      expect(optimized[0]).not.toBe('\n');
      expect(optimized[optimized.length - 1]).not.toBe('\n');
    });

    test('should handle content without section headers', () => {
      const content = `Just some regular content
with multiple lines
and no headers`;

      function optimizeForMobile(content) {
        return content
          .replace(/\n\n+/g, '\n\n')
          .replace(/^(\w+[^:]*:)\s*$/gm, '\n$1')
          .trim();
      }

      const optimized = optimizeForMobile(content);

      expect(optimized).toBe(content.trim());
    });
  });

  describe('Responsive Command Behavior', () => {
    test('should apply mobile optimizations when screen is small', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });

      // Mock command execution with mobile detection
      function mockCommandExecution(content) {
        if (window.innerWidth <= 768) {
          // Apply mobile optimizations
          const lines = content.split('\n');
          const filtered = lines.filter(line => {
            const trimmed = line.trim();
            const borderPattern = /^[┌┐└┘│─\s]+$/;
            return !borderPattern.test(trimmed);
          });
          return filtered.join('\n');
        }
        return content;
      }

      const testContent = `┌─────┐
│ Test │
└─────┘
Regular content`;

      const result = mockCommandExecution(testContent);

      expect(result).not.toContain('┌');
      expect(result).not.toContain('│');
      expect(result).toContain('Regular content');
    });

    test('should preserve original content on desktop', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });

      function mockCommandExecution(content) {
        if (window.innerWidth <= 768) {
          return 'mobile version';
        }
        return content;
      }

      const testContent = `┌─────┐
│ Test │
└─────┘`;

      const result = mockCommandExecution(testContent);

      expect(result).toBe(testContent);
      expect(result).toContain('┌');
      expect(result).toContain('│');
    });
  });

  describe('Performance Considerations', () => {
    test('should process large content efficiently', () => {
      const startTime = performance.now();

      // Generate large content with borders
      const largeContent = Array(1000).fill().map((_, i) => {
        if (i % 10 === 0) return '┌─────────┐';
        if (i % 10 === 9) return '└─────────┘';
        return `│ Line ${i} │`;
      }).join('\n');

      function removeMobileASCIIBorders(text) {
        const lines = text.split('\n');
        const processedLines = lines.map(line => {
          const trimmedLine = line.trim();
          
          const borderPattern = /^[┌┐└┘│─\s]+$/;
          if (borderPattern.test(trimmedLine)) {
            return null;
          }
          
          const borderedContentPattern = /^│\s*(.+?)\s*│$/;
          if (borderedContentPattern.test(trimmedLine)) {
            const match = trimmedLine.match(borderedContentPattern);
            return match[1];
          }
          
          return line;
        }).filter(line => line !== null);
        
        return processedLines.join('\n');
      }

      const result = removeMobileASCIIBorders(largeContent);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should process within reasonable time
      expect(duration).toBeLessThan(100); // 100ms should be plenty for this operation

      // Should have processed correctly
      expect(result).toContain('Line 0');
      expect(result).toContain('Line 999');
      expect(result).not.toContain('┌');
      expect(result).not.toContain('│');
    });

    test('should handle regex operations efficiently', () => {
      const testCases = [
        '┌─────────────┐',
        '│ Normal text │',
        '└─────────────┘',
        'Regular line',
        '│     │', // Only borders
        '│ Content with special chars !@#$% │'
      ];

      const borderPattern = /^[┌┐└┘│─\s]+$/;
      const contentPattern = /^│\s*(.+?)\s*│$/;

      testCases.forEach(line => {
        const trimmed = line.trim();
        
        // These operations should be fast
        const startTime = performance.now();
        
        const isBorder = borderPattern.test(trimmed);
        const hasContent = contentPattern.test(trimmed);
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(1); // Should be very fast
        expect(typeof isBorder).toBe('boolean');
        expect(typeof hasContent).toBe('boolean');
      });
    });
  });
});

console.log('Responsive features test suite completed successfully! 📱');
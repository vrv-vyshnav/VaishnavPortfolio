# Test Suite Documentation

This directory contains comprehensive tests for the Portfolio Terminal project. The test suite is designed to be clean, maintainable, and provide excellent coverage of all core functionality.

## Test Structure

```
tests/
├── helpers/
│   └── testSetup.js          # Test utilities and mocks
├── core/                     # Core system tests
│   ├── FileSystem.test.js
│   ├── CommandRegistry.test.js
│   ├── Output.test.js
│   └── History.test.js
├── commands/                 # Command system tests
│   └── Commands.test.js      # All command implementations
├── utils/                    # Utility tests
│   ├── typeWriter.test.js
│   └── SystemMetrics.test.js
├── integration/              # Integration tests
│   └── Terminal.test.js      # End-to-end workflows
├── basic.test.js            # Basic functionality tests
├── fileIcons.test.js        # File icon utility tests
└── README.md                # This file
```

## Test Categories

### Unit Tests
- **Core Components**: FileSystem, CommandRegistry, Output, History
- **Commands**: Individual command implementations (ls, cat, cd, etc.)
- **Utilities**: TypeWriter, SystemMetrics, Security, ErrorHandler
- **File Icons**: Icon mapping and file type detection

### Integration Tests
- **Terminal Workflow**: Complete command execution flow
- **Multi-Terminal**: Tab management and context sharing
- **Error Recovery**: Graceful error handling and recovery
- **Performance**: Large output handling and input debouncing

### Test Helpers
- **Mock Setup**: DOM, localStorage, performance APIs
- **Test Utilities**: File system mocks, terminal mocks, timing utilities
- **Console Capture**: Logging and error capture utilities

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test Files
```bash
npm test -- tests/core/FileSystem.test.js
npm test -- tests/commands/Commands.test.js
```

### Pattern Matching
```bash
npm test -- --testNamePattern="FileSystem"
npm test -- --testPathPattern="core"
```

## Test Configuration

The test suite uses Jest with the following configuration:

- **Environment**: Node.js (with DOM mocks)
- **ES Modules**: Full ES6 module support
- **Coverage**: 80% threshold for branches, functions, lines, statements
- **Timeout**: 10 seconds per test
- **Reporters**: Text, LCOV, HTML coverage reports

## Writing Tests

### Test Structure
```javascript
describe('ComponentName', () => {
  let component;
  
  beforeEach(() => {
    // Setup for each test
    component = new ComponentName();
  });

  describe('specific functionality', () => {
    test('should do something specific', () => {
      // Test implementation
      expect(component.method()).toBe(expectedResult);
    });
  });
});
```

### Mock Usage
```javascript
import { setupGlobalMocks, createMockTerminal } from '../helpers/testSetup.js';

setupGlobalMocks(); // Sets up DOM, localStorage, etc.
const mockTerminal = createMockTerminal(); // Creates terminal mock
```

### Testing Async Operations
```javascript
test('should handle async operations', async () => {
  const result = await asyncOperation();
  expect(result).toBeDefined();
});
```

### Testing Errors
```javascript
test('should handle errors gracefully', async () => {
  await expect(operationThatFails()).rejects.toThrow('Expected error');
});
```

## Coverage Goals

The test suite aims for high coverage across all dimensions:

- **Line Coverage**: 80%+ of all code lines executed
- **Branch Coverage**: 80%+ of all conditional branches tested
- **Function Coverage**: 80%+ of all functions called
- **Statement Coverage**: 80%+ of all statements executed

## Best Practices

### Test Naming
- Use descriptive test names that explain what is being tested
- Group related tests using nested `describe` blocks
- Use "should" in test descriptions for clarity

### Test Independence
- Each test should be independent and not rely on others
- Use `beforeEach` for setup, `afterEach` for cleanup
- Mock external dependencies consistently

### Error Testing
- Test both success and failure scenarios
- Verify error messages and types
- Test edge cases and boundary conditions

### Performance Testing
- Test with large datasets when relevant
- Verify operations complete within reasonable time
- Test memory usage for long-running operations

## Continuous Integration

The test suite is designed to run in CI environments:

- All tests must pass for PRs to be merged
- Coverage thresholds must be met
- No console errors or warnings allowed
- Tests must complete within timeout limits

## Debugging Tests

### Running Single Tests
```bash
npm test -- --testNamePattern="specific test name"
```

### Debugging with Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand --no-cache
```

### Verbose Output
```bash
npm test -- --verbose
```

### Coverage Details
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Common Issues

### Module Import Errors
- Ensure all imports use `.js` extensions
- Check that mock setup is properly imported
- Verify ES module configuration

### Async Test Issues
- Use `async/await` for async operations
- Increase timeout for slow operations
- Properly mock timing functions

### Mock Problems
- Import mocks before the code being tested
- Reset mocks between tests
- Verify mock calls with proper matchers

## Contributing

When adding new features:

1. Write tests before implementation (TDD)
2. Ensure new tests follow existing patterns
3. Update this documentation if needed
4. Verify all tests pass and coverage remains high
5. Add integration tests for complex workflows

The test suite is a critical part of maintaining code quality and ensuring the portfolio terminal works reliably across different environments and use cases.
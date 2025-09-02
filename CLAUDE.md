# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an interactive terminal-style portfolio website built with vanilla JavaScript (ES6 modules). It simulates a Unix-like terminal environment where visitors can explore Vaishnav's professional information using familiar command-line tools.

## Development Commands

### Local Development
```bash
npm run start     # Start local development server on port 8000
npm run dev       # Alternative command for development server
```

### Testing
```bash
npm test          # Run Jest tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

### Code Quality
```bash
npm run lint      # Run ESLint
npm run lint:fix  # Run ESLint with auto-fix
npm run format    # Format code with Prettier
```

### Security & Audit
```bash
npm run security:audit  # Run npm security audit
```

Note: This is a static site with no build step - uses Python's built-in HTTP server for development.

## Architecture Overview

### Core System Components

**Terminal Management**: Multi-terminal system with tabbed interface
- `core/TerminalManager.js` - Manages multiple terminal instances
- `Terminal.js` - Main terminal class with command execution
- `core/TerminalContext.js` - Shared context between terminals

**Command System**: Extensible command registry
- `core/CommandRegistry.js` - Central command registration and execution
- `core/Command.js` - Base command interface
- `commands/` - Individual command implementations (ls, cat, cd, etc.)

**File System Simulation**:
- `core/FileSystem.js` - Virtual file system implementation
- `portfolio-data.json` - File system structure and portfolio content
- `content/` - HTML content files for portfolio sections

**I/O Systems**:
- `core/Output.js` - DOM-based output with HTML rendering
- `core/History.js` - Command history management
- `utils/typeWriter.js` - Typewriter animation effect

### Security & Error Handling

**Security Layer**:
- `utils/security.js` - XSS protection, input sanitization, command validation
- Path traversal prevention and dangerous protocol filtering

**Error Management**:
- `utils/ErrorHandler.js` - Centralized error handling with context-aware messages
- Input validation and error logging system

**Configuration**:
- `config/constants.js` - Centralized configuration management
- Environment-based settings and consistent messaging

### Key Features

**Multi-Terminal Support**: Users can open multiple terminal tabs
**Command Extensibility**: Easy to add new commands following the Command pattern
**Security-First**: Comprehensive input validation and XSS protection
**Portfolio Integration**: File system contains resume, skills, projects, and contact info
**Modern JavaScript**: ES6 modules, async/await, modern browser APIs

## File System Structure

The virtual file system is defined in `portfolio-data.json`:
- `/home/vaishnav/portfolio/` - Root directory
- Content files mapped to HTML files in `content/` directory
- Files include: about.txt, skills.conf, experience.log, education.md, contact.info, resume.pdf

## Adding New Commands

1. Create command class extending base Command in `commands/`
2. Implement required methods: `execute()`, `getHelp()`
3. Register command in `Terminal.js` constructor
4. Add to help system if user-facing

## Testing Strategy

- Jest configuration in `jest.config.cjs`
- Test files in `tests/` directory
- Coverage reporting enabled
- Tests focus on utilities, security, and core functionality

## Portfolio Data Management

Portfolio content is managed through:
- `portfolio-data.json` - Structure and metadata
- `content/*.html` - Individual section content
- Dynamic loading with security validation

## Browser Compatibility

- Modern browsers with ES6 module support
- No build process required
- Uses native browser APIs for DOM manipulation
- http://127.0.0.1:5502/ server runs here
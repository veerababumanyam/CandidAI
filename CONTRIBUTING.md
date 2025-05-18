# Contributing to CandidAI

Thank you for your interest in contributing to CandidAI! This document outlines our coding standards, naming conventions, and development workflow.

## Coding Standards & Naming Conventions

### JavaScript

- Use **camelCase** for variable and function names
  ```javascript
  const userName = 'John';
  function getUserData() { ... }
  ```

- Use **PascalCase** for class names
  ```javascript
  class UserProfile { ... }
  ```

- Use **UPPER_SNAKE_CASE** for constants
  ```javascript
  const MAX_RETRY_ATTEMPTS = 3;
  ```

- Limit files to a maximum of 500 lines
- Use ES6+ features where appropriate
- Use semicolons at the end of statements
- Use single quotes for strings
- Use descriptive variable and function names

### HTML/CSS

- Use **kebab-case** for HTML IDs, classes, and file names
  ```html
  <div id="user-profile" class="profile-container">...</div>
  ```

- Use semantic HTML elements
- Use CSS variables for consistent styling
- Follow the BEM (Block Element Modifier) methodology for CSS class naming when appropriate

### File Naming

- JavaScript files: **camelCase.js** (e.g., `storageUtil.js`)
- HTML files: **kebab-case.html** (e.g., `user-profile.html`)
- CSS files: **kebab-case.css** (e.g., `side-panel.css`)
- Test files: **camelCase.test.js** (e.g., `storageUtil.test.js`)

## Project Structure

```
src/
├── background/       # Service worker and background scripts
├── sidepanel/        # Side panel UI
├── options/          # Options page UI
├── content/          # Content scripts
├── offscreen/        # Offscreen document for audio processing
├── js/
│   ├── api/          # API client modules
│   ├── services/     # Service modules
│   └── utils/        # Utility functions
├── css/              # Stylesheets
└── assets/           # Static assets (fonts, images)
```

## Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow the coding standards
   - Write tests for your code
   - Keep commits small and focused
4. **Run linting and tests**
   ```
   npm run lint
   npm test
   ```
5. **Format your code**
   ```
   npm run format
   ```
6. **Submit a pull request**
   - Provide a clear description of the changes
   - Reference any related issues

## Pull Request Process

1. Ensure your code follows our coding standards
2. Update documentation if necessary
3. Include screenshots for UI changes
4. Your PR will be reviewed by at least one maintainer
5. Address any feedback from code reviews

## Commit Message Guidelines

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line

Example:
```
Add audio transcription feature

- Implement Web Speech API integration
- Add user controls for starting/stopping transcription
- Store transcription preferences

Fixes #123
```

## Code of Conduct

Please be respectful and inclusive in your interactions with others. We aim to foster a welcoming and positive community.

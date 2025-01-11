# Contributing to Priim Mobile

Thank you for your interest in contributing to Priim Mobile! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Branch Naming Convention](#branch-naming-convention)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/priim_mobile.git
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/priim_mobile.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```

## Development Process

1. Create a new branch from 'develop':
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout -b feature/your-feature
   ```

2. Make your changes following our coding standards

3. Test your changes:
   ```bash
   npm run typescript  # Type checking
   npm run lint       # Linting
   npm test          # Unit tests
   ```

4. Commit your changes following our commit message guidelines

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the documentation if needed
3. Ensure all tests pass
4. Submit PR to the 'develop' branch
5. Request review from maintainers
6. Address any feedback

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define interfaces for props and state
- Use proper type annotations
- Avoid 'any' type unless absolutely necessary

### React Native
- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Follow component file structure:
  ```typescript
  import React from 'react';
  import { StyleSheet } from 'react-native';
  
  interface Props {
    // props
  }
  
  export const Component: React.FC<Props> = ({ ...props }) => {
    return (
      // JSX
    );
  };
  
  const styles = StyleSheet.create({
    // styles
  });
  ```

### Styling
- Use StyleSheet.create for styles
- Follow naming conventions
- Keep styles close to components
- Use theme constants for colors, spacing, etc.

## Commit Message Guidelines

Follow the Conventional Commits specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

Example:
```
feat(auth): add email verification

Implement email verification flow for new users
Includes:
- Verification email sending
- Token validation
- UI for verification process

Closes #123
```

## Branch Naming Convention

- Feature: `feature/feature-name`
- Bug Fix: `fix/bug-name`
- Documentation: `docs/change-description`
- Release: `release/version-number`

Examples:
```
feature/user-authentication
fix/login-crash
docs/api-documentation
release/1.0.0
```

## Testing

- Write unit tests for new features
- Update existing tests when modifying features
- Ensure all tests pass before submitting PR
- Include both positive and negative test cases

## Documentation

- Update README.md if needed
- Document new features
- Update API documentation
- Include JSDoc comments for functions
- Add comments for complex logic

## Questions?

If you have questions, please:
1. Check existing issues
2. Create a new issue with the 'question' label
3. Ask in pull request comments

Thank you for contributing to Priim Mobile!

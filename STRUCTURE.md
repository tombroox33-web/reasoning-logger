# Project Structure

This document defines the file and directory structure for the Reasoning Logger extension.

```
reasoning-logger/
├── .vscode/
│   ├── launch.json          # Debug configurations
│   └── tasks.json           # Build tasks
├── src/
│   ├── managers/
│   │   └── LoggerManager.ts # Singleton for session management
│   ├── providers/
│   │   └── LogViewProvider.ts # Webview data provider
│   ├── services/
│   │   └── StorageService.ts # File system / Database interactions
│   ├── types/
│   │   └── index.ts         # Shared interfaces (LogEntry, Session)
│   ├── utils/
│   │   └── id.ts            # UUID generation helpers
│   ├── extension.ts         # Entry point & API exposure
│   └── test/                # Test suite
├── media/                   # Static assets for Webview
│   ├── main.css
│   └── main.js
├── package.json             # Manifest (commands, views, activationEvents)
├── PLAN.md                  # High-level design
├── RECIPE.md                # Implementation steps
├── SCHEMA.json              # Data schema
├── STRUCTURE.md             # This file
└── tsconfig.json
```

## Key Components

- **LoggerManager**: Central hub. Receives events, calls StorageService, and notifies LogViewProvider.
- **StorageService**: Handles reading/writing to `globalStorageUri`.
- **LogViewProvider**: Manages the Webview panel and handles messages from the UI.

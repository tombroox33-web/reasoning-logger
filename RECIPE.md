# Implementation Recipe

This document outlines the step-by-step process to build the Reasoning Logger extension.

## Phase 1: Foundation & Data Layer

1.  **Project Setup**
    - [ ] Initialize a new VS Code extension (already done).
    - [ ] Install dependencies: `uuid` (for IDs), `fs-extra` (for file ops).

2.  **Define Types**
    - [ ] Create `src/types.ts`.
    - [ ] Export interfaces matching `SCHEMA.json`.
    - [ ] Define `LogEntry` and `Session` interfaces.

3.  **Storage Service**
    - [ ] Create `src/services/StorageService.ts`.
    - [ ] Implement `logEvent(event: LogEntry): Promise<void>`.
    - [ ] Implement `getSessions(): Promise<Session[]>`.
    - [ ] Implement `getSessionEvents(sessionId: string): Promise<LogEntry[]>`.
    - [ ] Use a local JSONL file in the global storage path for persistence.

## Phase 2: Core Logic & API

4.  **Logger Manager**
    - [ ] Create `src/managers/LoggerManager.ts`.
    - [ ] Implement a singleton class to manage active sessions.
    - [ ] Add methods: `startSession()`, `endSession()`, `log()`.

5.  **Extension API**
    - [ ] In `src/extension.ts`, expose an API for other extensions.
    - [ ] Return an object with `log(event)` method.

## Phase 3: User Interface

6.  **Webview Provider**
    - [ ] Create `src/providers/LogViewProvider.ts` implementing `vscode.WebviewViewProvider`.
    - [ ] Register the provider in `package.json` under `contributes.views`.

7.  **Frontend (React/HTML)**
    - [ ] Build a simple React or vanilla JS UI for the Webview.
    - [ ] Components: `SessionList`, `EventTimeline`, `EventDetail`.
    - [ ] Message passing: `vscode.postMessage` to request data from extension.

## Phase 4: Integration & Polish

8.  **Commands**
    - [ ] Register commands in `package.json`:
        - `reasoning-logger.open`: Open the log viewer.
        - `reasoning-logger.export`: Export logs to JSON.

9.  **Testing**
    - [ ] Write unit tests for `StorageService`.
    - [ ] Manual test: Trigger logs via a test command and verify they appear in the UI.

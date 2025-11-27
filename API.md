# Extension API Specification

The Reasoning Logger extension exposes an API for other extensions to log their own AI events.

## Usage

Extensions can access the API using the `vscode.extensions.getExtension` method.

```typescript
const extension = vscode.extensions.getExtension('publisher.reasoning-logger');
if (extension) {
    const api = extension.exports;
    api.log({
        type: 'model_thought',
        content: 'Thinking about the user request...',
        metadata: { tokens: 15 }
    });
}
```

## API Interface

```typescript
export interface ReasoningLoggerAPI {
    /**
     * Logs a new event to the current active session.
     * If no session is active, a new one may be started automatically.
     */
    log(event: Omit<LogEntry, 'id' | 'timestamp' | 'sessionId'>): Promise<void>;

    /**
     * Manually starts a new logging session.
     * Useful for grouping related events (e.g., a specific task).
     */
    startSession(metadata?: Record<string, any>): Promise<string>; // Returns sessionId

    /**
     * Ends the current session.
     */
    endSession(): Promise<void>;
}
```

## Event Types

Refer to `SCHEMA.json` for the full definition of event objects.

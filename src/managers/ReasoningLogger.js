"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReasoningLogger = void 0;
const vscode = require("vscode");
const uuid_1 = require("uuid");
const fs = require("fs");
const path = require("path");
/**
 * Manages the creation and storage of AI reasoning events.
 * It handles session management and event creation.
 */
class ReasoningLogger {
    constructor() {
        this._events = [];
        this._sessionId = null;
        this._logDirectory = null;
        this._logFilePath = null;
        this._onDidChangeEvents = new vscode.EventEmitter();
        this.onDidChangeEvents = this._onDidChangeEvents.event;
    }
    /**
     * Starts a new logging session.
     * @returns The new session ID.
     */
    startSession(metadata) {
        this.setupLogDirectory();
        this._sessionId = (0, uuid_1.v4)();
        const startEvent = {
            id: (0, uuid_1.v4)(),
            sessionId: this._sessionId,
            timestamp: new Date().toISOString(),
            type: "system_log",
            content: `Session started: ${this._sessionId}`,
            metadata: metadata,
        };
        this._events = [startEvent];
        if (this._logDirectory) {
            this._logFilePath = path.join(this._logDirectory, `${this._sessionId}.jsonl`);
            this.writeEventToFile(startEvent);
        }
        console.log(`[ReasoningLogger] New session started: ${this._sessionId}`);
        this._onDidChangeEvents.fire();
        return this._sessionId;
    }
    /**
     * Ends the current logging session.
     */
    endSession() {
        if (!this._sessionId) {
            return;
        }
        const endEvent = {
            type: "system_log",
            content: `Session ended: ${this._sessionId}`,
        };
        this.log(endEvent);
        console.log(`[ReasoningLogger] Session ended: ${this._sessionId}`);
        this._sessionId = null;
        this._logFilePath = null;
    }
    deactivate() {
        this.endSession();
    }
    /**
     * Logs a new reasoning event.
     * @param data - The partial event data.
     */
    log(data) {
        if (!this._sessionId) {
            const newSessionId = this.startSession();
            vscode.window.showWarningMessage(`No active session. New session started: ${newSessionId}`);
            // The 'startSession' method logs the "Session started" event.
            // We must now log the original event that was passed to this method.
            // We call `log` again, but this time a session exists, so it will not recurse infinitely.
            return this.log(data);
        }
        const event = {
            ...data,
            id: (0, uuid_1.v4)(),
            sessionId: this._sessionId, // This is now safe because a session is guaranteed to exist.
            timestamp: new Date().toISOString(),
        };
        this._events.push(event);
        this.writeEventToFile(event);
        this._onDidChangeEvents.fire();
    }
    getEvents() {
        return this._events;
    }
    setupLogDirectory() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            const root = workspaceFolders[0].uri.fsPath;
            this._logDirectory = path.join(root, ".reasoning-logger", "logs");
            try {
                if (!fs.existsSync(this._logDirectory)) {
                    fs.mkdirSync(this._logDirectory, { recursive: true });
                }
            }
            catch (error) {
                console.error("Failed to create log directory:", error);
                vscode.window.showErrorMessage("Reasoning Logger: Failed to create log directory.");
                this._logDirectory = null;
            }
        }
        else {
            this._logDirectory = null;
            vscode.window.showWarningMessage("Reasoning Logger: No workspace open. Logs will not be saved to a file.");
        }
    }
    writeEventToFile(event) {
        if (this._logFilePath) {
            fs.appendFileSync(this._logFilePath, JSON.stringify(event) + "\n");
        }
    }
}
exports.ReasoningLogger = ReasoningLogger;

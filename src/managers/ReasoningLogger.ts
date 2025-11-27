import * as vscode from "vscode";
import { v4 as uuidv4 } from "uuid";
import { AIReasoningEvent } from "../types";
import * as fs from "fs";
import * as path from "path";

/**
 * Manages the creation and storage of AI reasoning events.
 * It handles session management and event creation.
 */
export class ReasoningLogger {
	private _events: AIReasoningEvent[] = [];
	private _sessionId: string | null = null;
	private _logDirectory: string | null = null;
	private _logFilePath: string | null = null;

	private _onDidChangeEvents = new vscode.EventEmitter<void>();
	public readonly onDidChangeEvents: vscode.Event<void> =
		this._onDidChangeEvents.event;

	/**
	 * Starts a new logging session.
	 * @returns The new session ID.
	 */
	public startSession(metadata?: Record<string, any>): string {
		this.setupLogDirectory();

		this._sessionId = uuidv4();
		const startEvent: AIReasoningEvent = {
			id: uuidv4(),
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
	public endSession(): void {
		if (!this._sessionId) {
			return;
		}

		const endEvent: Omit<AIReasoningEvent, "id" | "sessionId" | "timestamp"> = {
			type: "system_log",
			content: `Session ended: ${this._sessionId}`,
		};
		this.log(endEvent);

		console.log(`[ReasoningLogger] Session ended: ${this._sessionId}`);
		this._sessionId = null;
		this._logFilePath = null;
	}

	public deactivate(): void {
		this.endSession();
	}

	/**
	 * Logs a new reasoning event.
	 * @param data - The partial event data.
	 */
	public log(
		data: Omit<AIReasoningEvent, "id" | "sessionId" | "timestamp">
	): void {
		if (!this._sessionId) {
			const newSessionId = this.startSession();
			vscode.window.showWarningMessage(`No active session. New session started: ${newSessionId}`);
			// The 'startSession' method logs the "Session started" event.
			// We must now log the original event that was passed to this method.
			// We call `log` again, but this time a session exists, so it will not recurse infinitely.
			return this.log(data);
		}

		const event: AIReasoningEvent = {
			...data,
			id: uuidv4(),
			sessionId: this._sessionId!, // This is now safe because a session is guaranteed to exist.
			timestamp: new Date().toISOString(),
		};

		this._events.push(event);
		this.writeEventToFile(event);
		this._onDidChangeEvents.fire();
	}

	public getEvents(): ReadonlyArray<AIReasoningEvent> {
		return this._events;
	}

	private setupLogDirectory(): void {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders && workspaceFolders.length > 0) {
			const root = workspaceFolders[0].uri.fsPath;
			this._logDirectory = path.join(root, ".reasoning-logger", "logs");
			try {
				if (!fs.existsSync(this._logDirectory)) {
					fs.mkdirSync(this._logDirectory, { recursive: true });
				}
			} catch (error) {
				console.error("Failed to create log directory:", error);
				vscode.window.showErrorMessage("Reasoning Logger: Failed to create log directory.");
				this._logDirectory = null;
			}
		} else {
			this._logDirectory = null;
			vscode.window.showWarningMessage("Reasoning Logger: No workspace open. Logs will not be saved to a file.");
		}
	}

	private writeEventToFile(event: AIReasoningEvent): void {
		if (this._logFilePath) {
			fs.appendFileSync(this._logFilePath, JSON.stringify(event) + "\n");
		}
	}
}
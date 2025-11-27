import * as vscode from "vscode";
import { v4 as uuidv4 } from "uuid";
import { AIReasoningEvent } from "./types";

/**
 * Manages the creation and storage of AI reasoning events.
 * It handles session management and event creation.
 */
export class ReasoningLogger {
	private _events: AIReasoningEvent[] = [];
	private _sessionId: string | null = null;

	private _onDidChangeEvents = new vscode.EventEmitter<void>();
	public readonly onDidChangeEvents: vscode.Event<void> =
		this._onDidChangeEvents.event;

	/**
	 * Starts a new logging session.
	 * @returns The new session ID.
	 */
	public startSession(): string {
		this._sessionId = uuidv4();
		const startEvent: AIReasoningEvent = {
			id: uuidv4(),
			sessionId: this._sessionId,
			timestamp: new Date().toISOString(),
			type: "system_log",
			content: `Session started: ${this._sessionId}`,
		};
		this._events = [startEvent];
		console.log(`[ReasoningLogger] New session started: ${this._sessionId}`);

		this._onDidChangeEvents.fire();
		return this._sessionId;
	}

	/**
	 * Logs a new reasoning event.
	 * @param data - The partial event data.
	 */
	public log(
		data: Omit<AIReasoningEvent, "id" | "sessionId" | "timestamp">
	): void {
		if (!this._sessionId) {
			vscode.window.showWarningMessage(
				"No active reasoning session. Starting a new one."
			);
			this.startSession();
		}

		const event: AIReasoningEvent = {
			...data,
			id: uuidv4(),
			sessionId: this._sessionId!,
			timestamp: new Date().toISOString(),
		};

		this._events.push(event);
		this._onDidChangeEvents.fire();
	}

	public getEvents(): ReadonlyArray<AIReasoningEvent> {
		return this._events;
	}
}
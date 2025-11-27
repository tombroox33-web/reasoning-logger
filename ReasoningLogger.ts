import * as vscode from "vscode";
import { v4 as uuidv4 } from "uuid";
import { AIReasoningEvent, AIReasoningEventType } from "./types";

/**
 * Manages the creation and storage of AI reasoning events.
 * It handles session management and event creation.
 */
export class ReasoningLogger {
	private _events: AIReasoningEvent[] = [];
	private _sessionId: string | null = null;

	/**
	 * Starts a new logging session.
	 * @returns The new session ID.
	 */
	public startSession(): string {
		this._sessionId = uuidv4();
		this._events = [];
		this.log({
			type: "system_log",
			content: `Session started: ${this._sessionId}`,
		});
		console.log(`[ReasoningLogger] New session started: ${this._sessionId}`);
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
	}

	public getEvents(): ReadonlyArray<AIReasoningEvent> {
		return this._events;
	}
}
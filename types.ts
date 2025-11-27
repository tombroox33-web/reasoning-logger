/**
 * This file contains TypeScript type definitions that correspond to the event
 * structure defined in SCHEMA.json. Keeping them in a separate file
 * improves modularity and readability.
 */

export type AIReasoningEventType =
	| "user_prompt"
	| "model_thought"
	| "model_response"
	| "tool_call"
	| "tool_result"
	| "system_log";

export interface AIReasoningEvent {
	id: string; // uuid
	sessionId: string; // uuid
	timestamp: string; // ISO 8601 date-time
	type: AIReasoningEventType;
	content: string;
	model?: string;
	metadata?: {
		tokens?: number;
		latencyMs?: number;
		filePath?: string;
	};
	toolData?: {
		name?: string;
		arguments?: object;
		output?: string;
	};
}
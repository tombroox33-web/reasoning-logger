import * as vscode from "vscode";
import { ReasoningLogger } from "./managers/ReasoningLogger";
import { ReasoningViewProvider } from "./providers/ReasoningViewProvider";
import { AIReasoningEvent } from "./types";

/**
 * This method is called when your extension is activated.
 * Your extension is activated the very first time the command is executed.
 */
export function activate(context: vscode.ExtensionContext) {
	console.log(
		'Congratulations, your extension "reasoning-logger" is now active!'
	);

	// Create a single logger instance for the extension
	const logger = new ReasoningLogger();

	// Register the Webview View Provider
	const provider = new ReasoningViewProvider(context.extensionUri, logger);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			ReasoningViewProvider.viewType,
			provider
		)
	);

	// Register a command to start a new logging session
	const startSessionCommand = vscode.commands.registerCommand(
		"reasoning-logger.start",
		() => {
			const newSessionId = logger.startSession();
			vscode.window.showInformationMessage(
				`Reasoning Logger session started: ${newSessionId}`
			);
		}
	);

	// Register a command to end the current logging session
	const endSessionCommand = vscode.commands.registerCommand(
		"reasoning-logger.end",
		() => {
			logger.endSession();
			vscode.window.showInformationMessage(
				`Reasoning Logger session ended.`
			);
		}
	);

	context.subscriptions.push(startSessionCommand, endSessionCommand);

	context.subscriptions.push({ dispose: () => logger.deactivate() });

	// Define and return the public API for other extensions
	const api = {
		log: (
			event: Omit<AIReasoningEvent, "id" | "sessionId" | "timestamp">
		): Promise<void> => {
			logger.log(event);
			return Promise.resolve();
		},
		startSession: (
			metadata?: Record<string, any>
		): Promise<string> => {
			return Promise.resolve(logger.startSession(metadata));
		},
		endSession: (): Promise<void> => {
			logger.endSession();
			return Promise.resolve();
		},
	};

	return api;
}

export function deactivate(): void {
	// The `deactivate` method of the logger is called via the disposable subscription
	// added to the context, ensuring a clean shutdown.
}
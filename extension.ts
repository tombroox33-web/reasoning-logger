import * as vscode from "vscode";
import { ReasoningLogger } from "./ReasoningLogger";

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

	context.subscriptions.push(startSessionCommand);
}

export function deactivate() {}
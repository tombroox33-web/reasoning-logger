import * as vscode from "vscode";
import { ReasoningLogger } from "../managers/ReasoningLogger";
import { AIReasoningEvent } from "../types";

export class ReasoningViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = "reasoning-logger.view";

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
		private readonly _logger: ReasoningLogger
	) {
		this._logger.onDidChangeEvents(() => {
			if (this._view) {
				this._view.webview.html = this._getHtmlForWebview(
					this._view.webview,
					this._logger.getEvents()
				);
			}
		});
	}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri],
		};

		webviewView.webview.html = this._getHtmlForWebview(
			webviewView.webview,
			this._logger.getEvents()
		);
	}

	private _getHtmlForWebview(
		webview: vscode.Webview,
		events: ReadonlyArray<AIReasoningEvent>
	): string {
		const nonce = getNonce();
		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} data:;">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Reasoning Events</title>
				<style>
					body { font-family: var(--vscode-font-family); color: var(--vscode-editor-foreground); }
					.event { margin-bottom: 1em; padding: 0.5em; border: 1px solid var(--vscode-editorWidget-border); border-radius: 4px; }
					.event-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5em; }
					.event-header .timestamp { font-size: 0.8em; opacity: 0.7; }
					.event-type { background-color: var(--vscode-button-background); color: var(--vscode-button-foreground); padding: 2px 5px; border-radius: 3px; }
					.event-type-user_prompt { background-color: var(--vscode-terminal-ansiBlue); }
					.event-type-model_response { background-color: var(--vscode-terminal-ansiGreen); }
					.event-type-system_log { background-color: var(--vscode-terminal-ansiYellow); color: var(--vscode-terminal-ansiBlack); }
					.event-type-tool_call { background-color: var(--vscode-terminal-ansiMagenta); }
					.event-type-tool_result { background-color: var(--vscode-terminal-ansiCyan); }
					.event-content { white-space: pre-wrap; word-wrap: break-word; margin-top: 0.5em; }
					.event-meta { font-size: 0.8em; opacity: 0.7; margin-top: 0.5em; }
				</style>
			</head>
			<body>
				<h1>Session Events</h1>
				${events.length === 0
				? "<p>No events logged yet. Start a session to begin.</p>"
				: events
					.map(
						(event) => `
						<div class="event">
							<div class="event-header">
								<span class="event-type event-type-${event.type}">${event.type}</span>
								<span class="timestamp">${new Date(event.timestamp).toLocaleTimeString()}</span>
							</div>
							<div class="event-content">${escapeHtml(event.content)}</div>
							${event.metadata
								? `<dl class="event-meta">
										${Object.entries(event.metadata)
									.map(
										([key, value]) =>
											`<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(String(value))}</dd>`
									)
									.join("")}
									   </dl>`
								: ""
							}
						</div>
					`
					)
					.join("")
			}
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = "";
	const possible =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function escapeHtml(unsafe: string) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
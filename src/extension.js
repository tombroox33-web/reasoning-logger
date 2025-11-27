"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const ReasoningLogger_1 = require("./managers/ReasoningLogger");
const ReasoningViewProvider_1 = require("./providers/ReasoningViewProvider");
/**
 * This method is called when your extension is activated.
 * Your extension is activated the very first time the command is executed.
 */
function activate(context) {
    console.log('Congratulations, your extension "reasoning-logger" is now active!');
    // Create a single logger instance for the extension
    const logger = new ReasoningLogger_1.ReasoningLogger();
    // Register the Webview View Provider
    const provider = new ReasoningViewProvider_1.ReasoningViewProvider(context.extensionUri, logger);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(ReasoningViewProvider_1.ReasoningViewProvider.viewType, provider));
    // Register a command to start a new logging session
    const startSessionCommand = vscode.commands.registerCommand("reasoning-logger.start", () => {
        const newSessionId = logger.startSession();
        vscode.window.showInformationMessage(`Reasoning Logger session started: ${newSessionId}`);
    });
    // Register a command to end the current logging session
    const endSessionCommand = vscode.commands.registerCommand("reasoning-logger.end", () => {
        logger.endSession();
        vscode.window.showInformationMessage(`Reasoning Logger session ended.`);
    });
    context.subscriptions.push(startSessionCommand, endSessionCommand);
    context.subscriptions.push({ dispose: () => logger.deactivate() });
    // Define and return the public API for other extensions
    const api = {
        log: (event) => {
            logger.log(event);
            return Promise.resolve();
        },
        startSession: (metadata) => {
            return Promise.resolve(logger.startSession(metadata));
        },
        endSession: () => {
            logger.endSession();
            return Promise.resolve();
        },
    };
    return api;
}
function deactivate() {
    // The `deactivate` method of the logger is called via the disposable subscription
    // added to the context, ensuring a clean shutdown.
}

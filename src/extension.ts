// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { MCPClient } from './MCPClient';
import { get } from 'http';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "mcp-client-ext" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('mcp-client-ext.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from mcp-client-ext!');
	});

	vscode.commands.registerCommand('mcp-client-ext.getWeatherAlerts', getWeatherAlerts);
	context.subscriptions.push(disposable);
}


async function getWeatherAlerts() {
	console.log("Activating MCP client extension");
	const mcpClient = new MCPClient();

	try {
		console.log("Connecting to server");
		// Prototype - we wouldn't want to connect on each command call
		await mcpClient.connectToServer("C:\\Development\\mcp-tutorial\\weather\\build\\index.js");
		
		const input = await vscode.window.showInputBox({
			placeHolder: "Enter the state for which you want to get weather alerts",
			prompt: "Enter the state for which you want to get weather alerts",
			validateInput: (value) => {
				if (!value) {
					return "Please enter a state";
				}
				return null;
			}
		});
		if (!input) {
			return;
		}
		console.log("Input: ", input);
		const result = await mcpClient.queryWeather(input);
		
		if (result) {
			vscode.window.showInformationMessage(`Weather result: ${result}`);
		} else {
			vscode.window.showErrorMessage('Unexpected result format received from server.');
		}
	
	}catch(e) {
		console.error("Failed to connect to server: ", e);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}

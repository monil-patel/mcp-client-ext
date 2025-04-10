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
    await mcpClient.connectToServer(
      "C:\\Development\\mcp-tutorial\\weather\\build\\index.js"
    );

    const input = await vscode.window.showInputBox({
      placeHolder: "Enter the state for which you want to get weather alerts",
      prompt: "Enter the state for which you want to get weather alerts",
      validateInput: (value) => {
        if (!value) {
          return "Please enter a state";
        }
        return null;
      },
    });
    if (!input) {
      return;
    }
    console.log("Input: ", input);
    const result = await mcpClient.queryWeather(input);
    if (!result) {
      return;
    }

    const formattedResult = await formatWeatherResult(result);
    if (formattedResult) {
      vscode.window.showInformationMessage(formattedResult);
    } else {
      vscode.window.showErrorMessage(
        "Unexpected result format received from server."
      );
    }
  } catch (e) {
    console.error("Failed to connect to server: ", e);
  }
}

async function formatWeatherResult(result: string) {
  console.log("Formatting weather result: ", result);
  const craftedPrompt = [
    vscode.LanguageModelChatMessage.User(
      "convert this text into a prettier format using markdown with emojis"
    ),
    vscode.LanguageModelChatMessage.User(result),
  ];

  let chatResponse: vscode.LanguageModelChatResponse | undefined;

  const allModels = await vscode.lm.selectChatModels();

  try {
    // const models = await vscode.lm.selectChatModels();

    let [model] = await vscode.lm.selectChatModels({
      vendor: "copilot",
      family: "gpt-4o",
    });
    chatResponse = await model.sendRequest(craftedPrompt, {});
  } catch (err) {
    // Making the chat request might fail because
    // - model does not exist
    // - user consent not given
    // - quota limits were exceeded
    if (err instanceof vscode.LanguageModelError) {
      console.log(err.message, err.code, err.cause);
      if (
        err.cause instanceof Error &&
        err.cause.message.includes("off_topic")
      ) {
        console.log("User did not provide a valid state");
      }
    } else {
      // add other error handling logic
      throw err;
    }
  }

  if (!chatResponse) {
    return;
  }

  let answer = "";
  for await (const fragment of chatResponse.text) {
    answer += fragment;
  }

  return answer === "" ? "No answer" : answer;
}

// This method is called when your extension is deactivated
export function deactivate() {}

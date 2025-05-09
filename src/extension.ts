import * as fs from "fs";
import * as os from "os";
import * as path from "path";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { MCPClient } from "./MCPClient";

// ANOTHER CHANGE
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "mcp-client-ext" is now active!'
  );

  // Register the "helloWorld" command
  const disposable = vscode.commands.registerCommand(
    "mcp-client-ext.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from mcp-client-ext!");
    }
  );

  // Register the "getWeatherAlerts" command
  vscode.commands.registerCommand(
    "mcp-client-ext.getWeatherAlerts",
    getWeatherAlerts
  );
  context.subscriptions.push(disposable);
}

// Command to fetch weather alerts
async function getWeatherAlerts() {
  console.log("Activating MCP client extension");

  // Create an instance of the MCPClient to interact with the MCP server
  const mcpClient = new MCPClient();

  // Show a progress notification while performing tasks
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Fetching Weather Alerts",
      cancellable: false,
    },
    async (progress) => {
      try {
        // Step 1: Connect to the MCP server
        progress.report({ message: "Connecting to server..." });
        console.log("Connecting to server");
        await mcpClient.connectToServer(
          "C:\\Development\\mcp-tutorial\\weather\\build\\index.js"
        );

        // Step 2: Prompt the user for input (state name)
        progress.report({ message: "Waiting for user input..." });
        const input = await vscode.window.showInputBox({
          placeHolder:
            "Enter the state for which you want to get weather alerts",
          prompt: "Enter the state for which you want to get weather alerts",
          validateInput: (value) => {
            if (!value) {
              return "Please enter a state";
            }
            return null;
          },
        });
        if (!input) {
          return; // Exit if no input is provided
        }
        console.log("Input: ", input);

        // Step 3: Query the MCP server for weather alerts
        progress.report({ message: "Querying weather alerts..." });
        const result = await mcpClient.queryWeather(input);
        if (!result) {
          return; // Exit if no result is returned
        }

        // Step 4: Format the weather alerts using the VS Code chat model
        progress.report({ message: "Formatting weather alerts..." });
        const formattedResult = await formatWeatherResult(result);
        if (formattedResult) {
          progress.report({ message: "Preparing preview..." });

          // Step 5: Create a temporary Markdown file to display the formatted result
          const tempFilePath = path.join(
            os.tmpdir(),
            `weather-alert-${Date.now()}.md`
          );

          // Ensure the temp directory exists
          fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });

          // Write the formatted result to the file
          fs.writeFileSync(tempFilePath, formattedResult, "utf8");

          // Open the file in a preview editor
          const document = await vscode.workspace.openTextDocument(
            tempFilePath
          );
          await vscode.window.showTextDocument(document, {
            preview: true,
            viewColumn: vscode.ViewColumn.One,
          });

          // Trigger the "Show Preview" command for the Markdown file
          await vscode.commands.executeCommand(
            "markdown.showPreview",
            document.uri
          );
        } else {
          vscode.window.showErrorMessage(
            "Unexpected result format received from server."
          );
        }
      } catch (e) {
        console.error("Failed to connect to server: ", e);
        vscode.window.showErrorMessage("Failed to fetch weather alerts.");
      }
    }
  );
}

// Function to format the weather result using the VS Code chat model
async function formatWeatherResult(result: string) {
  console.log("Formatting weather result: ", result);

  // Step 1: Create a prompt for the chat model
  const craftedPrompt = [
    vscode.LanguageModelChatMessage.User(
      "convert this text into a prettier format using markdown with emojis"
    ),
    vscode.LanguageModelChatMessage.User(result),
  ];

  let chatResponse: vscode.LanguageModelChatResponse | undefined;

  try {
    // Step 2: Select the chat model (e.g., GPT-4o from Copilot)
    let [model] = await vscode.lm.selectChatModels({
      vendor: "copilot",
      family: "gpt-4o",
    });

    // Step 3: Send the crafted prompt to the chat model and get a response
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
      throw err; // Re-throw other errors
    }
  }

  if (!chatResponse) {
    return; // Exit if no response is received
  }

  // Step 4: Process the response from the chat model
  let answer = "";
  for await (const fragment of chatResponse.text) {
    answer += fragment;
  }

  return answer === "" ? "No answer" : answer;
}

// This method is called when your extension is deactivated
export function deactivate() {}


https://github.com/user-attachments/assets/4723966f-ebb8-4295-b1a2-b58f9f5e0fee
# mcp-client-ext README

This is the README for your extension "mcp-client-ext". After writing up a brief description, we recommend including the following sections.

## Features

This extension provides the following features:

1. **Weather Alerts Command**:
   - The extension includes a command `mcp-client-ext.getWeatherAlerts` that allows users to fetch weather alerts for a specific state.
   - Users can input the state name, and the extension connects to an MCP server to retrieve weather alerts.
   - The results are formatted into a user-friendly Markdown file and displayed in a preview editor within VS Code.

## How It Works

### MCPClient Class

The `MCPClient` class, located in `src/MCPClient.ts`, is responsible for interacting with the MCP server. It provides the following key functionalities:

- **Connecting to the MCP Server**:
  - The `connectToServer(serverScriptPath: string)` method establishes a connection to the MCP server using a specified server script.
  - It validates the server script file type (either `.js` or `.py`) and initializes a transport layer for communication.

- **Querying Weather Alerts**:
  - The `queryWeather(state: string)` method sends a request to the MCP server to fetch weather alerts for a given state.
  - It uses the `get-alerts` tool provided by the server to retrieve the data.

### Extension Commands

The extension defines commands in `src/extension.ts`:

- **`mcp-client-ext.getWeatherAlerts`**:
  - This command is registered during the extension activation.
  - It performs the following steps:
    1. Prompts the user to input a state name.
    2. Connects to the MCP server using the `MCPClient` class.
    3. Queries the server for weather alerts.
    4. Formats the results using a chat model (e.g., GPT-4o from Copilot).
    5. Displays the formatted results in a Markdown preview editor.

- **`mcp-client-ext.helloWorld`**:
  - A simple command that displays a "Hello World" message to demonstrate basic functionality.

## Requirements

- The MCP server script must be available and accessible. The default path used in the extension is `C:\Development\mcp-tutorial\weather\build\index.js`.
- Ensure that the required dependencies for the MCP server are installed and configured.

## Extension Settings

This extension does not currently contribute any custom settings.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**

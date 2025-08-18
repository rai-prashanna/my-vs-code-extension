// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Create inline completion provider, this makes suggestions inline
	const provider: vscode.InlineCompletionItemProvider = {
		provideInlineCompletionItems: async (
			document: vscode.TextDocument,
			position: vscode.Position,
			contextInline: vscode.InlineCompletionContext,
			token: vscode.CancellationToken
		): Promise<vscode.InlineCompletionItem[]> => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) return [];

			const selection = editor.selection;
			const manualKind = 0;
			const manuallyTriggered = contextInline.triggerKind === manualKind;

			// If highlighted back to front, put cursor at the end and rerun
			if (manuallyTriggered && position.isEqual(selection.start)) {
				editor.selection = new vscode.Selection(selection.start, selection.end);
				vscode.commands.executeCommand("editor.action.inlineSuggest.trigger");
				return [];
			}

			// On activation send highlighted text to LLM for suggestions
			if (manuallyTriggered && !selection.isEmpty) {
				const selectionRange = new vscode.Range(selection.start, selection.end);
				const highlighted = editor.document.getText(selectionRange);

				const payload = { data: highlighted };
				console.log("Sending payload to LLM API: ", highlighted);

				const response = await fetch('http://127.0.0.1:8000/complete/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});

				const responseText: string = (await response.json()).code;
				console.log("\nThe response is ", responseText);

				const range = new vscode.Range(selection.end, selection.end);
				return [{ insertText: "\n" + responseText, range }];
			}

			return [];
		},
	};
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('openchatmode', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from my-vscode-extension!');
		        const panel = vscode.window.createWebviewPanel(
            'reactWebview',
            'Chat Mode',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = getWebviewContent(context, panel.webview);
	});

	context.subscriptions.push(disposable);
    	// Add provider to Ruby files
	vscode.languages.registerInlineCompletionItemProvider(
		{ scheme: 'file', language: 'ruby' },
		provider
	);
}
function getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'dist', 'script.js')
    );

    return `
<!DOCTYPE html>  
<html lang="en">  
<head>  
  <meta charset="UTF-8" />  
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>  
  <title>Copilot-like UI</title>  
  <link rel="stylesheet" href="style.css" />  
  <script src="${scriptUri}"></script>  
</head>  
<body>  
  <div class="container">  
    <!-- Sidebar -->  
    <aside class="sidebar">  
      <h2>🤖 ERIS expert</h2>  
      <nav>  
        <ul>  
          <li class="active">Ask me anything about eris codebase</li>
        </ul>  
      </nav>  
    </aside>  
  
    <!-- Main Chat Area -->  
    <main class="chat-area">  
      <div class="messages" id="messages">  
        <!-- Messages will be dynamically added here -->  
        <div class="message bot">  
          <div class="avatar">🤖</div>  
          <div class="bubble">Hello! How can I help you today?</div>  
        </div>  
      </div>  
  
      <!-- Input Box -->  
      <div class="input-area">  
        <input type="text" id="chatInput" style="width: 90%;" placeholder="Type your question here..." />  
        <button id="sendBtn">➤</button>  
      </div>  
    </main>  
  </div>  
</body>  
</html>  
    `;
}
// This method is called when your extension is deactivated
export function deactivate() {}

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(__webpack_require__(1));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Create inline completion provider, this makes suggestions inline
    // Create inline completion provider, this makes suggestions inline
    const provider = {
        provideInlineCompletionItems: async (document, position, contextInline, token) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor)
                return [];
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
                const responseText = (await response.json()).code;
                console.log("\nThe response is ", responseText);
                const range = new vscode.Range(selection.end, selection.end);
                return [{ insertText: "\n" + responseText, range }];
            }
            return [];
        },
    };
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "openchatmode" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('openchatmode', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from my-vscode-extension!');
        const panel = vscode.window.createWebviewPanel('reactWebview', 'Chat Mode', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = getWebviewContent(context, panel.webview);
    });
    context.subscriptions.push(disposable);
    // Add provider to Ruby files
    vscode.languages.registerInlineCompletionItemProvider({ scheme: 'file', language: 'ruby' }, provider);
}
function getWebviewContent(context, webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'dist', 'webview.js'));
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body>
        <div id="root"></div>
		<script src="${scriptUri}"></script>
    </body>
    </html>
    `;
}
// This method is called when your extension is deactivated
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=second-extension.js.map
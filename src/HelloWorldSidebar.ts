import * as vscode from "vscode";

export class HelloWorldSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "helloWorldSidebar";
  constructor(private readonly _context: vscode.ExtensionContext) {}
  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.html = `<h1>Hello, World!</h1>`;
  }
}
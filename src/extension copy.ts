import * as vscode from 'vscode';
import { HelloWorldSidebarProvider } from './HelloWorldSidebar';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      HelloWorldSidebarProvider.viewType,
      new HelloWorldSidebarProvider(context),
      {
        webviewOptions: { retainContextWhenHidden: true }
      }
    )
  );
}

export function deactivate() {}
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ClosingLabelsDecorations from './closing-labels-decorations';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const closingLabelsDecorations = new ClosingLabelsDecorations();

  context.subscriptions.push(closingLabelsDecorations);
  context.subscriptions.push(
    vscode.commands.registerCommand('htmlEndTagLabels.toggleEnabled', async () => {
      const configuration = vscode.workspace.getConfiguration('htmlEndTagLabels');
      const isEnabled = configuration.get('enabled', true);

      await configuration.update('enabled', !isEnabled, vscode.ConfigurationTarget.Global);

      void vscode.window.setStatusBarMessage(
        `HTML End Tag Labels ${!isEnabled ? 'enabled' : 'disabled'}`,
        3000
      );
    })
  );
}

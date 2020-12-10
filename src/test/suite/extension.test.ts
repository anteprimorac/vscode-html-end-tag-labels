import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { after, before, test } from 'mocha';
import ClosingLabelsDecorations from '../../closing-labels-decorations';

suite('Extension Test Suite', () => {
	before(() => {
		vscode.window.showInformationMessage('Start all tests.');
	});

	after(() => {
		vscode.window.showInformationMessage('All tests done!');
	});

	test('Check generated html decorations', async () => {
		const document = await vscode.workspace.openTextDocument({
			language: 'html',
			content: `<html>
	<head>
		<title>Test Document</title>
	</head>
	<body>
		<div id="test-id">
		</div>
		<div class="test-class">
		</div>
		<div class="test-both-class" id="test-both-id">
		</div>
		<div class="test-inline-class"></div>
		<div id="test-inline-id"></div>
		<div id="test-inline-both-id" class="test-inline-both-class"></div>
	</body>
</html>`,
		});

		const labels = new ClosingLabelsDecorations();

		assert.deepStrictEqual(
			labels.getDocumentDecorations(document),
			[
				{
					range: new vscode.Range(
						new vscode.Position(6, 2),
						new vscode.Position(6, 8),
					),
					renderOptions: { after: { contentText: '/#test-id' } },
				},
				{
					range: new vscode.Range(
						new vscode.Position(8, 2),
						new vscode.Position(8, 8),
					),
					renderOptions: { after: { contentText: '/.test-class' } },
				},
				{
					range: new vscode.Range(
						new vscode.Position(10, 2),
						new vscode.Position(10, 8),
					),
					renderOptions: { after: { contentText: '/#test-both-id.test-both-class' } },
				},
			],
		);
	});
});

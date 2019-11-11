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

		assert.deepEqual(
			labels.getDocumentDecorations(document),
			[
				{
					range: {
						_end: { _character: 8, _line: 6 },
						_start: { _character: 2, _line: 6 },
					},
					renderOptions: { after: { contentText: '/#test-id' } },
				},
				{
					range: {
						_end: { _character: 8, _line: 8 },
						_start: { _character: 2, _line: 8 },
					},
					renderOptions: { after: { contentText: '/.test-class' } },
				},
				{
					range: {
						_end: { _character: 8, _line: 10 },
						_start: { _character: 2, _line: 10 },
					},
					renderOptions: { after: { contentText: '/#test-both-id.test-both-class' } },
				},
			],
		);
	});
});

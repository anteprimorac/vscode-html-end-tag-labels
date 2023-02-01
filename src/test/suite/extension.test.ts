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

    assert.deepStrictEqual(labels.getHTMLDocumentDecorations(document), [
      {
        range: new vscode.Range(new vscode.Position(6, 4), new vscode.Position(6, 10)),
        renderOptions: { after: { contentText: '/#test-id' } },
      },
      {
        range: new vscode.Range(new vscode.Position(8, 4), new vscode.Position(8, 10)),
        renderOptions: { after: { contentText: '/.test-class' } },
      },
      {
        range: new vscode.Range(new vscode.Position(10, 4), new vscode.Position(10, 10)),
        renderOptions: {
          after: { contentText: '/#test-both-id.test-both-class' },
        },
      },
    ]);
  });

  test('Check generated javascriptreact decorations', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'javascriptreact',
      content: `import * as React from 'react';

function Component() {
  return (
    <div>
      <div id="test-id">
      </div>
      <div className="test-class">
      </div>
      <div className="test-both-class" id="test-both-id">
      </div>
      <div className="test-inline-class"></div>
      <div id="test-inline-id"></div>
      <div id="test-inline-both-id" class="test-inline-both-class"></div>
    </div>
  );
}

export default Component;
`,
    });

    const labels = new ClosingLabelsDecorations();

    assert.deepStrictEqual(labels.getJSXDocumentDecorations(document), [
      {
        range: new vscode.Range(new vscode.Position(6, 6), new vscode.Position(6, 12)),
        renderOptions: { after: { contentText: '/#test-id' } },
      },
      {
        range: new vscode.Range(new vscode.Position(8, 6), new vscode.Position(8, 12)),
        renderOptions: { after: { contentText: '/.test-class' } },
      },
      {
        range: new vscode.Range(new vscode.Position(10, 6), new vscode.Position(10, 12)),
        renderOptions: {
          after: { contentText: '/#test-both-id.test-both-class' },
        },
      },
    ]);
  });

  test('Check generated javascript decorations', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'javascript',
      content: `import * as React from 'react';

function Component() {
  return (
    <div>
      <div id="test-id">
      </div>
      <div className="test-class">
      </div>
      <div className="test-both-class" id="test-both-id">
      </div>
      <div className="test-inline-class"></div>
      <div id="test-inline-id"></div>
      <div id="test-inline-both-id" class="test-inline-both-class"></div>
    </div>
  );
}

export default Component;
`,
    });

    const labels = new ClosingLabelsDecorations();

    assert.deepStrictEqual(labels.getJSXDocumentDecorations(document), [
      {
        range: new vscode.Range(new vscode.Position(6, 6), new vscode.Position(6, 12)),
        renderOptions: { after: { contentText: '/#test-id' } },
      },
      {
        range: new vscode.Range(new vscode.Position(8, 6), new vscode.Position(8, 12)),
        renderOptions: { after: { contentText: '/.test-class' } },
      },
      {
        range: new vscode.Range(new vscode.Position(10, 6), new vscode.Position(10, 12)),
        renderOptions: {
          after: { contentText: '/#test-both-id.test-both-class' },
        },
      },
    ]);
  });

  test('Check generated typescriptreact decorations', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'typescriptreact',
      content: `import * as React from 'react';

const Component: React.VFC<{ test: string }> = ({ test }) => {
  return (
    <div>
      <div id="test-id">
        {test}
      </div>
      <div className="test-class">
      </div>
      <div className="test-both-class" id="test-both-id">
      </div>
      <div className="test-inline-class"></div>
      <div id="test-inline-id"></div>
      <div id="test-inline-both-id" class="test-inline-both-class"></div>
    </div>
  );
}

export default Component;
`,
    });

    const labels = new ClosingLabelsDecorations();

    assert.deepStrictEqual(labels.getJSXDocumentDecorations(document, { typescript: true }), [
      {
        range: new vscode.Range(new vscode.Position(7, 6), new vscode.Position(7, 12)),
        renderOptions: { after: { contentText: '/#test-id' } },
      },
      {
        range: new vscode.Range(new vscode.Position(9, 6), new vscode.Position(9, 12)),
        renderOptions: { after: { contentText: '/.test-class' } },
      },
      {
        range: new vscode.Range(new vscode.Position(11, 6), new vscode.Position(11, 12)),
        renderOptions: {
          after: { contentText: '/#test-both-id.test-both-class' },
        },
      },
    ]);
  });
});

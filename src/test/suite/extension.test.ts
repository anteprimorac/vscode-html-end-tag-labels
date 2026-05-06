import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { after, afterEach, before, beforeEach, test } from 'mocha';
import ClosingLabelsDecorations from '../../closing-labels-decorations';

suite('Extension Test Suite', () => {
  let originalEnabled = true;
  let originalLabelMode = 'idAndClass';

  before(() => {
    vscode.window.showInformationMessage('Start all tests.');
  });

  before(async () => {
    const configuration = vscode.workspace.getConfiguration('htmlEndTagLabels');

    originalEnabled = configuration.get<boolean>('enabled', true);
    originalLabelMode = configuration.get<string>('labelMode', 'idAndClass');

    await configuration.update('enabled', true, vscode.ConfigurationTarget.Global);
    await configuration.update('labelMode', 'idAndClass', vscode.ConfigurationTarget.Global);
  });

  beforeEach(async () => {
    const configuration = vscode.workspace.getConfiguration('htmlEndTagLabels');

    await configuration.update('enabled', true, vscode.ConfigurationTarget.Global);
    await configuration.update('labelMode', 'idAndClass', vscode.ConfigurationTarget.Global);
  });

  afterEach(async () => {
    const configuration = vscode.workspace.getConfiguration('htmlEndTagLabels');

    await configuration.update('enabled', true, vscode.ConfigurationTarget.Global);
    await configuration.update('labelMode', 'idAndClass', vscode.ConfigurationTarget.Global);
  });

  after(async () => {
    const configuration = vscode.workspace.getConfiguration('htmlEndTagLabels');

    await configuration.update('enabled', originalEnabled, vscode.ConfigurationTarget.Global);
    await configuration.update('labelMode', originalLabelMode, vscode.ConfigurationTarget.Global);

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
      <Box id="test-custom-id">
      </Box>
      <Box className="test-custom-class">
      </Box>
      <Box className="test-custom-both-class" id="test-custom-both-id">
      </Box>
      <Box className="test-custom-inline-class"></Box>
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
      {
        range: new vscode.Range(new vscode.Position(15, 6), new vscode.Position(15, 12)),
        renderOptions: { after: { contentText: '/#test-custom-id' } },
      },
      {
        range: new vscode.Range(new vscode.Position(17, 6), new vscode.Position(17, 12)),
        renderOptions: { after: { contentText: '/.test-custom-class' } },
      },
      {
        range: new vscode.Range(new vscode.Position(19, 6), new vscode.Position(19, 12)),
        renderOptions: {
          after: { contentText: '/#test-custom-both-id.test-custom-both-class' },
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
      <Box id="test-custom-id">
      </Box>
      <Box className="test-custom-class">
      </Box>
      <Box className="test-custom-both-class" id="test-custom-both-id">
      </Box>
      <Box className="test-custom-inline-class"></Box>
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
      {
        range: new vscode.Range(new vscode.Position(16, 6), new vscode.Position(16, 12)),
        renderOptions: { after: { contentText: '/#test-custom-id' } },
      },
      {
        range: new vscode.Range(new vscode.Position(18, 6), new vscode.Position(18, 12)),
        renderOptions: { after: { contentText: '/.test-custom-class' } },
      },
      {
        range: new vscode.Range(new vscode.Position(20, 6), new vscode.Position(20, 12)),
        renderOptions: {
          after: { contentText: '/#test-custom-both-id.test-custom-both-class' },
        },
      },
    ]);
  });

  test('Check generated html decorations in id only mode', async () => {
    const configuration = vscode.workspace.getConfiguration('htmlEndTagLabels');

    await configuration.update('labelMode', 'id', vscode.ConfigurationTarget.Global);

    const document = await vscode.workspace.openTextDocument({
      language: 'html',
      content: `<div id="test-id">
</div>
<div class="test-class">
</div>
<div id="test-both-id" class="test-both-class">
</div>`,
    });

    const labels = new ClosingLabelsDecorations();

    assert.deepStrictEqual(labels.getHTMLDocumentDecorations(document), [
      {
        range: new vscode.Range(new vscode.Position(1, 0), new vscode.Position(1, 6)),
        renderOptions: { after: { contentText: '/#test-id' } },
      },
      {
        range: new vscode.Range(new vscode.Position(5, 0), new vscode.Position(5, 6)),
        renderOptions: { after: { contentText: '/#test-both-id' } },
      },
    ]);
  });

  test('Check generated jsx decorations in class only mode', async () => {
    const configuration = vscode.workspace.getConfiguration('htmlEndTagLabels');

    await configuration.update('labelMode', 'class', vscode.ConfigurationTarget.Global);

    const document = await vscode.workspace.openTextDocument({
      language: 'javascriptreact',
      content: `function Component() {
  return (
    <>
      <div id="test-id">
      </div>
      <div className="test-class other-class">
      </div>
      <div id="test-both-id" className="test-both-class">
      </div>
    </>
  );
}`,
    });

    const labels = new ClosingLabelsDecorations();

    assert.deepStrictEqual(labels.getJSXDocumentDecorations(document), [
      {
        range: new vscode.Range(new vscode.Position(5, 6), new vscode.Position(5, 12)),
        renderOptions: { after: { contentText: '/.test-class.other-class' } },
      },
      {
        range: new vscode.Range(new vscode.Position(7, 6), new vscode.Position(7, 12)),
        renderOptions: { after: { contentText: '/.test-both-class' } },
      },
    ]);
  });

  test('Check toggle command updates enabled setting', async () => {
    const extension = vscode.extensions.getExtension('anteprimorac.html-end-tag-labels');
    const configuration = vscode.workspace.getConfiguration('htmlEndTagLabels');

    await extension?.activate();
    await configuration.update('enabled', true, vscode.ConfigurationTarget.Global);
    await vscode.commands.executeCommand('htmlEndTagLabels.toggleEnabled');

    assert.strictEqual(configuration.get('enabled', true), false);

    await vscode.commands.executeCommand('htmlEndTagLabels.toggleEnabled');

    assert.strictEqual(configuration.get('enabled', false), true);
  });
});

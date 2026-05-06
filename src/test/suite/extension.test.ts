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

  test('Check unsupported Rust documents do not generate html decorations', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'rust',
      content: `impl AlignmentSnapper {
  pub fn snap_bbox_points(&mut self, point: &SnapCandidatePoint) {
    if let Some(point_on_x) = point_on_x {
      let distance_to_snapped = point.document_point.distance(point_on_x);
      let distance_to_align_target = point_on_x.distance(target_position);
      if distance_to_snapped < tolerance && snap_x.as_ref().map_or(true, |point| distance_to_align_target < point.distance_to_align_target) {
        snap_x = Some(SnappedPoint {
          distance: distance_to_snapped,
          distance_to_align_target,
          ..Default::default()
        });
      }
    }
  }
}
`,
    });

    const labels = new ClosingLabelsDecorations();

    assert.deepStrictEqual(labels.getHTMLDocumentDecorations(document), []);
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

  test('Returns contributed theme color by default for label color', () => {
    const originalGetConfiguration = vscode.workspace.getConfiguration;

    try {
      (vscode.workspace as typeof vscode.workspace & {
        getConfiguration: typeof vscode.workspace.getConfiguration;
      }).getConfiguration = ((section?: string) => {
        if (section === 'htmlEndTagLabels') {
          return {
            labelColor: '',
            labelPrefix: '/',
          } as never;
        }

        return originalGetConfiguration(section);
      }) as typeof vscode.workspace.getConfiguration;

      const labels = new ClosingLabelsDecorations();
      const labelColor = (labels as unknown as { getLabelColor: () => string | vscode.ThemeColor }).getLabelColor();

      assert.ok(labelColor instanceof vscode.ThemeColor);
      assert.deepStrictEqual(labelColor, new vscode.ThemeColor('htmlEndTagLabels.labelColor'));

      labels.dispose();
    } finally {
      (vscode.workspace as typeof vscode.workspace & {
        getConfiguration: typeof vscode.workspace.getConfiguration;
      }).getConfiguration = originalGetConfiguration;
    }
  });

  test('Returns deprecated hex setting as label color fallback', () => {
    const originalGetConfiguration = vscode.workspace.getConfiguration;

    try {
      (vscode.workspace as typeof vscode.workspace & {
        getConfiguration: typeof vscode.workspace.getConfiguration;
      }).getConfiguration = ((section?: string) => {
        if (section === 'htmlEndTagLabels') {
          return {
            labelColor: '#ff0000',
            labelPrefix: '/',
          } as never;
        }

        return originalGetConfiguration(section);
      }) as typeof vscode.workspace.getConfiguration;

      const labels = new ClosingLabelsDecorations();

      assert.strictEqual(
        (labels as unknown as { getLabelColor: () => string | vscode.ThemeColor }).getLabelColor(),
        '#ff0000'
      );

      labels.dispose();
    } finally {
      (vscode.workspace as typeof vscode.workspace & {
        getConfiguration: typeof vscode.workspace.getConfiguration;
      }).getConfiguration = originalGetConfiguration;
    }
  });
});

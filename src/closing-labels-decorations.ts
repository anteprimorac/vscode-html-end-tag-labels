import * as vscode from 'vscode';
import {
  getLanguageService as getHTMLLanguageService,
  LanguageService as HTMLLanguageService,
  SymbolKind as HTMLSymbolKind,
} from 'vscode-html-languageservice';
import * as babelParser from '@babel/parser';
import type { ParserPlugin } from '@babel/parser';
import babelTraverse from '@babel/traverse';
import type { JSXAttribute } from '@babel/types';

type HTMLEndTagDecoration = vscode.DecorationOptions & {
  renderOptions: { after: { contentText: string } };
};

function getJSXAttributeStringValue(attr?: JSXAttribute): string | undefined {
  if (attr?.value) {
    if (attr.value.type === 'StringLiteral' && typeof attr.value.value === 'string') {
      return attr.value.value;
    }

    if (
      attr.value.type === 'JSXExpressionContainer' &&
      attr.value.expression.type === 'StringLiteral' &&
      typeof attr.value.expression.value === 'string'
    ) {
      return attr.value.expression.value;
    }
  }

  return undefined;
}

export default class ClosingLabelsDecorations implements vscode.Disposable {
  private activeEditor?: vscode.TextEditor;
  private subscriptions: vscode.Disposable[] = [];
  private htmlLanguageService?: HTMLLanguageService;
  private updateTimeout?: NodeJS.Timeout;

  private decorationType = this.createTextEditorDecoration();

  private getHTMLLanguageService() {
    if (!this.htmlLanguageService) {
      this.htmlLanguageService = getHTMLLanguageService();
    }

    return this.htmlLanguageService;
  }

  constructor() {
    this.update = this.update.bind(this);

    this.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (!event.affectsConfiguration('htmlEndTagLabels')) {
          return;
        }

        this.decorationType = this.createTextEditorDecoration();

        if (this.activeEditor && event.affectsConfiguration('htmlEndTagLabels', this.activeEditor.document)) {
          this.triggerUpdate();
        }
      })
    );

    // Listen to active editor change
    this.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((event) => this.setActiveEditor(event)));

    // Listen to text change
    this.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        if (this.activeEditor && event.document === this.activeEditor.document) {
          this.triggerUpdate();
        }
      })
    );

    // Set current editor as active if it's available
    if (vscode.window.activeTextEditor) {
      this.setActiveEditor(vscode.window.activeTextEditor);
    }
  }

  createTextEditorDecoration() {
    let color = vscode.workspace.getConfiguration('htmlEndTagLabels').labelColor;

    return vscode.window.createTextEditorDecorationType({
      after: {
        color: color || new vscode.ThemeColor('editorCodeLens.foreground'),
        margin: '2px',
      },
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
    });
  }

  setActiveEditor(editor: vscode.TextEditor | undefined) {
    if (editor) {
      this.activeEditor = editor;
      this.triggerUpdate();
    } else {
      this.activeEditor = undefined;
    }
  }

  triggerUpdate() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = undefined;
    }

    this.updateTimeout = setTimeout(this.update, 500);
  }

  getHTMLDocumentDecorations(input: vscode.TextDocument) {
    const htmlLanguageService = this.getHTMLLanguageService();

    const document = { ...input, uri: input.uri.toString() };
    const symbols = htmlLanguageService.findDocumentSymbols(document, htmlLanguageService.parseHTMLDocument(document));

    const decorations: HTMLEndTagDecoration[] = symbols
      .filter((symbol) => {
        // field symbol
        return (
          symbol.kind === HTMLSymbolKind.Field &&
          // isn't html document
          !symbol.name.startsWith('html') &&
          // isn't child of html
          symbol.containerName !== 'html' &&
          // isn't child of head
          symbol.containerName !== 'head' &&
          // end tag and start tag are on different lines
          symbol.location.range.start.line !== symbol.location.range.end.line &&
          // symbol can be labeled
          (symbol.name.indexOf('#') !== -1 || symbol.name.indexOf('.') !== -1)
        );
      })
      .map((symbol) => {
        const hashCharIndex = symbol.name.indexOf('#');
        const dotCharIndex = symbol.name.indexOf('.');

        const hasIdAttr = hashCharIndex !== -1;
        const hasClassAttr = dotCharIndex !== -1;

        const separatorCharIndex = hasIdAttr ? hashCharIndex : dotCharIndex;

        const tagName = symbol.name.substring(0, separatorCharIndex);
        let id: string = '';
        let classes: string = '';

        if (hasIdAttr) {
          let idAttr: string;

          if (hasClassAttr) {
            idAttr = symbol.name.substring(hashCharIndex + 1, dotCharIndex);
          } else {
            idAttr = symbol.name.substring(hashCharIndex + 1);
          }

          idAttr = idAttr.trim();

          if (idAttr.length) {
            id = `#${idAttr}`;
          }
        }

        if (hasClassAttr) {
          const classAttr = symbol.name
            .substring(dotCharIndex + 1)
            .trim()
            .split('.')
            .map((item) => item.trim())
            .filter((item) => Boolean(item.length))
            .join('.');

          if (classAttr.length) {
            classes = `.${classAttr}`;
          }
        }

        const label = `${id}${classes}`;

        const endTagLength = tagName.length + 3; // 3 chars for `</>`
        const endTagLine = symbol.location.range.end.line;
        const endTagEndChar = symbol.location.range.end.character;
        const endTagStartChar = endTagEndChar >= endTagLength ? endTagEndChar - endTagLength : endTagEndChar;

        return {
          range: new vscode.Range(
            new vscode.Position(endTagLine, endTagStartChar),
            new vscode.Position(endTagLine, endTagEndChar)
          ),
          renderOptions: { after: { contentText: `/${label}` } },
        };
      })
      // Filter out decorations with empty label.
      .filter((item) => item.renderOptions.after.contentText.length > 1);

    return decorations;
  }

  getJSXDocumentDecorations(input: vscode.TextDocument, options?: { typescript?: boolean }) {
    const decorations: HTMLEndTagDecoration[] = [];

    const plugins: ParserPlugin[] = ['jsx'];

    if (options?.typescript) {
      plugins.push('typescript');
    }

    const ast = babelParser.parse(input.getText(), {
      allowAwaitOutsideFunction: true,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
      allowUndeclaredExports: true,
      attachComment: false,
      createParenthesizedExpressions: false,
      errorRecovery: true,
      ranges: true,
      strictMode: false,
      tokens: true,
      plugins,
    });

    babelTraverse(ast, {
      JSXElement({ node }) {
        if (
          !node.selfClosing &&
          node.closingElement &&
          node.closingElement.loc &&
          node.openingElement.loc &&
          node.openingElement.name.type === 'JSXIdentifier' &&
          node.openingElement.name.name.toLowerCase() === node.openingElement.name.name &&
          node.openingElement.loc.end.line !== node.closingElement.loc.start.line
        ) {
          let id: string | undefined;
          let className: string[] = [];
          const idAttr = node.openingElement.attributes.find(
            (attribute): attribute is JSXAttribute => attribute.type === 'JSXAttribute' && attribute.name.name === 'id'
          );
          const classNameAttr = node.openingElement.attributes.find(
            (attribute): attribute is JSXAttribute =>
              attribute.type === 'JSXAttribute' && attribute.name.name === 'className'
          );
          const idAttrVal = getJSXAttributeStringValue(idAttr);
          const classNameAttrVal = getJSXAttributeStringValue(classNameAttr);

          if (idAttrVal) {
            id = idAttrVal.trim();

            if (id.length < 1) {
              id = undefined;
            }
          }

          if (classNameAttrVal) {
            className = classNameAttrVal
              .trim()
              .split(' ')
              .map((item) => item.trim())
              .filter((item) => item.length);
          }

          if (id || className.length) {
            decorations.push({
              range: new vscode.Range(
                new vscode.Position(node.closingElement.loc.start.line - 1, node.closingElement.loc.start.column),
                new vscode.Position(node.closingElement.loc.end.line - 1, node.closingElement.loc.end.column)
              ),
              renderOptions: {
                after: {
                  contentText: '/' + (id ? `#${id}` : '') + (className.length > 0 ? `.${className.join('.')}` : ''),
                },
              },
            });
          }
        }
      },
    });

    return decorations;
  }

  update() {
    if (!this.activeEditor) {
      return;
    }

    const languageId = this.activeEditor.document.languageId.toLowerCase();

    if (['javascript', 'javascriptreact'].includes(languageId)) {
      this.activeEditor.setDecorations(this.decorationType, this.getJSXDocumentDecorations(this.activeEditor.document));
    } else if (languageId === 'typescriptreact') {
      this.activeEditor.setDecorations(
        this.decorationType,
        this.getJSXDocumentDecorations(this.activeEditor.document, { typescript: true })
      );
    } else {
      this.activeEditor.setDecorations(
        this.decorationType,
        this.getHTMLDocumentDecorations(this.activeEditor.document)
      );
    }
  }

  public dispose() {
    this.activeEditor = undefined;
    this.subscriptions.forEach((s) => s.dispose());
  }
}

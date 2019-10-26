import * as vscode from 'vscode';
import { getLanguageService, LanguageService, SymbolKind } from 'vscode-html-languageservice';

export default class ClosingLabelsDecorations implements vscode.Disposable {
	private activeEditor?: vscode.TextEditor;
	private subscriptions: vscode.Disposable[] = [];
	private languageService?: LanguageService;
	private updateTimeout?: NodeJS.Timeout;

	private readonly decorationType = vscode.window.createTextEditorDecorationType({
		after: {
			color: new vscode.ThemeColor('editorCodeLens.foreground'),
			margin: '2px',
		},
		rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
	});

	constructor() {
		this.update = this.update.bind(this);
		this.languageService = getLanguageService();

		// Listen to active editor change
		this.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((event) => this.setActiveEditor(event)));

		// Listen to text change
		this.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
			if (this.activeEditor && event.document === this.activeEditor.document) {
				this.triggerUpdate();
			}
		}));

		// Set current editor as active if it's available
		if (vscode.window.activeTextEditor) {
			this.setActiveEditor(vscode.window.activeTextEditor);
		}
	}

	setActiveEditor(editor: vscode.TextEditor|undefined) {
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

	update() {
		if (!this.languageService || !this.activeEditor) {
			return;
		}

		const activeEditor = this.activeEditor;

		const document = {...activeEditor.document, uri: activeEditor.document.uri.toString()};

		const symbols = this.languageService.findDocumentSymbols(document, this.languageService.parseHTMLDocument(document));

		const decorations = symbols
			.filter((symbol) => {
				// field symbol
				return symbol.kind === SymbolKind.Field &&
					// isn't html document
					!symbol.name.startsWith('html') &&
					// isn't child of html
					symbol.containerName !== 'html' &&
					// isn't child of head
					symbol.containerName !== 'head' &&
					// end tag and start tag are on different lines
					symbol.location.range.start.line !== symbol.location.range.end.line &&
					// symbol can be labeled
					(symbol.name.indexOf('#') !== -1 || symbol.name.indexOf('.') !== -1);
			})
			.map((symbol) => {
				let label;
				let tagName;

				if (symbol.name.indexOf('#') !== -1) {
					const parts = symbol.name.split('#', 2);
					tagName = parts[0];
					label = '#' + parts[1];
				} else if (symbol.name.indexOf('.') !== -1) {
					const parts = symbol.name.split('.', 2);
					tagName = parts[0];
					label = '.' + parts[1];
				} else {
					tagName = symbol.name;
					label = symbol.name;
				}

				const endTagLength = tagName.length + 3; // 3 chars for `</>`
				const endTagLine = symbol.location.range.end.line;
				const endTagEndChar = symbol.location.range.end.character;
				const endTagStartChar = endTagEndChar >= endTagLength ? endTagEndChar - endTagLength : endTagEndChar;

				const decoration: vscode.DecorationOptions = {
					range: new vscode.Range(
						new vscode.Position(endTagLine, endTagStartChar),
						new vscode.Position(endTagLine, endTagEndChar)
					),
					renderOptions: { after: { contentText: `/${label}` } },
				};

				return decoration;
			});

		activeEditor.setDecorations(this.decorationType, decorations);
	}

	public dispose() {
		this.activeEditor = undefined;
		this.subscriptions.forEach((s) => s.dispose());
	}
}
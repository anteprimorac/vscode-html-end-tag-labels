import * as vscode from 'vscode';
import { getLanguageService, LanguageService, SymbolKind } from 'vscode-html-languageservice';

type HTMLEndTagDecoration = vscode.DecorationOptions & {renderOptions: {after: {contentText: string}}};

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

	getDocumentDecorations(input: vscode.TextDocument) {
		if (!this.languageService) {
			return [];
		}

		const document = {...input, uri: input.uri.toString()};
		const symbols = this.languageService.findDocumentSymbols(
			document,
			this.languageService.parseHTMLDocument(document)
		);

		const decorations: HTMLEndTagDecoration[] = symbols
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
					const classAttr = symbol.name.substring(dotCharIndex + 1)
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

	update() {
		if (!this.languageService || !this.activeEditor) {
			return;
		}

		this.activeEditor.setDecorations(
			this.decorationType,
			this.getDocumentDecorations(this.activeEditor.document)
		);
	}

	public dispose() {
		this.activeEditor = undefined;
		this.subscriptions.forEach((s) => s.dispose());
	}
}
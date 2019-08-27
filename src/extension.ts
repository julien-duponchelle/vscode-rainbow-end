'use strict';

import * as vscode from 'vscode';
import { languages } from './languages';


const deepDecorations = [
	vscode.window.createTextEditorDecorationType({
		color: { id: "rainbowend.deep1" }
	}),
	vscode.window.createTextEditorDecorationType({
		color: { id: "rainbowend.deep2" }
	}),
	vscode.window.createTextEditorDecorationType({
		color: { id: "rainbowend.deep3" }
	})
];

let timeout: NodeJS.Timer | null = null;
let regExs: { [index: string]: RegExp } = {};

export function activate(context: vscode.ExtensionContext) {
	Object.keys(languages).forEach(language => {
		regExs[language] = buildRegex(language);
	});

	let activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		triggerUpdateDecorations(activeEditor);
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (activeEditor) {
			triggerUpdateDecorations(activeEditor);
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations(activeEditor);
		}
	}, null, context.subscriptions);
}

function triggerUpdateDecorations(activeEditor: vscode.TextEditor) {
	if (timeout) {
		clearTimeout(timeout);
	}
	timeout = setTimeout(updateDecorations, 250);
}

function buildRegex(language: string) {

	const languageConfiguration = languages[language];
	let tokens: Array<string> = languageConfiguration["openTokens"];
	tokens = tokens.concat(languageConfiguration["inlineOpenTokens"]);
	tokens = tokens.concat(languageConfiguration["closeTokens"]);
	tokens = tokens.concat(languageConfiguration["neutralTokens"]);
	return RegExp("(\\b)(" + tokens.join('|') + ")(\\b)", "gm");
}

function ignoreInDelimiters(token_pairs: Array<{
	open: string,
	close: string
}> | undefined, text: string) {
	if (token_pairs) {
		token_pairs.forEach(({
			open: open_delim,
			close: close_delim
		}) => {
			let regexp = RegExp(`${open_delim}[^${close_delim}]*${close_delim}`, "gm");
			text = text.replace(regexp, (match) => {
				return " ".repeat(match.length);
			});
		})
	}
	return text;
}

function updateDecorations() {
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		return;
	}
	const languageConfiguration = languages[activeEditor.document.languageId];

	let text = activeEditor.document.getText();
	const options: vscode.DecorationOptions[][] = [];
	deepDecorations.forEach(d => {
		options.push([]);
	});
	let match;
	let deep = 0;

	// if we are not case sensitive, then ensure the case of text matches then keyworkd matches
	if (!languageConfiguration.caseSensitive) {
		text = text.toLowerCase();
	}
	// substitute all ignore intervals with spaces
	// this ensures commented code or
	// keywords inside strings are ignored properly

	// also, prepend a whitespace to allow matching the first character in document
	// if needed

	text = ' ' + ignoreInDelimiters(languageConfiguration.ignoreInDelimiters, text);
	while (match = regExs[activeEditor.document.languageId].exec(text)) {
		const startIndex = match.index + match[1].length - 1; // Decrement to compensate for added character
		const startPos = activeEditor.document.positionAt(startIndex);
		const endPos = activeEditor.document.positionAt(startIndex + match[2].length);
		const decoration: vscode.DecorationOptions = { range: new vscode.Range(startPos, endPos) };

		if (languageConfiguration.closeTokens.indexOf(match[2]) > -1) {
			if (deep > 0) {
				deep -= 1;
			}
			options[deep % deepDecorations.length].push(decoration);
		}
		else if (languageConfiguration.neutralTokens.indexOf(match[2]) > -1) {
			if (deep > 0) {
				options[(deep - 1) % deepDecorations.length].push(decoration);
			}
		}
		else if (languageConfiguration.openTokens.indexOf(match[2]) > -1) {
			options[deep % deepDecorations.length].push(decoration);
			deep += 1;
		}
		else {
			if (match[1].length === 0 || match[1].match("^[\\s\n]+$")) {
				options[deep % deepDecorations.length].push(decoration);
				deep += 1;
			}
		}
	}

	deepDecorations.forEach((deepDecoration, i) => {
		activeEditor.setDecorations(deepDecoration, options[i]);
	});
}


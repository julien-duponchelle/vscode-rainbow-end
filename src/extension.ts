'use strict';

import * as vscode from 'vscode';
import {languages} from './languages';


const deepDecorations = [
	vscode.window.createTextEditorDecorationType({
		color: {id: "rainbowend.deep1"}
	}),
	vscode.window.createTextEditorDecorationType({
		color: {id: "rainbowend.deep2"}
	}),
	vscode.window.createTextEditorDecorationType({
		color: {id: "rainbowend.deep3"}
	})
];

let timeout : NodeJS.Timer | null = null;
let regExs: { [index:string] : RegExp} = {};

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
	return RegExp("(^[ \t]*|[^\n \t][ \t]+)(" + tokens.join('|') + ")(\\s|$)", "gm");
}

function updateDecorations() {
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		return;
	}
	const languageConfiguration = languages[activeEditor.document.languageId];

	const text = activeEditor.document.getText();
	const options: vscode.DecorationOptions[][] = [];
	deepDecorations.forEach(d => {
		options.push([]);
	});
	let match;
	let deep = 0;
	while (match = regExs[activeEditor.document.languageId].exec(text)) {
		const startIndex = match.index + match[1].length;
		const startPos = activeEditor.document.positionAt(startIndex);
		const endPos = activeEditor.document.positionAt(startIndex + match[2].length);
		const decoration: vscode.DecorationOptions  = { range: new vscode.Range(startPos, endPos) };

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
			console.log('"' + match[1] + '";');
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


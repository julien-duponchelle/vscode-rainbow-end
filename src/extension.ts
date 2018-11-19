'use strict';

import * as vscode from 'vscode';

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

export function activate(context: vscode.ExtensionContext) {
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

function updateDecorations() {
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		return;
	}

	const regEx = /(^|\s)(class|module|case|if|def|while|do|end|elsif|else|when)(\s|$)/gm;
	const text = activeEditor.document.getText();
	const options: vscode.DecorationOptions[][] = [];
	deepDecorations.forEach(d => {
		options.push([]);
	});
	let match;
	let deep = 0;
	while (match = regEx.exec(text)) {
		const startIndex = match.index + match[1].length;
		const startPos = activeEditor.document.positionAt(startIndex);
		const endPos = activeEditor.document.positionAt(startIndex + match[2].length);
		const decoration: vscode.DecorationOptions  = { range: new vscode.Range(startPos, endPos) };


		if (match[2] === "end") {
			if (deep > 0) {
				deep -= 1;
			}
			options[deep % deepDecorations.length].push(decoration);
		}
		else if (["else", "elsif", "when"].indexOf(match[2]) > -1) {
			if (deep > 0) {
				options[(deep - 1) % deepDecorations.length].push(decoration);
			}
		}
		else {
			options[deep % deepDecorations.length].push(decoration);
			deep += 1;
		}
	}

	deepDecorations.forEach((deepDecoration, i) => {
		activeEditor.setDecorations(deepDecoration, options[i]);
	});
}


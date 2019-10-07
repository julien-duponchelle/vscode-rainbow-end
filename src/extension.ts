"use strict";

import * as vscode from "vscode";
import { languages } from "./languages";
import { tokenize, Token } from "./tokenizer";

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
let regExps: {
  [index: string]: {
    openRegExp: RegExp;
    closeRegExp: RegExp;
    neutralRegExp: RegExp;
    ignoreRegExp: RegExp | null;
    singleLineIgnoreRegExp: RegExp | null;
  };
} = {};

function loadRegexes(language: string) {
  const {
    ignoreInDelimiters,
    openTokens,
    closeTokens,
    neutralTokens
  } = languages[language];

  let ignoreTokens = null;
  let singleLineIgnoreTokens = null;
  let ignoreRegExp = null;
  let singleLineIgnoreRegExp = null;
  if (ignoreInDelimiters) {
    ignoreTokens = ignoreInDelimiters
      .filter(token => !token.singleline)
      .map(({ open, close }) => `${open}[^(${close})]*${close}`)
      .join("|");
    ignoreRegExp = RegExp(`${ignoreTokens}`, "gm");

    singleLineIgnoreTokens = ignoreInDelimiters
      .filter(token => !token.singleline)
      .map(({ open, close }) => `${open}`)
      .join("|");
    singleLineIgnoreRegExp = RegExp(`(${singleLineIgnoreTokens}).*${}`, "g");
  }

  let openRegExp = RegExp(`(^|\\s)(${openTokens.join("|")})(?=($|\\s))`, "g");
  let closeRegExp = RegExp(`(^|\\s)(${closeTokens.join("|")})(?=($|\\s))`, "g");
  let neutralRegExp = RegExp(
    `(^|\\s)(${neutralTokens.join("|")})(?=($|\\s))`,
    "g"
  );

  return {
    openRegExp,
    closeRegExp,
    ignoreRegExp,
    singleLineIgnoreRegExp,
    neutralRegExp
  };
}

export function activate(context: vscode.ExtensionContext) {
  Object.keys(languages).forEach(language => {
    regExps[language] = loadRegexes(language);
  });

  let activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    triggerUpdateDecorations(activeEditor);
  }

  vscode.window.onDidChangeActiveTextEditor(
    editor => {
      activeEditor = editor;
      if (activeEditor) {
        triggerUpdateDecorations(activeEditor);
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    event => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations(activeEditor);
      }
    },
    null,
    context.subscriptions
  );
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
  let lang = activeEditor.document.languageId;
  const languageConfiguration = languages[lang];

  let text = activeEditor.document.getText();
  const options: vscode.DecorationOptions[][] = [];
  deepDecorations.forEach(d => {
    options.push([]);
  });
  let depth = 0;

  // if we are not case sensitive, then ensure the case of text matches then keyworkd matches
  if (!languageConfiguration.caseSensitive) {
    text = text.toLowerCase();
  }

  let tokens: Token[] = tokenize(text, regExps[lang]);

  for (let { pos, length, type } of tokens) {
    const startPos = activeEditor.document.positionAt(pos);
    const endPos = activeEditor.document.positionAt(pos + length);
    const decoration: vscode.DecorationOptions = {
      range: new vscode.Range(startPos, endPos)
    };

    switch (type) {
      case "OPEN BLOCK":
        // If beginning a new block, push new decoration and increment depth
        options[depth % deepDecorations.length].push(decoration);
        depth++;
        break;
      case "CLOSE BLOCK":
        // If closing a block, decrement depth
        depth = depth > 0 ? depth - 1 : 0;
        options[depth % deepDecorations.length].push(decoration);
        break;
      default:
        if (depth > 0) {
          // As default, if the token is in non-zero depth, it is a continuation token and should keep the same color as the opening token
          options[(depth - 1) % deepDecorations.length].push(decoration);
        }
        break;
    }
  }
  deepDecorations.forEach((deepDecoration, i) => {
    activeEditor.setDecorations(deepDecoration, options[i]);
  });
}

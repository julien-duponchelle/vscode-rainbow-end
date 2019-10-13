"use strict";

import * as vscode from "vscode";
import { languages } from "./languages";
import { tokenize, Token, TokenizeParams } from "./tokenizer";
import { parse } from "./parser";

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
  [index: string]: TokenizeParams;
} = {};

function loadRegexes(language: string) {
  const { ignoreBlocks, openTokens, closeTokens, neutralTokens } = languages[
    language
  ];

  let ignoreTokens = null;
  let singleLineIgnoreTokens = null;
  let ignoreRegExp = null;
  let singleLineIgnoreRegExp = null;
  if (ignoreBlocks) {
    ignoreTokens = ignoreBlocks
      .filter(token => !token.singleline)
      .map(({ open, close }) => `${open}[^(${close})]*${close}`)
      .join("|");
    ignoreRegExp = RegExp(`${ignoreTokens}`, "gm");

    singleLineIgnoreTokens = ignoreBlocks
      .filter(token => token.singleline)
      .map(({ open }) => `${open}`)
      .join("|");
    singleLineIgnoreRegExp = RegExp(`(${singleLineIgnoreTokens}).*`, "g");
    console.log(singleLineIgnoreRegExp);
  }

  /*
  The (^|\s) and ($|\s) separators are used instead of \b to ensure that any regexp
  provided as the configurable tokens can be matched.
  Previously, there was an issue involving the ':' character
  */
  let openRegExp = RegExp(`(^|\\s)(${openTokens.join("|")})(?=($|\\s))`, "gm");
  let closeRegExp = RegExp(
    `(^|\\s)(${closeTokens.join("|")})(?=($|\\s))`,
    "gm"
  );
  let neutralRegExp = RegExp(
    `(^|\\s)(${neutralTokens.join("|")})(?=($|\\s))`,
    "gm"
  );

  let openListComprehensionRegExp = null;
  let closeListComprehensionRegExp = null;

  return {
    openRegExp,
    closeRegExp,
    ignoreRegExp,
    singleLineIgnoreRegExp,
    neutralRegExp,
    openListComprehensionRegExp,
    closeListComprehensionRegExp
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

  // if we are not case sensitive, then ensure the case of text matches the keyword matches
  if (!languageConfiguration.caseSensitive) {
    text = text.toLowerCase();
  }

  let tokens: Token[] = tokenize(text, regExps[lang]);

  parse({ activeEditor, options, tokens });

  deepDecorations.forEach((deepDecoration, i) => {
    activeEditor.setDecorations(deepDecoration, options[i]);
  });
}

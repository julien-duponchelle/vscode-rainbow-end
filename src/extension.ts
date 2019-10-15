"use strict";

import * as vscode from "vscode";
import { languages } from "./languages";
import { tokenize, Token, TokenizeParams } from "./tokenizer";
import { parse, deepDecorations } from "./parser";

let timeout: NodeJS.Timer | null = null;
let regExps: {
  [index: string]: TokenizeParams;
} = {};

function loadRegexes(language: string) {
  const {
    ignoreBlocks,
    openTokens,
    closeTokens,
    neutralTokens,
    listComprehensions
  } = languages[language];

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
  The `regexpPrefix` and `regexpSuffix` separators are used instead of \b to ensure that any regexp
  provided as the configurable tokens can be matched. This is relaxed so that words preceded or followed by
  parentheses, square brackets or curly brackets are also matched.
  Previously, there was an issue involving the ':' character
  */

  const regexpPrefix = "(^|\\s)";
  const regexpSuffix = "($|\\s)";

  let openRegExp = RegExp(
    `(?<=${regexpPrefix})(${openTokens.join("|")})(?=${regexpSuffix})`,
    "gm"
  );
  let closeRegExp = RegExp(
    `(?<=${regexpPrefix})(${closeTokens.join("|")})(?=${regexpSuffix})`,
    "gm"
  );
  let neutralRegExp = RegExp(
    `(?<=${regexpPrefix})(${neutralTokens.join("|")})(?=${regexpSuffix})`,
    "gm"
  );

  let openListComprehensionRegExp = null;
  let closeListComprehensionRegExp = null;

  if (listComprehensions) {
    let openListComprehensionTokens = listComprehensions
      .map(({ open }) => `${open}`)
      .join("|");
    openListComprehensionRegExp = RegExp(
      `(${openListComprehensionTokens})`,
      "gm"
    );
    let closeListComprehensionTokens = listComprehensions
      .map(({ close }) => `${close}`)
      .join("|");
    closeListComprehensionRegExp = RegExp(
      `(${closeListComprehensionTokens})`,
      "gm"
    );
  }

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

  if (!languageConfiguration) {
    return;
  }

  let text = activeEditor.document.getText();
  const options: vscode.DecorationOptions[][] = [];
  deepDecorations.forEach((d: any) => {
    options.push([]);
  });

  // if we are not case sensitive, then ensure the case of text matches the keyword matches
  if (!languageConfiguration.caseSensitive) {
    text = text.toLowerCase();
  }

  let tokens: Token[] = tokenize(text, regExps[lang]);

  parse({ activeEditor, options, tokens });

  deepDecorations.forEach((deepDecoration: any, i: number) => {
    activeEditor.setDecorations(deepDecoration, options[i]);
  });
}

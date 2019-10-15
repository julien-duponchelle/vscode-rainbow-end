"use strict";

import * as vscode from "vscode";
import { languages } from "./languages";
import { tokenize, loadRegexes, Token, TokenizeParams } from "./tokenizer";
import { parse, deepDecorations } from "./parser";

export function activate(context: vscode.ExtensionContext) {
  let regExps: {
    [index: string]: TokenizeParams;
  } = {};

  let timeout: NodeJS.Timer | null = null;

  Object.keys(languages).forEach(language => {
    regExps[language] = loadRegexes(language);
  });

  let activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    triggerUpdateDecorations(timeout, regExps);
  }

  vscode.window.onDidChangeActiveTextEditor(
    editor => {
      activeEditor = editor;
      if (activeEditor) {
        triggerUpdateDecorations(timeout, regExps);
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    event => {
      if (activeEditor && event.document === activeEditor.document) {
        timeout = triggerUpdateDecorations(timeout, regExps);
      }
    },
    null,
    context.subscriptions
  );
}

function triggerUpdateDecorations(
  timeout: NodeJS.Timer | null,
  regExps: {
    [index: string]: TokenizeParams;
  }
) {
  if (timeout) {
    clearTimeout(timeout);
  }
  return setTimeout(() => updateDecorations(regExps), 250);
}

function updateDecorations(regExps: { [index: string]: TokenizeParams }) {
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

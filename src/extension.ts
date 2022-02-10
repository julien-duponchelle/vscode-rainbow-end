"use strict";

import * as vscode from "vscode";
import { languages } from "./languages";

const configSection = 'rainbow-end';

const defaultDecorations = [
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

function createDeepDecorations(): vscode.TextEditorDecorationType[] {
  const colors: string[] | undefined = vscode.workspace.getConfiguration(configSection).get('colors');

  const mappedColors = colors?.map(
    (color) => vscode.window.createTextEditorDecorationType({ color })
  );
  if (mappedColors && mappedColors.length > 0) {
    return mappedColors;
  }

  return defaultDecorations;
}

let deepDecorations = createDeepDecorations();

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

  vscode.workspace.onDidChangeConfiguration(
    event => {
      if (event.affectsConfiguration(configSection)) {
        deepDecorations = createDeepDecorations();
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

function buildRegex(language: string) {
  const languageConfiguration = languages[language];
  let tokens: Array<string> = languageConfiguration["openTokens"];
  tokens = tokens.concat(languageConfiguration["inlineOpenTokens"]);
  tokens = tokens.concat(languageConfiguration["closeTokens"]);
  tokens = tokens.concat(languageConfiguration["neutralTokens"]);
  return RegExp("(\\b)(" + tokens.join("|") + ")(\\b)", "gm");
}

function ignoreInDelimiters(
  token_pairs:
    | Array<{
        open: string;
        close: string;
      }>
    | undefined,
  text: string
) {
  /* This function replaces text inside each token pair with spaces,
	   so as to ignore the text between delimiters */
  if (token_pairs) {
    token_pairs.forEach(({ open: open_delim, close: close_delim }) => {
      /* Only allow nesting if delimiters are different */
      if (open_delim == close_delim) {
        let regexp = RegExp(
          `${open_delim}[^${close_delim}]*${close_delim}`,
          "gm"
        );
        text = text.replace(regexp, match => {
          return " ".repeat(match.length);
        });
      } else {
        let openRegexp = RegExp(`${open_delim}`, "gm");
        let closeRegexp = RegExp(`${close_delim}`, "gm");

        let indices = [];

        let match = openRegexp.exec(text);
        if (match == null) {
          return;
        }

        while (match != null) {
          indices.push({ index: match.index, type: "open" });
          match = openRegexp.exec(text);
        }

        match = closeRegexp.exec(text);
        if (match == null) {
          return;
        }

        while (match != null) {
          indices.push({ index: match.index, type: "close" });
          match = closeRegexp.exec(text);
        }

        /* Sort by index */
        indices = indices.sort(({ index: a }, { index: b }) => a - b);

        let ignore_env_counter = 0;
        let first_index = indices[0].index;

        let index: number;
        let type: string;

        /* This isn't so inefficient in that it is
    	     O(indices.length), instead of O(text.length).
	         Also, the list is already ordered, which is really helpful */
        for ({ index, type } of indices) {
          /* skip current token if trying to close when there is no open block
           cannot just break because '\n' can be both a closing token and a
           normal line end
          */
          if (type == "close" && ignore_env_counter == 0) {
            continue;
          }

          /* if counter is zero, should begin an ignore block */
          if (ignore_env_counter == 0) {
            first_index = index;
          }

          if (type == "open") {
            /* if it is an open token, always increment env counter */
            ignore_env_counter++;
          } else {
            ignore_env_counter--;
            /* if counter has reached zero after a closing token,
             end ignore block */
            let last_index = index;

            /* Set ignore block slice as whitespace and keep the rest */
            text =
              text.slice(0, first_index) +
              " ".repeat(last_index - first_index + 1) +
              text.slice(last_index + 1);
          }
        }

        if (ignore_env_counter != 0) {
          /* Didn't close last block */
          text =
            text.slice(0, first_index) +
            " ".repeat(text.length - first_index + 1);
        }
      }
    });
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

  text =
    " " + ignoreInDelimiters(languageConfiguration.ignoreInDelimiters, text);
  while ((match = regExs[activeEditor.document.languageId].exec(text))) {
    const startIndex = match.index + match[1].length - 1; // Decrement to compensate for added character
    const startPos = activeEditor.document.positionAt(startIndex);
    const endPos = activeEditor.document.positionAt(
      startIndex + match[2].length
    );
    const decoration: vscode.DecorationOptions = {
      range: new vscode.Range(startPos, endPos)
    };

    if (languageConfiguration.closeTokens.indexOf(match[2]) > -1) {
      if (deep > 0) {
        deep -= 1;
      }
      options[deep % deepDecorations.length].push(decoration);
    } else if (languageConfiguration.neutralTokens.indexOf(match[2]) > -1) {
      if (deep > 0) {
        options[(deep - 1) % deepDecorations.length].push(decoration);
      }
    } else if (languageConfiguration.openTokens.indexOf(match[2]) > -1) {
      options[deep % deepDecorations.length].push(decoration);
      deep += 1;
    } else {
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

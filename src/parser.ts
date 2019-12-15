"use strict";

import * as vscode from "vscode";
import { Token } from "./tokenizer";

interface ParseParams {
  activeEditor: vscode.TextEditor;
  options: vscode.DecorationOptions[][];
  tokens: Token[];
}

interface SubParserParams {
  decoration: vscode.DecorationOptions;
  options: vscode.DecorationOptions[][];
  token: Token;
  decorationDepth: number;
}

interface SubParserResult {
  options: vscode.DecorationOptions[][];
  decorationDepth: number;
}

export const deepDecorations = [
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

const DEFAULT = 0;
const IGNORE = 1;
const COMPREHENSION = 2;

export function parse({ activeEditor, options, tokens }: ParseParams) {
  let decorationDepth = 0;
  let mode = DEFAULT;
  let comprehensionDepthStack = [];

  console.log(tokens);

  for (let token of tokens) {
    console.log(token);
    let { pos, length, type } = token;
    /* Switch parsing modes if any of the mode delimiters has been reached */
    if (type === "OPEN IGNORE") {
      mode = IGNORE;
      continue;
    } else if (type === "OPEN COMPREHENSION") {
      mode = COMPREHENSION;
      comprehensionDepthStack.push(1);
      continue;
    } else if (type === "CLOSE IGNORE" || type === "CLOSE COMPREHENSION") {
      comprehensionDepthStack.pop();

      if (comprehensionDepthStack.length > 0) {
        continue;
      }
      mode = DEFAULT;
      continue;
    }
    console.log(mode);
    console.log(comprehensionDepthStack);

    const startPos = activeEditor.document.positionAt(pos);
    const endPos = activeEditor.document.positionAt(pos + length);
    const decoration: vscode.DecorationOptions = {
      range: new vscode.Range(startPos, endPos)
    };

    let result = { decorationDepth, options };
    switch (mode) {
      // case IGNORE:
      /* A new parseInComment function could be implemented to allow for different highlighting
        instead of just ignoring */
      // result = parseInComment({ decoration, decorationDepth, options, token });
      // break;
      case COMPREHENSION:
        result = parseInComprehension({
          decoration,
          decorationDepth,
          options,
          token
        });
        break;
      case DEFAULT:
        result = parseDefault({ decoration, decorationDepth, options, token });
        break;
      default:
        break;
    }
    decorationDepth = result.decorationDepth;
    options = result.options;
  }
}

function parseDefault(params: SubParserParams): SubParserResult {
  let { decoration, token, decorationDepth, options } = params;
  switch (token.type) {
    case "OPEN BLOCK":
      // If beginning a new block, push new decoration and increment decorationDepth
      options[decorationDepth % deepDecorations.length].push(decoration);
      decorationDepth++;
      break;
    case "CLOSE BLOCK":
      // If closing a block, decrement decorationDepth
      decorationDepth = decorationDepth > 0 ? decorationDepth - 1 : 0;
      options[decorationDepth % deepDecorations.length].push(decoration);
      break;
    default:
      if (decorationDepth > 0) {
        // As default, if the token is in non-zero decorationDepth, it is a continuation token and should keep the same color as the opening token
        options[(decorationDepth - 1) % deepDecorations.length].push(
          decoration
        );
      }
      break;
  }

  return { decorationDepth, options };
}

function parseInComprehension(params: SubParserParams): SubParserResult {
  /* For simplicity, in comprehensions,
  all open-block and close-block tokens will be highlighted with the same decorationDepth color
  The color is the next down from the previous block

  i.e.:
  <color>if</color>
  [
    <other color>for</other color> x <other color>if</other color>
  ]
  */

  let { decoration, token, decorationDepth, options } = params;
  let comprehensionDecorationDepth = decorationDepth + 1;

  if (
    token.type === "OPEN BLOCK" ||
    token.type === "CLOSE BLOCK" ||
    token.type === "NEUTRAL"
  ) {
    options[comprehensionDecorationDepth % deepDecorations.length].push(
      decoration
    );
  }

  return { decorationDepth, options };
}

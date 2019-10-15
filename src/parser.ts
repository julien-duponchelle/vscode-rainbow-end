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
  depth: number;
}

interface SubParserResult {
  options: vscode.DecorationOptions[][];
  depth: number;
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
  let depth = 0;
  let comprehensionDepth = 0;
  let mode = DEFAULT;

  for (let token of tokens) {
    let { pos, length, type } = token;
    /* Switch parsing modes if any of the mode delimiters has been reached */
    if (type === "OPEN IGNORE") {
      mode = IGNORE;
      continue;
    } else if (type === "OPEN COMPREHENSION") {
      mode = COMPREHENSION;
      comprehensionDepth++;
      continue;
    } else if (type === "CLOSE IGNORE" || type === "CLOSE COMPREHENSION") {
      comprehensionDepth--;
      if (comprehensionDepth > 0) {
        continue;
      }
      comprehensionDepth = 0;
      mode = DEFAULT;
      continue;
    }

    const startPos = activeEditor.document.positionAt(pos);
    const endPos = activeEditor.document.positionAt(pos + length);
    const decoration: vscode.DecorationOptions = {
      range: new vscode.Range(startPos, endPos)
    };

    let result = { depth, options };
    console.log(mode);
    switch (mode) {
      // case IGNORE:
      /* A new parseInComment function could be implemented to allow for different highlighting
        instead of just ignoring */
      // result = parseInComment({ decoration, depth, options, token });
      // break;
      case COMPREHENSION:
        console.log(token);
        result = parseInComprehension({ decoration, depth, options, token });
        break;
      case DEFAULT:
        console.log(token);
        result = parseDefault({ decoration, depth, options, token });
        break;
      default:
        console.log("default: skip");
        break;
    }
    depth = result.depth;
    options = result.options;
  }
}

function parseDefault(params: SubParserParams): SubParserResult {
  let { decoration, token, depth, options } = params;
  switch (token.type) {
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

  return { depth, options };
}

function parseInComprehension(params: SubParserParams): SubParserResult {
  /* For simplicity, in comprehensions,
  all open-block and close-block tokens will be highlighted with the same depth color
  The color is the next down from the previous block

  i.e.:
  <color>if</color>
  [
    <other color>for</other color> x <other color>if</other color>
  ]
  */

  let { decoration, token, depth, options } = params;
  let comprehensionDepth = depth + 1;

  if (
    token.type === "OPEN BLOCK" ||
    token.type === "CLOSE BLOCK" ||
    token.type === "NEUTRAL"
  ) {
    options[comprehensionDepth % deepDecorations.length].push(decoration);
  }

  return { depth, options };
}

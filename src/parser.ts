"use strict";

import * as vscode from "vscode";
import { Token } from "./tokenizer";

interface ParseParams {
  activeEditor: vscode.TextEditor;
  options: vscode.DecorationOptions[][];
  tokens: Token[];
}

const DEFAULT = 0;
const COMMENT = 1;
const COMPREHENSION = 2;

export function parse({ activeEditor, options, tokens }: ParseParams) {
  let depth = 0;
  for (let { pos, length, type } of tokens) {
    let mode = null;
    if (type == "COMMENT" || type == "SINGLE LINE COMMENT") {
      mode = COMMENT;
    } else if (type == "OPEN COMPREHENSION" || type == "CLOSE COMPREHENSION") {
      mode = COMPREHENSION;
    } else {
      mode = DEFAULT;
    }
    /*





    */
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
}

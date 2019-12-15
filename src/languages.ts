export interface LangParams {
  caseSensitive: boolean;
  ignoreBlocks?: Array<{
    open: string;
    close?: string;
    singleline?: boolean;
  }>;
  listComprehensions?: Array<{
    open: string;
    close: string;
  }>;
  openTokens: Array<string>;
  closeTokens: Array<string>;
  neutralTokens: Array<string>;
}

export const languages: {
  [index: string]: LangParams;
} = {
  ruby: {
    caseSensitive: true,
    ignoreBlocks: [
      {
        open: "#",
        singleline: true
      },
      { open: "=begin", close: "=end" },
      {
        open: '"',
        close: '"'
      }
    ],
    openTokens: [
      "class",
      "module",
      "def",
      "while",
      "do",
      "case",
      "begin",
      "loop"
    ],
    closeTokens: ["end"],
    neutralTokens: ["elsif", "else", "when", "rescue"]
  },
  lua: {
    caseSensitive: true,
    ignoreBlocks: [
      {
        open: '"',
        close: '"'
      },
      {
        open: "'",
        close: "'"
      },
      {
        open: "--",
        singleline: true
      }
    ],
    openTokens: ["function", "if", "while", "for"],
    closeTokens: ["end"],
    neutralTokens: ["do", "then", "else", "elseif"]
  },
  elixir: {
    caseSensitive: true,
    listComprehensions: [
      {
        open: "\\[",
        close: "\\]"
      }
    ],
    ignoreBlocks: [
      {
        open: "#",
        singleline: true
      },
      {
        open: '"""',
        close: '"""'
      },
      {
        open: '"',
        close: '"'
      },
      {
        open: "'",
        close: "'"
      },
      {
        open: "\\(",
        close: "\\)"
      }
    ],
    openTokens: [
      "fn",
      "defmodule",
      "defmacro",
      "defmacrop",
      "def",
      "defp",
      "if",
      "while",
      "for",
      "case",
      "cond",
      "unless",
      "try",
      "quote",
      "with",
      "defprotocol",
      "defimpl",
      "schema",
      "embedded_schema",
      "resources",
      "scope"
    ],
    closeTokens: ["end", "do:"],
    neutralTokens: ["do", "else", "elseif", "rescue", "after", "->", "<-"]
  },
  julia: {
    caseSensitive: true,
    ignoreBlocks: [
      {
        open: "#",
        singleline: true
      },
      {
        open: '"""',
        close: '"""'
      },
      {
        open: '"',
        close: '"'
      },
      {
        open: "'",
        close: "'"
      }
    ],
    listComprehensions: [
      {
        open: "\\[",
        close: "\\]"
      }
    ],
    openTokens: [
      "if",
      "struct",
      "begin",
      "let",
      "for",
      "while",
      "quote",
      "do",
      "module"
    ],
    closeTokens: ["end"],
    neutralTokens: ["else", "elseif"]
  },
  shellscript: {
    caseSensitive: true,
    ignoreBlocks: [
      {
        open: "#",
        singleline: true
      },
      {
        open: '"',
        close: '"'
      },
      {
        open: "'",
        close: "'"
      }
    ],
    openTokens: ["for", "if", "while", "until"],
    closeTokens: ["fi", "done"],
    neutralTokens: ["do", "in", "then", "else"]
  },
  verilog: {
    caseSensitive: true,
    ignoreBlocks: [
      {
        open: "/\\*",
        close: "\\*/"
      },
      {
        open: "//",
        singleline: true
      }
    ],
    openTokens: ["module", "case", "begin"],
    closeTokens: ["end", "endmodule", "endcase"],
    neutralTokens: []
  },
  vhdl: {
    caseSensitive: true,
    ignoreBlocks: [
      {
        open: "--",
        singleline: true
      }
    ],
    openTokens: ["entity", "component", "case", "begin"],
    closeTokens: ["end", "endcase"],
    neutralTokens: []
  },
  crystal: {
    caseSensitive: true,
    ignoreBlocks: [
      {
        open: '"',
        close: '"'
      },
      {
        open: "#",
        singleline: true
      }
    ],
    openTokens: [
      "class",
      "module",
      "struct",
      "enum",
      "macro",
      "def",
      "if",
      "while",
      "case",
      "unless",
      "until",
      "try",
      "do"
    ],
    closeTokens: ["end"],
    neutralTokens: ["else", "elseif", "rescue", "ensure"]
  },
  COBOL: {
    caseSensitive: false,
    openTokens: [
      "program-id",
      "perform",
      "evalute",
      "read",
      "perform",
      "call",
      "evaluate",
      "if",
      "method-id"
    ],
    closeTokens: [
      "end-perform",
      "end-evalute",
      "end-read",
      "end-perform",
      "end-call",
      "end-evaluate",
      "end-if",
      "end program",
      "end method"
    ],
    neutralTokens: [
      "entry",
      "else",
      "when",
      "procedure division",
      "goback",
      "exit program"
    ]
  }
};

export const languages: {
  [index: string]: {
    caseSensitive: boolean;
    ignoreInDelimiters?: Array<{
      open: string;
      close: string;
    }>;
    inlineOpenTokens: Array<string>;
    openTokens: Array<string>;
    closeTokens: Array<string>;
    neutralTokens: Array<string>;
  };
} = {
  ruby: {
    caseSensitive: true,
    ignoreInDelimiters: [
      {
        open: "#",
        close: "\n"
      },
      { open: "=begin", close: "=end" },
      {
        open: '"',
        close: '"'
      }
    ],
    inlineOpenTokens: [
      // Allow stuff like return toto if tutu
      "if",
      "unless"
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
    ignoreInDelimiters: [
      {
        open: '"',
        close: '"'
      },
      {
        open: "'",
        close: "'"
      },
      {
        open: "--\\[\\[",
        close: "--\\]\\]"
      },
      {
        open: "--",
        close: "\n"
      }
    ],
    inlineOpenTokens: [],
    openTokens: ["function", "if", "while", "for"],
    closeTokens: ["end"],
    neutralTokens: ["then", "else", "elseif"]
  },
  elixir: {
    caseSensitive: true,
    ignoreInDelimiters: [
      {
        open: "#",
        close: "\n"
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
    inlineOpenTokens: [],
    openTokens: [
      "fn",
      "defmodule",
      "defmacro(?=.+do)",
      "defmacrop(?=.+do)",
      "def(?=.+do)",
      "defp(?=.+do)",
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
      "resources(?=.+do)",
      "scope(?=.+do)"
    ],
    closeTokens: ["end", ", do"],
    neutralTokens: ["do", "else", "elseif", "rescue", "after"]
  },
  shellscript: {
    caseSensitive: true,
    ignoreInDelimiters: [
      {
        open: "#",
        close: "\n"
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
    inlineOpenTokens: [],
    openTokens: ["for", "if", "while", "until"],
    closeTokens: ["fi", "done"],
    neutralTokens: ["do", "in", "then", "else"]
  },
  verilog: {
    caseSensitive: true,
    ignoreInDelimiters: [
      {
        open: "/\\*",
        close: "\\*/"
      },
      {
        open: "//",
        close: "\n"
      }
    ],
    inlineOpenTokens: [],
    openTokens: ["module", "case", "begin"],
    closeTokens: ["end", "endmodule", "endcase"],
    neutralTokens: []
  },
  vhdl: {
    caseSensitive: true,
    ignoreInDelimiters: [
      {
        open: "--",
        close: "\n"
      }
    ],
    inlineOpenTokens: [],
    openTokens: ["entity", "component", "case", "begin"],
    closeTokens: ["end", "endcase"],
    neutralTokens: []
  },
  crystal: {
    caseSensitive: true,
    ignoreInDelimiters: [
      {
        open: '"',
        close: '"'
      },
      {
        open: "#",
        close: "\n"
      }
    ],

    inlineOpenTokens: [],
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
    inlineOpenTokens: [],
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

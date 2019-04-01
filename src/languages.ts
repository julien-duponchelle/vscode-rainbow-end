export const languages: {
    [index: string]: {
        caseSensitive: boolean,
        inlineOpenTokens: Array<string>,
        openTokens: Array<string>,
        closeTokens: Array<string>,
        neutralTokens: Array<string>
    }
} = {
    ruby: {
        caseSensitive: false,
        inlineOpenTokens: [ // Allow stuff like return toto if tutu
            "if",
            "unless",
        ],
        openTokens: [
            "class",
            "module",
            "def",
            "while",
            "do",
            "case",
            "begin",
            "loop",
        ],
        closeTokens: [
            "end",
        ],
        neutralTokens: [
            "elsif",
            "else",
            "when",
            "rescue"
        ]
    },
    lua: {
        caseSensitive: false,
        inlineOpenTokens: [],
        openTokens: [
            "function",
            "if",
            "while",
            "for"
        ],
        closeTokens: [
            "end",
        ],
        neutralTokens: [
            "then",
            "else",
            "elseif",
        ]
    },
    elixir: {
        caseSensitive: false,
        inlineOpenTokens: [],
        openTokens: [
            "defmodule",
            "defmacro",
            "def",
            "if",
            "while",
            "for",
            "case",
            "cond",
            "unless",
            "try",
            "quote",
            "with",
        ],
        closeTokens: [
            "end",
        ],
        neutralTokens: [
            "do",
            "else",
            "elseif",
            "rescue",
            "after"
        ]
    },
    shellscript: {
        caseSensitive: false,
        inlineOpenTokens: [],
        openTokens: [
            "for",
            "if",
            "while",
            "until"
        ],
        closeTokens: [
            "fi",
            "done"
        ],
        neutralTokens: [
            "do",
            "in",
            "then",
            "else"
        ]
    },
    verilog: {
        caseSensitive: false,
        inlineOpenTokens: [],
        openTokens: [
            "module",
            "case",
            "begin"
        ],
        closeTokens: [
            "end",
            "endmodule",
            "endcase"
        ],
        neutralTokens: [
        ]
    },
    vhdl: {
        caseSensitive: false,
        inlineOpenTokens: [],
        openTokens: [
            "entity",
            "component",
            "case",
            "begin"
        ],
        closeTokens: [
            "end",
            "endcase"
        ],
        neutralTokens: [
        ]
    },
    crystal: {
        caseSensitive: false,
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
            "do",
        ],
        closeTokens: [
            "end",
        ],
        neutralTokens: [
            "else",
            "elseif",
            "rescue",
            "ensure"
        ]
    },
    COBOL: {
        caseSensitive: true,
        inlineOpenTokens: [],
        openTokens: [
            "perform",
            "evalute",
            "read",
            "perform",
            "call",
            "evaluate",
            "if"
        ],
        closeTokens: [
            "end-perform",
            "end-evalute",
            "end-read",
            "end-perform",
            "end-call",
            "end-evaluate",
            "end-if"
        ],
        neutralTokens: [
            "else",
            "when"
        ]
    },
};

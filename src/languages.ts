export const languages: {
    [index:string] : {
        inlineOpenTokens: Array<string>,
        openTokens: Array<string>,
        closeTokens: Array<string>,
        neutralTokens: Array<string>
    }
} = {
    ruby: {
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
};

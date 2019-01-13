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
            "try"
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
            "if",
            "module",
            "case",
            "always"
        ],
        closeTokens: [
            "end",
            "endmodule",
            "endcase"
        ],
        neutralTokens: [
            "begin",
            "else"
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
            "try"
        ],
        closeTokens: [
            "end",
        ],
        neutralTokens: [
            "do",
            "else",
            "elseif",
            "rescue",
            "ensure"
        ]
    },
};

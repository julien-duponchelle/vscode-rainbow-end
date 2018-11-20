export const languages: {
    [index:string] : {
        openTokens: Array<string>,
        closeTokens: Array<string>,
        neutralTokens: Array<string>
    }
} = {
    ruby: {
        openTokens: [
            "class",
            "module",
            "if",
            "def",
            "while",
            "do",
            "case",
            "begin"
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
    crystal: {
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

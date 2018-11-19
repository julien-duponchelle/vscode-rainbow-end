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
        ],
        closeTokens: [
            "end",
        ],
        neutralTokens: [
            "elsif",
            "else",
            "when"
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
    }
};

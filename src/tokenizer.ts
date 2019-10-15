"use strict";
export interface Token {
  pos: number;
  length: number;
  type: string;
  content: string;
}

export interface TokenizeParams {
  openRegExp: RegExp;
  closeRegExp: RegExp;
  neutralRegExp: RegExp;
  ignoreRegExp: RegExp | null;
  singleLineIgnoreRegExp: RegExp | null;
  openListComprehensionRegExp: RegExp | null;
  closeListComprehensionRegExp: RegExp | null;
}

export function loadRegexes(language: string) {
  const {
    ignoreBlocks,
    openTokens,
    closeTokens,
    neutralTokens,
    listComprehensions
  } = languages[language];

  let ignoreTokens = null;
  let singleLineIgnoreTokens = null;
  let ignoreRegExp = null;
  let singleLineIgnoreRegExp = null;
  if (ignoreBlocks) {
    ignoreTokens = ignoreBlocks
      .filter(token => !token.singleline)
      .map(({ open, close }) => `${open}[^(${close})]*${close}`)
      .join("|");
    ignoreRegExp = RegExp(`${ignoreTokens}`, "gm");

    singleLineIgnoreTokens = ignoreBlocks
      .filter(token => token.singleline)
      .map(({ open }) => `${open}`)
      .join("|");
    singleLineIgnoreRegExp = RegExp(`(${singleLineIgnoreTokens}).*`, "g");
    console.log(singleLineIgnoreRegExp);
  }

  /*
  The `regexpPrefix` and `regexpSuffix` separators are used instead of \b to ensure that any regexp
  provided as the configurable tokens can be matched. This is relaxed so that words preceded or followed by
  parentheses, square brackets or curly brackets are also matched.
  Previously, there was an issue involving the ':' character
  */

  const regexpPrefix = "(^|\\s)";
  const regexpSuffix = "($|\\s)";

  let openRegExp = RegExp(
    `(?<=${regexpPrefix})(${openTokens.join("|")})(?=${regexpSuffix})`,
    "gm"
  );
  let closeRegExp = RegExp(
    `(?<=${regexpPrefix})(${closeTokens.join("|")})(?=${regexpSuffix})`,
    "gm"
  );
  let neutralRegExp = RegExp(
    `(?<=${regexpPrefix})(${neutralTokens.join("|")})(?=${regexpSuffix})`,
    "gm"
  );

  let openListComprehensionRegExp = null;
  let closeListComprehensionRegExp = null;

  if (listComprehensions) {
    let openListComprehensionTokens = listComprehensions
      .map(({ open }) => `${open}`)
      .join("|");
    openListComprehensionRegExp = RegExp(
      `(${openListComprehensionTokens})`,
      "gm"
    );
    let closeListComprehensionTokens = listComprehensions
      .map(({ close }) => `${close}`)
      .join("|");
    closeListComprehensionRegExp = RegExp(
      `(${closeListComprehensionTokens})`,
      "gm"
    );
  }

  return {
    openRegExp,
    closeRegExp,
    ignoreRegExp,
    singleLineIgnoreRegExp,
    neutralRegExp,
    openListComprehensionRegExp,
    closeListComprehensionRegExp
  };
}

function findAllMatches(str: string, regexp: RegExp | null, type: string) {
  if (!regexp) {
    return [];
  }

  let matches = [];
  let m: any = {};

  while ((m = regexp.exec(str))) {
    matches.push(m);
  }

  return matches.map(match => {
    return {
      content: match[0],
      pos: match.index,
      length: match[0].length,
      keep: true,
      type
    };
  });
}

export function tokenize(
  text: string,
  {
    openRegExp,
    closeRegExp,
    neutralRegExp,
    ignoreRegExp,
    singleLineIgnoreRegExp,
    openListComprehensionRegExp,
    closeListComprehensionRegExp
  }: TokenizeParams
): Token[] {
  let openMatches = findAllMatches(text, openRegExp, "OPEN BLOCK");
  let closeMatches = findAllMatches(text, closeRegExp, "CLOSE BLOCK");
  let neutralMatches = findAllMatches(text, neutralRegExp, "NEUTRAL");
  let ignoreMatches = findAllMatches(text, ignoreRegExp, "COMMENT");
  let openListComprehensionMatches = findAllMatches(
    text,
    openListComprehensionRegExp,
    "OPEN COMPREHENSION"
  );
  let closeListComprehensionMatches = findAllMatches(
    text,
    closeListComprehensionRegExp,
    "CLOSE COMPREHENSION"
  );

  let singleLineIgnoreMatches = findAllMatches(
    text,
    singleLineIgnoreRegExp,
    "SINGLE LINE COMMENT"
  );

  const matchReducer = function(acc: Token[], token: Token, suffix: string) {
    let { pos, length } = token;

    let open = { ...token, length: 1, type: `OPEN ${suffix}` };

    let close = {
      ...token,
      length: 1,
      pos: pos + length - 1,
      type: `CLOSE ${suffix}`
    };

    return [...acc, open, close];
  };

  const convertedIgnoreMatches = [
    ...singleLineIgnoreMatches,
    ...ignoreMatches
  ].reduce(
    (acc: Token[], token: Token) => matchReducer(acc, token, "IGNORE"),
    []
  );

  let matches = [
    ...openListComprehensionMatches,
    ...closeListComprehensionMatches,
    ...convertedIgnoreMatches,
    ...openMatches,
    ...closeMatches,
    ...neutralMatches
  ];

  let tokens = matches.sort(({ pos: posX }, { pos: posY }) => {
    if (posX < posY) {
      return -1;
    }

    if (posX > posY) {
      return 1;
    }

    return 0;
  });

  console.log(tokens);
  return tokens;
}

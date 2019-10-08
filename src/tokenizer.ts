import { close } from "fs";

export interface Token {
  pos: number;
  length: number;
  type: string;
}

interface TokenizeParams {
  openRegExp: RegExp;
  closeRegExp: RegExp;
  neutralRegExp: RegExp;
  ignoreRegExp: RegExp | null;
  singleLineIgnoreRegExp: RegExp | null;
  openListComprehensionRegExp: RegExp | null;
  closeListComprehensionRegExp: RegExp | null;
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

  const ignoreMatchReducer = function(acc: Token[], token: Token) {
    let { pos, length } = token;

    let open = { ...token, length: 1, type: "OPEN IGNORE" };

    let close = {
      ...token,
      length: 1,
      pos: pos + length - 1,
      type: "CLOSE IGNORE"
    };

    return [...acc, open, close];
  };

  const convertedIgnoreMatches = [
    ...singleLineIgnoreMatches,
    ...ignoreMatches
  ].reduce(ignoreMatchReducer, []);

  let matches = [
    ...convertedIgnoreMatches,
    ...openMatches,
    ...closeMatches,
    ...neutralMatches,
    ...openListComprehensionMatches,
    ...closeListComprehensionMatches
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

  return tokens;
}

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
    singleLineIgnoreRegExp
  }: TokenizeParams
): Token[] {
  let openMatches = findAllMatches(text, openRegExp, "OPEN BLOCK");
  let closeMatches = findAllMatches(text, closeRegExp, "CLOSE BLOCK");
  let neutralMatches = findAllMatches(text, neutralRegExp, "NEUTRAL");
  let ignoreMatches = findAllMatches(text, ignoreRegExp, "IGNORE").concat(
    findAllMatches(text, singleLineIgnoreRegExp, "IGNORE")
  );

  let matches = openMatches.concat(closeMatches).concat(neutralMatches);
  matches.sort(({ pos: posX }, { pos: posY }) => {
    if (posX < posY) {
      return -1;
    }

    if (posX > posY) {
      return 1;
    }

    return 0;
  });
  console.log(matches);

  console.log(ignoreMatches);

  for (let { pos: begin, length: length } of ignoreMatches) {
    let end = begin + length;
    for (let match of matches) {
      let { pos } = match;
      if (begin <= pos && pos < end) {
        /* token is inside an ignore block and should be ignored */
        match.keep = false;
      }
    }
  }

  let tokens = matches.filter(({ keep }) => keep);
  console.log(tokens);

  return tokens;
}

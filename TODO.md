- [ ] rewrite languages.ts to support list comprehensions where it is due
- [ ] rewrite parser in extension.ts to allow for 3 differente environments:
    * default: cycles colors through nesting code blocks
    * comments: enter upon an open ignore-block token. ignores everything inside until the closing token
    * comprehensions: matches diferrently, keeping its own color counter,
      allowing just for inline tokens. should support nesting

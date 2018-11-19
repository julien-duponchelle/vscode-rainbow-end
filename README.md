# Rainbow End

[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/jduponchelle.rainbow-end.svg)](https://marketplace.visualstudio.com/items?itemName=jduponchelle.rainbow-end) [![Installs](https://vsmarketplacebadge.apphb.com/installs/jduponchelle.rainbow-end.svg)](https://marketplace.visualstudio.com/items?itemName=jduponchelle.rainbow-end)

This extension allows to identify keyword / end with colours.

## Languages supported

* Ruby
* Lua

## Screenshots

![Ruby dark theme](images/1.png)

![Ruby light theme](images/2.png)

![Lua](images/lua.png)


## Colors customization

You can override the color by putting in your `settings.json`:

```json
{
    "workbench.colorCustomizations": {
        "rainbowend.deep1": "#e06c75",
        "rainbowend.deep2": "#6ca2e0",
        "rainbowend.deep3": "#e0de6c"
    }
}
```

## Release Notes

### 0.2.0

Multi languages support

### 0.1.0

Add colors customization

### 0.0.2

Fix parsing when keyword are in the middle of another word

### 0.0.1

Initial release of Rainbow End

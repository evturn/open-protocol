# eslint-plugin-open-protocol

ESLinter

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-open-protocol`:

```
$ npm install eslint-plugin-open-protocol --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-open-protocol` globally.

## Usage

Add `open-protocol` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "open-protocol"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "open-protocol/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here






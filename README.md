# Jest Reporter DFH

A custom jest reporter built for @deanacus/dfhscripts and other specific use cases.

Displays a pretty green tick for passed tests, a warning circle for skipped tests, and a scary red
cross for failures.

Also reports on skipped individual tests and skipped test suites.

## Install

Yarn:

```
yarn add -D @deanacus/jest-reporter-dfh
```

NPM:

```
npm install -D @deanacus/jest-reporter-dfh
```

## Usage:

package.json:

```
{
  ...
  "jest": {
    ...
    "reporters": ["@deanacus/jest-reporter-dfh"],
    ...
  }
  ...
}
```

jest.config.js:

```
module.exports = {
  ...
  reporters: ['@deanacus/jest-reporter-dfh'],
  ...
}
```

---

Built with [ryparker/jest-reporter-template](https://github.com/ryparker/jest-reporter-template)

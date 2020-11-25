# rollup-plugin-import-map

Rollup plugin to apply [import map](https://github.com/WICG/import-maps#multiple-import-map-support) mapping to ECMAScript modules (ESM) ahead of time.

## Installation

```bash
$ npm install rollup-plugin-import-map
```

## Usage

```js
import importMapPlugin from "rollup-plugin-import-map";

const map = {
    imports: {
        'lit-element': 'https://cdn.eik.dev/lit-element/v2'
    }
};

export default {
  input: "source/main.js",
  plugins: [importMapPlugin(map)],
  output: {
    file: "build.js",
    format: "esm",
  },
};
```

## Description

This plugin transform import specifiers in ESM based on a mapping defined in one or multiple [import map(s)](https://github.com/WICG/import-maps#multiple-import-map-support). Import maps is a suggested specification to be implemented in browsers but they can be used to apply mapping ahead of time. This module does so.

One use case for import maps is to transform ESM bare import statements to an import statement which is an absolute URL to the same module on a CDN.

Lets say we have the following in our ESM when developing locally with node.js:

```js
import {html, render} from 'lit-html';
```

Then on build we can apply the following import map:

```js
{
  "imports": {
    "lit-html": "https://cdn.eik.dev/npm/lit-html/v1/lit-html.js",
  }
}
```

When applied, our output wil be:

```js
import * as lit from 'https://cdn.eik.dev/npm/lit-html/v1/lit-html.js'
```

## API

The API of the plugin is fairly simple. The plugin can take one import map or an array of import maps.

One import map:

```js
export default {
  input: "source/main.js",
  plugins: [importMapPlugin({ ... })],
  output: {
    file: "build.js",
    format: "esm",
  },
};
```

Array of import maps:

```js
export default {
  input: "source/main.js",
  plugins: [importMapPlugin([
      { ... },
      { ... },
      { ... },
  ])],
  output: {
    file: "build.js",
    format: "esm",
  },
};
```

When an array of import maps is provided and multiple import maps is set of map the same import specifier, the last import specifies in the array will be the one which is applied during transformation.

## Note on the rollup external option

Any mappings defined by any of the means described above must not occur in the Rollup `external` option.
If so, this module will throw.

In other words, this will not work:

```js
export default {
  input: "source/main.js",
  external: ["lit-element"],
  plugins: [
    importMapPlugin({
      imports: {
        'lit-element': 'https://cdn.eik.dev/lit-element/v2'
      },
    }),
  ],
  output: {
    file: "build.js",
    format: "esm",
  },
};
```

## License

Copyright (c) 2020 Trygve Lie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

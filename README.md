# node-webpack ![](https://img.shields.io/npm/v/node-webpack.svg) ![](https://img.shields.io/npm/l/node-webpack.svg)

> Server-side rendering for your Webpack-built applications (mostly React)

## Installation

```
$> npm install --save node-webpack webpack
```

## Usage

**webpack.config.js**

```js
module.exports = {

  context: __dirname,

  output: {
    publicPath: `http://cdn.example.org/statics/`
  },

  module: {
    loaders: [ {
      test: /\.png$/,
      loader: `file`
    } ]
  }

};
```

**index.js**

```js
let { setupNodeWebpack } = require(`node-webpack`);
let webpackConfiguration = require(`./webpack.config.js`);

setupNodeWebpack(webpackConfiguration);

let backgroundUrl = require(`./static/background.png`);
// = http://cdn.example.org/statics/9c1f1d673ce6d5f92f7d1c59c8bfb1f4.png
```

## How does it work?

Instead of manually implementing the whole webpack resolution process like [webpack-isomorphic-tools](https://github.com/halt-hammerzeit/webpack-isomorphic-tools), node-webpack takes a much shorter path by directly asking Webpack to compile the required module, and returning the result. It might be a tad bit slower, but this process has many advantages:

  - The code is extremely small, which makes node-webpack less likely to contain bugs than big projects.

  - The webpack configuration is directly fed to Webpack, which means that every Webpack feature (plugins, loaders, etc) is supported out-of-the-box, regardless of the actual Webpack version.

  - There's absolutely zero configuration overhead. Your webpack configuration is the only one you will ever need.

  - Since we're only processing modules that Node doesn't natively support, we've got a much better compatibility with third-parties. For example, node-webpack works flawlessly with webpack-dev-middleware and webpack-hot-middleware.

The only real disadvantage is that a separate Webpack build has to be ran for each module that has to be compiled via Webpack. Fortunately, this drawback is quite negligible in practice: assuming that all your require calls occur before your application actually start (which is what you should probably do anyway), you won't have any runtime overhead.

## Small catch

Make sure to call `setupNodeWebpack` before making any other significant `require` call.

This requirement may cause an issue when using babel-node: the transpiler will convert your ES6 `import` statements into require calls, then hoist them at the very top of your files. So, when using node-webpack, be careful not to use significant `import` statements in the same file than the one you to setup node-webpack. Only use `require` calls, and use one of them to bootstrap another `import`-powered entry point).

**wrong**

```js
import { setupNodeWebpack } from 'node-webpack;

setupNodeWebpack(...);

// This import will be evaled before the setup has been done
import backgroundUrl from './static/background.png';
```

**right**

```js
import { setupNodeWebpack } from 'node-webpack';

setupNodeWebpack(...);
require(`./entrypoint`);
```

## License (MIT)

> **Copyright © 2016 Maël Nison**
>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

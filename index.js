let deasync = require(`deasync`);
let MemoryFS = require(`memory-fs`);
let path = require(`path`);
let vm = require(`vm`);
let webpack = require(`webpack`);

let Module = module.constructor;

exports.setupNodeWebpack = function setupNodeWebpack(webpackBaseConfiguration, { ignoreExtensions = Object.keys(Module._extensions) } = {}) {

    if (!webpackBaseConfiguration.context)
        throw new Error(`Missing "context" option in your webpack configuration`);

    let loadModuleFromWebpack = deasync((path, callback) => {

        let webpackConfiguration = Object.assign({}, webpackBaseConfiguration, {

            entry: { main: path },

            output: Object.assign({}, webpackBaseConfiguration.output, {
                path: `/`,
                filename: `[name].js`
            })

        });

        let compiler = Object.assign(webpack(webpackConfiguration), {

            outputFileSystem: new MemoryFS()

        });

        return new Promise((resolve, reject) => {

            compiler.run((err, stats) => {

                if (err) reject(err);
                else resolve(stats);

            });

        }).then(() => {

            let fileContent = compiler.outputFileSystem.readFileSync(`/main.js`).toString();
            let moduleOutput = vm.runInNewContext(fileContent);

            callback(null, moduleOutput);

        }).catch(err => {

            callback(err, null);

        });

    });

    let originalRequire = Module.prototype.require;

    Module.prototype.require = function (moduleName) {

        let contextPath = path.resolve(webpackBaseConfiguration.context);
        let resolvedPath = Module._resolveFilename(moduleName, this, false);

        if (Module._cache[resolvedPath])
            return Module._cache[resolvedPath].exports;

        if (!resolvedPath.startsWith(`${contextPath}${path.sep}`))
            return originalRequire.call(this, moduleName);

        let ext = path.extname(resolvedPath);

        if (ignoreExtensions && !ext || ignoreExtensions.includes(ext))
            return originalRequire.call(this, moduleName);

        let newModule = Module._cache[resolvedPath] = new Module(resolvedPath, this);

        newModule.exports = loadModuleFromWebpack(moduleName);
        newModule.loaded = true;

        return newModule.exports;

    };

}

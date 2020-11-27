const isBare = (str) => {
    if (str.startsWith('/') || str.startsWith('./') || str.startsWith('../') || str.substr(0, 7) === 'http://' || str.substr(0, 8) === 'https://') {
        return false;
    }
    return true;
};

const builder = (options, cache, map) => {
    Object.keys(map.imports).forEach((key) => {
        const value = map.imports[key];

        if (isBare(value)) {
            throw Error(`Import specifier can NOT be mapped to a bare import statement. Import specifier "${key}" is being wrongly mapped to "${value}"`);
        }

        if (typeof options.external === 'function') {
            if (options.external(key)) throw Error('Import specifier must NOT be present in the Rollup external config. Please remove specifier from the Rollup external config.');
        }

        if (Array.isArray(options.external)) {
            if (options.external.includes(key)) throw Error('Import specifier must NOT be present in the Rollup external config. Please remove specifier from the Rollup external config.');
        }

        cache.set(key, value);
    });
};

export function rollupImportMapPlugin(maps = []) {
    const cache = new Map();
    return {
        name: 'rollup-plugin-import-map',

        buildStart(options) {
            if (Array.isArray(maps)) {
                maps.forEach((map) => {
                    builder(options, cache, map);
                });
                return;
            }
            builder(options, cache, maps);
        },

        resolveId(importee) {
            const url = cache.get(importee);
            if (url) {
                return {
                    id: url,
                    external: true
                };
            }
            return null;
        }
    };
}

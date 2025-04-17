import { parse, resolve } from '@import-maps/resolve';
import { URL } from 'node:url';
import merge from 'deepmerge';
import path from 'node:path';
import fs from 'node:fs/promises';

const isString = (str) => typeof str === 'string';

const validateBaseArgument = (base) => {
    if (isString(base)) {
        return false;
    }

    if (base instanceof URL) {
        return false;
    }

    return true;
};

const checkMapAgainstExternals = (map, options) => Object.keys(map.imports).forEach((key) => {
    if (typeof options.external === 'function') {
        if (options.external(key)) throw Error('Import specifier must NOT be present in the Rollup external config. Please remove specifier from the Rollup external config.');
    }

    if (Array.isArray(options.external)) {
        if (options.external.includes(key)) throw Error('Import specifier must NOT be present in the Rollup external config. Please remove specifier from the Rollup external config.');
    }
});

const fileReader = (pathname = '') => new Promise((success, reject) => {
    const filepath = path.normalize(pathname);
    fs.readFile(filepath).then((file) => {
        try {
            const obj = JSON.parse(file);
            success(obj);
        } catch (error) {
            reject(error);
        }
    }).catch(reject);
});

export function rollupImportMapPlugin(baseURL, importMaps = []) {
    if (validateBaseArgument(baseURL)) {
        throw new TypeError('First argument must be a URL object or a valid absolute URL as a string');
    }

    const base = isString(baseURL) ? new URL(baseURL) : baseURL;
    const maps = Array.isArray(importMaps) ? importMaps : [importMaps];
    let cache = {};

    return {
        name: 'rollup-plugin-import-map',

        async buildStart(options) {
            const mappings = maps.map((item) => {
                if (isString(item)) {
                    return fileReader(item);
                }

                return item;
            });

            const loadedMaps = await Promise.all(mappings);

            const mapObject = merge.all(loadedMaps);
            checkMapAgainstExternals(mapObject, options);

            cache = parse(mapObject, base);
        },

        resolveId(importee) {
            const { resolvedImport, matched } = resolve(importee, cache, base);
            if (matched) {
                return {
                    id: resolvedImport.href,
                    external: true,
                };
            }
            return null;
        },
    };
}

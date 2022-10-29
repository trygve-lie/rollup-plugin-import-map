import { rollupImportMapPlugin } from '../lib/plugin.js';
import { rollup } from 'rollup';
import tap from 'tap';

const simple = new URL('../fixtures/modules/simple/main.js', import.meta.url).pathname;
const basic = new URL('../fixtures/modules/basic/main.js', import.meta.url).pathname;
const file = new URL('../fixtures/modules/file/main.js', import.meta.url).pathname;
const map = new URL('../fixtures/simple.map.json', import.meta.url).pathname;
const err = new URL('../fixtures/faulty.map.json', import.meta.url).pathname;

/*
 * When running tests on Windows, the output code get some extra \r on each line.
 * Remove these so snapshots work on all OSes.
 */
const clean = str => str.split('\r').join('');

tap.test('plugin() - target is refered to in external - should reject process', (t) => {
    const options = {
        input: simple,
        external: ['foo'],
        plugins: [rollupImportMapPlugin({
            imports: {
                'foo': 'http://not.a.host.com'
            }
        })],
    }
    t.rejects(rollup(options), new Error('Import specifier must NOT be present in the Rollup external config. Please remove specifier from the Rollup external config.'));
    t.end();
});


tap.test('plugin() - basic module - should replace lit-element with CDN URL', async (t) => {
    const options = {
        input: basic,
        onwarn: (warning, warn) => {
            // Supress logging
        },
        plugins: [rollupImportMapPlugin({
            imports: {
                'lit-element': 'https://cdn.eik.dev/lit-element/v2'
            }
        })],
    }

    const bundle = await rollup(options);
    const { output } = await bundle.generate({ format: 'esm' });

    t.matchSnapshot(clean(output[0].code), 'basic example');
    t.end();
});

tap.test('plugin() - simple module - should replace lit-element with CDN URL', async (t) => {
    const options = {
        input: simple,
        onwarn: (warning, warn) => {
            // Supress logging
        },
        plugins: [rollupImportMapPlugin({
            imports: {
                'lit-element': 'https://cdn.eik.dev/lit-element/v2'
            }
        })],
    }

    const bundle = await rollup(options);
    const { output } = await bundle.generate({ format: 'esm' });

    t.matchSnapshot(clean(output[0].code), 'simple example');
    t.end();
});

tap.test('plugin() - import map maps non bare imports - should replace import statement with CDN URL', async (t) => {
    const options = {
        input: simple,
        onwarn: (warning, warn) => {
            // Supress logging
        },
        plugins: [rollupImportMapPlugin({
            imports: {
                'lit-element': 'https://cdn.eik.dev/lit-element/v2',
                './utils/dom.js': 'https://cdn.eik.dev/something/v666'
            }
        })],
    }

    const bundle = await rollup(options);
    const { output } = await bundle.generate({ format: 'esm' });

    t.matchSnapshot(clean(output[0].code), 'non bare imports');
    t.end();
});

tap.test('plugin() - import map maps address to a relative path - should replace import statement with relative path', async (t) => {
    const options = {
        input: simple,
        onwarn: (warning, warn) => {
            // Supress logging
        },
        plugins: [rollupImportMapPlugin({
            imports: {
                'lit-element': './lit-element/v2',
            }
        })],
    }

    const bundle = await rollup(options);
    const { output } = await bundle.generate({ format: 'esm' });

    t.matchSnapshot(clean(output[0].code), 'non bare imports');
    t.end();
});

tap.test('plugin() - import specifier is a interior package path - should replace with CDN URL', async (t) => {
    const options = {
        input: file,
        onwarn: (warning, warn) => {
            // Supress logging
        },
        plugins: [rollupImportMapPlugin({
            imports: {
                'lit-element': 'https://cdn.eik.dev/lit-element/v2',
                'lit-html/lit-html': 'https://cdn.eik.dev/lit-html/v2',
                'lit-html': 'https://cdn.eik.dev/lit-html/v1',
            }
        })],
    }

    const bundle = await rollup(options);
    const { output } = await bundle.generate({ format: 'esm' });

    t.matchSnapshot(clean(output[0].code), 'interior package path');
    t.end();
});

tap.test('plugin() - import map maps address to a bare importer - should throw', async (t) => {
    const options = {
        input: simple,
        onwarn: (warning, warn) => {
            // Supress logging
        },
        plugins: [rollupImportMapPlugin({
            imports: {
                'lit-element': 'lit-element/v2',
            }
        })],
    }
    
    t.rejects(rollup(options), new Error('Import specifier can NOT be mapped to a bare import statement. Import specifier "lit-element" is being wrongly mapped to "lit-element/v2"'));
    t.end();
});

tap.test('plugin() - array of import map maps - should replace import statements with CDN URLs', async (t) => {
    const options = {
        input: simple,
        onwarn: (warning, warn) => {
            // Supress logging
        },
        plugins: [rollupImportMapPlugin([{
            imports: {
                'lit-element': 'https://cdn.eik.dev/lit-element/v2'
            }
        },
        {
            imports: {
                './utils/dom.js': 'https://cdn.eik.dev/something/v666'
            }
        }])],
    }

    const bundle = await rollup(options);
    const { output } = await bundle.generate({ format: 'esm' });

    t.matchSnapshot(clean(output[0].code), 'non bare imports');
    t.end();
});

tap.test('plugin() - input is a filepath to a map file - should load map and replace import statements with CDN URLs', async (t) => {
    const options = {
        input: simple,
        onwarn: (warning, warn) => {
            // Supress logging
        },
        plugins: [rollupImportMapPlugin(map)],
    }

    const bundle = await rollup(options);
    const { output } = await bundle.generate({ format: 'esm' });

    t.matchSnapshot(clean(output[0].code), 'non bare imports');
    t.end();
});

tap.test('plugin() - input is a filepath to a map file and an inline map - should load map and replace import statements with CDN URLs', async (t) => {
    const options = {
        input: simple,
        onwarn: (warning, warn) => {
            // Supress logging
        },
        plugins: [rollupImportMapPlugin([
        map,
        {
            imports: {
                './utils/dom.js': 'https://cdn.eik.dev/something/v666'
            }
        }])],
    }

    const bundle = await rollup(options);
    const { output } = await bundle.generate({ format: 'esm' });

    t.matchSnapshot(clean(output[0].code), 'non bare imports');
    t.end();
});

tap.test('plugin() - input is a filepath to a non existing map file - should throw', async (t) => {
    const options = {
        input: simple,
        onwarn: (warning, warn) => {
            // Supress logging
        },
        plugins: [rollupImportMapPlugin('./foo.map.json')],
    }
    
    t.rejects(rollup(options), /ENOENT: no such file or directory, open 'foo.map.json'/);
    t.end();
});

tap.test('plugin() - input is a filepath to a faulty map file - should throw', async (t) => {
    const options = {
        input: simple,
        onwarn: (warning, warn) => {
            // Supress logging
        },
        plugins: [rollupImportMapPlugin(err)],
    }
    
    t.rejects(rollup(options), /Unexpected end of JSON input/);
    t.end();
});

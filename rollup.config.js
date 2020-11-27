export default {
    input: 'lib/plugin.js',
    external: ['node-fetch', 'url'],
    output: [
        { file: 'dist/plugin.cjs', format: 'cjs' },
    ]
};

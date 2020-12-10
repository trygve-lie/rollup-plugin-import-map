export default {
    input: 'src/test/plugin.js',
    external: ['rollup', 'path', 'tap', 'url', 'fs'],
    output: [
        { dir: 'dist/', format: 'cjs', preserveModules: true },
    ],
};

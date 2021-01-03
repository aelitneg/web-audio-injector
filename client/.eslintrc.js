module.exports = {
    env: {
        commonjs: true,
        es2017: true,
        browser: true,
        jquery: true,
    },
    extends: ['eslint:recommended', 'prettier'],
    parserOptions: {
        sourceType: 'module',
    },
};

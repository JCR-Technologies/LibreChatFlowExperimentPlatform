'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var typescript = require('rollup-plugin-typescript2');
var resolve = require('@rollup/plugin-node-resolve');
var pkg = require('./package.json');
var peerDepsExternal = require('rollup-plugin-peer-deps-external');
var commonjs = require('@rollup/plugin-commonjs');
var replace = require('@rollup/plugin-replace');
var terser = require('@rollup/plugin-terser');
var generatePackageJson = require('rollup-plugin-generate-package-json');

const plugins = [
  peerDepsExternal(),
  resolve(),
  replace({
    __IS_DEV__: process.env.NODE_ENV === 'development',
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    useTsconfigDeclarationDir: true,
  }),
  terser(),
];

const subfolderPlugins = (folderName) => [
  ...plugins,
  generatePackageJson({
    baseContents: {
      name: `${pkg.name}/${folderName}`,
      private: true,
      main: '../index.js',
      module: './index.es.js', // Adjust to match the output file
      types: `../types/${folderName}/index.d.ts`, // Point to correct types file
    },
  }),
];

var rollup_config = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
        exports: 'named',
      },
    ],
    ...{
      external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        'react',
        'react-dom',
      ],
      preserveSymlinks: true,
      plugins,
    },
  },
  // Separate bundle for react-query related part
  {
    input: 'src/react-query/index.ts',
    output: [
      {
        file: 'dist/react-query/index.es.js',
        format: 'esm',
        exports: 'named',
        sourcemap: true,
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      'react',
      'react-dom',
      // 'librechat-data-provider', // Marking main part as external
    ],
    preserveSymlinks: true,
    plugins: subfolderPlugins('react-query'),
  },
];

exports.default = rollup_config;

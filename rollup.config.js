import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import css from 'rollup-plugin-css-only';
import livereload from 'rollup-plugin-livereload';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = spawn('pnpm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true,
      });
      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    },
  };
}

function cacheBusting() {
  return {
    name: 'cache-busting',
    writeBundle() {
      if (production) {
        const timestamp = Date.now();
        const html = readFileSync('public/index.html', 'utf8');

        const updatedHtml = html
          .replace(/(\.\/build\/bundle\.css)(\?v=\d+)*/g, `$1?v=${timestamp}`)
          .replace(/(\.\/build\/bundle\.js)(\?v=\d+)*/g, `$1?v=${timestamp}`)
          .replace(/(\.\/global\.css)(\?v=\d+)*/g, `$1?v=${timestamp}`)
          .replace(/(\.\/favicon\.png)(\?v=\d+)*/g, `$1?v=${timestamp}`);

        writeFileSync('public/index.html', updatedHtml);
        console.log(`Cache busting applied with timestamp: ${timestamp}`);
      }
    },
  };
}

export default {
  input: 'src/main.ts',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js',
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess({
        sourceMap: !production,
      }),
      compilerOptions: {
        dev: !production,
      },
    }),
    css({ output: 'bundle.css' }),
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
    }),

    // Development plugins
    !production && serve(),
    !production && livereload('public'),

    // Production plugins
    production && terser(),
    production && cacheBusting(),
  ],
  watch: {
    clearScreen: false,
  },
};

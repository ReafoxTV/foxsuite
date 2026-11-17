import * as esbuild from 'esbuild';
import { readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtemp, rm } from 'node:fs/promises';

const sourceRoot = process.argv[2];
const outputFile = process.argv[3];

if (!sourceRoot || !outputFile) {
  throw new Error('Usage: build-flac-encoder.mjs <mediabunny-source> <output-file>');
}

let workerIndex = 0;
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'foxconvert-flac-'));
const inlineWorkerPlugin = {
  name: 'foxconvert-inline-worker',
  setup(build) {
    build.onLoad({ filter: /\.worker\.(js|jsx|ts|tsx)$/ }, async ({ path }) => {
      const output = join(temporaryDirectory, `${basename(path)}-${workerIndex++}.mjs`);
      await esbuild.build({
        entryPoints: [path],
        bundle: true,
        minify: true,
        outfile: output,
        target: 'es2017',
        format: 'esm',
        define: { 'import.meta.url': '""' }
      });
      const workerCode = await readFile(output, 'utf8');
      return {
        contents: `import inlineWorker from '__inline-worker'; export default function Worker() { return inlineWorker(${JSON.stringify(workerCode)}); }`,
        loader: 'js'
      };
    });
    build.onResolve({ filter: /^__inline-worker$/ }, ({ path }) => ({
      path,
      namespace: 'inline-worker'
    }));
    build.onLoad({ filter: /.*/, namespace: 'inline-worker' }, () => ({
      contents: `export default async function inlineWorker(scriptText) {
        const blob = new Blob([scriptText], { type: 'text/javascript' });
        return new Worker(URL.createObjectURL(blob));
      }`,
      loader: 'js'
    }));
  }
};

try {
  await esbuild.build({
    entryPoints: [join(sourceRoot, 'packages/flac-encoder/src/index.ts')],
    bundle: true,
    format: 'esm',
    target: 'es2021',
    external: ['mediabunny'],
    outfile: outputFile,
    plugins: [inlineWorkerPlugin],
    legalComments: 'inline'
  });
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

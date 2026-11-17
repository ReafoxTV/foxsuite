import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.argv[2];
if (!root) throw new Error('Usage: patch-flac-source.mjs <mediabunny-source>');

async function replaceOnce(relativePath, before, after) {
  const file = join(root, relativePath);
  const source = await readFile(file, 'utf8');
  const occurrences = source.split(before).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Expected one matching source block in ${relativePath}; found ${occurrences}.`);
  }
  await writeFile(file, source.replace(before, after));
}

await replaceOnce(
  'packages/flac-encoder/src/bridge.c',
  '#define COMPRESSION_LEVEL 5\n',
  ''
);
await replaceOnce(
  'packages/flac-encoder/src/bridge.c',
  'int init_encoder(int channels, int sample_rate, int bits_per_sample) {\n',
  'int init_encoder(int channels, int sample_rate, int bits_per_sample, int compression_level) {\n'
    + '\tif (compression_level < 0 || compression_level > 8) {\n'
    + '\t\treturn 0;\n'
    + '\t}\n\n'
);
await replaceOnce(
  'packages/flac-encoder/src/bridge.c',
  'FLAC__stream_encoder_set_compression_level(ctx->encoder, COMPRESSION_LEVEL);',
  'FLAC__stream_encoder_set_compression_level(ctx->encoder, compression_level);'
);
await replaceOnce(
  'packages/flac-encoder/src/encoder.ts',
  '];\n\nclass FlacEncoder extends CustomAudioEncoder {',
  '];\n\n'
    + 'let flacCompressionLevel = 5;\n\n'
    + 'export const setFlacCompressionLevel = (level: number) => {\n'
    + '\tif (!Number.isInteger(level) || level < 0 || level > 8) {\n'
    + '\t\tthrow new RangeError(\'FLAC compression level must be an integer from 0 to 8.\');\n'
    + '\t}\n'
    + '\tflacCompressionLevel = level;\n'
    + '};\n\n'
    + 'class FlacEncoder extends CustomAudioEncoder {'
);
await replaceOnce(
  'packages/flac-encoder/src/encoder.ts',
  '\t\t\t\t\tbitsPerSample,\n\t\t\t\t},',
  '\t\t\t\t\tbitsPerSample,\n\t\t\t\t\tcompressionLevel: flacCompressionLevel,\n\t\t\t\t},'
);
await replaceOnce(
  'packages/flac-encoder/src/encode.worker.ts',
  'let initEncoderFn: (channels: number, sampleRate: number, bitsPerSample: number) => number;',
  'let initEncoderFn: (channels: number, sampleRate: number, bitsPerSample: number, compressionLevel: number) => number;'
);
await replaceOnce(
  'packages/flac-encoder/src/encode.worker.ts',
  "module.cwrap('init_encoder', 'number', ['number', 'number', 'number'])",
  "module.cwrap('init_encoder', 'number', ['number', 'number', 'number', 'number'])"
);
await replaceOnce(
  'packages/flac-encoder/src/encode.worker.ts',
  'const initEncoder = async (numberOfChannels: number, sampleRate: number, bitsPerSample: 16 | 24) => {',
  'const initEncoder = async (numberOfChannels: number, sampleRate: number, bitsPerSample: 16 | 24, compressionLevel: number) => {'
);
await replaceOnce(
  'packages/flac-encoder/src/encode.worker.ts',
  'const ctx = initEncoderFn(numberOfChannels, sampleRate, bitsPerSample);',
  'const ctx = initEncoderFn(numberOfChannels, sampleRate, bitsPerSample, compressionLevel);'
);
await replaceOnce(
  'packages/flac-encoder/src/encode.worker.ts',
  '\t\t\t\t\t\tcommand.data.bitsPerSample,\n\t\t\t\t\t);',
  '\t\t\t\t\t\tcommand.data.bitsPerSample,\n\t\t\t\t\t\tcommand.data.compressionLevel,\n\t\t\t\t\t);'
);
await replaceOnce(
  'packages/flac-encoder/src/shared.ts',
  '\t\tbitsPerSample: 16 | 24;\n',
  '\t\tbitsPerSample: 16 | 24;\n\t\tcompressionLevel: number;\n'
);
await replaceOnce(
  'packages/flac-encoder/src/index.ts',
  "export { registerFlacEncoder } from './encoder';",
  "export { registerFlacEncoder, setFlacCompressionLevel } from './encoder';"
);

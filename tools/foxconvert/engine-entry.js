import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  FlacOutputFormat,
  MkvOutputFormat,
  Mp3OutputFormat,
  Mp4OutputFormat,
  MovOutputFormat,
  OggOutputFormat,
  Output,
  StreamTarget,
  WavOutputFormat,
  WebMOutputFormat,
  canEncodeAudio
} from 'mediabunny';
import { registerAacEncoder } from '@mediabunny/aac-encoder';
import { registerFlacEncoder, setFlacCompressionLevel } from './flac-encoder.custom.mjs';
import { registerMp3Encoder } from '@mediabunny/mp3-encoder';

export {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  FlacOutputFormat,
  Input,
  MkvOutputFormat,
  Mp3OutputFormat,
  Mp4OutputFormat,
  MovOutputFormat,
  OggOutputFormat,
  Output,
  StreamTarget,
  WavOutputFormat,
  WebMOutputFormat,
  canEncodeAudio,
  registerAacEncoder,
  registerFlacEncoder,
  setFlacCompressionLevel,
  registerMp3Encoder
};

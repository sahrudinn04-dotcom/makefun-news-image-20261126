// Entry point for the news-image-20261126 bounty.
//
// Copies the pre-built front-page image (entry.png, next to this file)
// into the grader's output directory. The copy is byte-for-byte
// deterministic: no timestamps, no randomness, no network.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(HERE, "entry.png");
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const TARGET = join(OUT_DIR, "entry.png");

// PNG files start with this fixed 8-byte signature.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const bytes = readFileSync(SOURCE);
if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error("entry.png is not a valid PNG file");
}
// The bounty caps the image at 1024x1024 px and 1 MiB. The width and
// height live in the IHDR chunk: 4-byte big-endian values at offsets 16
// and 20, right after the 8-byte signature and the 8-byte chunk header.
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 cap`);
}
if (bytes.length > 1024 * 1024) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB cap`);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(TARGET, bytes);
console.log(`wrote ${TARGET} (${bytes.length} bytes)`);

import { Base64 } from 'js-base64';

/**
 * Converts an ASN.1 DER-encoded ECDSA signature to the raw (r || s)
 * 64-byte format.
 *
 * @param derSignature The signature in DER format (as a Buffer or Uint8Array).
 * @returns The signature in raw 64-byte format.
 */
export function derToRaw(derSignature: string) {
  const buffer = Base64.toUint8Array(derSignature);
  let offset = 0;

  // 1. Check SEQUENCE tag
  if (buffer[offset++] !== 0x30) {
    throw new Error('Invalid signature format: Missing SEQUENCE tag.');
  } else {
    offset++;
  }

  // 2. Get r
  const { value: rValue, newOffset: offsetAfterR } = parseSignatureIntegers(
    buffer,
    offset,
    'r'
  );
  offset = offsetAfterR;

  // 3. Get s
  const { value: sValue } = parseSignatureIntegers(buffer, offset, 's');

  // 6. Concatenate and return
  const rawSignature = new Uint8Array(64);
  rawSignature.set(rValue);
  rawSignature.set(sValue, rValue.length);

  if (rawSignature.length !== 64) {
    throw new Error(
      `Invalid signature length, expected 64, got ${rawSignature.length}`
    );
  }

  return rawSignature;
}

function parseSignatureIntegers(
  buffer: Uint8Array,
  startOffset: number,
  component = ''
) {
  let offset = startOffset;

  // Check INTEGER tag
  if (buffer[offset++] !== 0x02) {
    throw new Error(
      `Invalid signature format: Missing INTEGER tag for ${component}.`
    );
  }

  // Read length
  let length = buffer[offset++]!;
  let value = buffer.subarray(offset, offset + length);
  offset += length;

  // Normalize (remove leading 0x00 if present)
  if (length === 33 && value[0] === 0x00) {
    value = value.subarray(1);
  }

  // Handle padding for values shorter than 32 bytes
  if (value.length < 32) {
    const paddedValue = new Uint8Array(32);
    paddedValue.set(value, 32 - value.length); // Pad at the beginning
    value = paddedValue;
    console.log(`${component} - padded from ${value.length} to 32 bytes`);
  }

  // Validate length after normalization
  if (value.length !== 32) {
    throw new Error(
      `Invalid ${component} length: expected 32 bytes, got ${value.length}`
    );
  }

  return { value, newOffset: offset };
}

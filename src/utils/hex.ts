type HexString = `0x${string}`;

export function isHexString(value: string): value is HexString {
  return /^0x[0-9a-fA-F]+$/.test(value);
}

export function toHexString(value: string): HexString {
  if (isHexString(value)) {
    return value;
  }
  return `0x${value}`;
}

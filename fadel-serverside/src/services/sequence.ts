import { Counter } from "../models/counter.model";

export async function getNextSequence(key: string): Promise<number> {
  const c = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return c!.seq;
}

export function formatSku(seq: number, prefix = "ART"): string {
  return `${prefix}-${String(seq).padStart(6, "0")}`;
}

// Generate an EAN-13 barcode string from a sequence
export function formatBarcodeFromSeq(seq: number, prefix = "200"): string {
  const body = `${prefix}${String(seq).padStart(9, "0")}`; // 12 digits
  const check = ean13CheckDigit(body);
  return `${body}${check}`; // 13 digits
}

// EAN-13 checksum calculation
function ean13CheckDigit(n12: string): number {
  const digits = n12.split("").map((d) => parseInt(d, 10));
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = digits[i];
    sum += i % 2 === 0 ? d : d * 3; // positions start at 0 from left
  }
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

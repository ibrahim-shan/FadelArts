import { NextResponse } from "next/server";
import { getProductBySlug } from "@/data/products";

export function GET(_: Request, { params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

import { NextRequest, NextResponse } from "next/server";

const API_ORIGIN = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return raw.replace(/\/api\/?$/, "").replace(/\/$/, "");
})();

async function proxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/");
  const search = req.nextUrl.search;
  const url = `${API_ORIGIN}/api/${path}${search}`;

  const headers = new Headers();
  const auth = req.headers.get("authorization");
  const ct = req.headers.get("content-type");
  if (auth) headers.set("authorization", auth);
  if (ct) headers.set("content-type", ct);

  const body = req.method !== "GET" && req.method !== "HEAD" ? await req.arrayBuffer() : undefined;

  const upstream = await fetch(url, {
    method: req.method,
    headers,
    body: body ? Buffer.from(body) : undefined,
    // @ts-expect-error — Node 18 fetch supports this
    duplex: "half"
  });

  const data = await upstream.arrayBuffer();
  return new NextResponse(data, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" }
  });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;

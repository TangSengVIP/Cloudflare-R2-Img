export const onRequestPost = async ({ request, env }) => {
  const enabled = (env.DEV_ENABLE_SEED || "").trim();
  if (enabled !== "1") {
    return new Response("forbidden", { status: 403 });
  }
  const url = new URL(request.url);
  const key = (url.searchParams.get("key") || "").trim();
  const src = (url.searchParams.get("url") || "").trim();
  if (!key) {
    return new Response(JSON.stringify({ error: "missing key" }), { status: 400, headers: { "content-type": "application/json" } });
  }
  let body; let ct = "image/png";
  if (src) {
    const r = await fetch(src);
    if (!r.ok) return new Response(JSON.stringify({ error: "fetch failed", status: r.status }), { status: 400, headers: { "content-type": "application/json" } });
    body = await r.arrayBuffer();
    const cth = r.headers.get("content-type");
    if (cth) ct = cth;
  } else {
    const png = Uint8Array.from([
      0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x0d,0x49,0x48,0x44,0x52,
      0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x08,0x06,0x00,0x00,0x00,0x1f,0x15,0xc4,
      0x89,0x00,0x00,0x00,0x0a,0x49,0x44,0x41,0x54,0x78,0x9c,0x63,0xf8,0xff,0xff,0x3f,
      0x00,0x05,0xfe,0x02,0xfe,0xa7,0x52,0xe6,0x98,0x00,0x00,0x00,0x00,0x49,0x45,0x4e,
      0x44,0xae,0x42,0x60,0x82
    ]);
    body = png.buffer;
  }
  await env.img.put(key, body, { httpMetadata: { contentType: ct } });
  return new Response(JSON.stringify({ ok: true, key }), { status: 200, headers: { "content-type": "application/json" } });
};

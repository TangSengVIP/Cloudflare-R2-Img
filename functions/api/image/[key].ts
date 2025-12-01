export const onRequestGet = async ({ env, params, request }) => {
  const key = params.key;
  if (!key) {
    return new Response("bad request", { status: 400 });
  }
  const allowed = (env.ALLOWED_REFERRERS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  if (allowed.length) {
    const ref = request.headers.get("referer") || "";
    let pass = false;
    if (ref) {
      try {
        const host = new URL(ref).hostname.toLowerCase();
        pass = allowed.some(a => host === a || (a.startsWith("*.") && host.endsWith(a.slice(2))));
      } catch {}
    }
    if (!pass) {
      return new Response("forbidden", { status: 403 });
    }
  }
  const obj = await env.IMAGES.get(key);
  if (!obj) {
    return new Response("not found", { status: 404 });
  }
  const headers = new Headers();
  const ct = obj.httpMetadata && obj.httpMetadata.contentType ? obj.httpMetadata.contentType : "application/octet-stream";
  headers.set("content-type", ct);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(obj.body, { status: 200, headers });
};

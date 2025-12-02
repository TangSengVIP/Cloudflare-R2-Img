export const onRequestGet = async ({ env, params, request }) => {
  const key = params.key;
  if (!key) {
    return new Response("bad request", { status: 400 });
  }
  const allowed = (env.ALLOWED_REFERRERS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  if (allowed.length) {
    const ref = request.headers.get("referer") || "";
    let pass = false;
    const reqHost = (() => { try { return new URL(request.url).hostname.toLowerCase(); } catch { return ""; } })();
    if (ref) {
      try {
        const host = new URL(ref).hostname.toLowerCase();
        pass = host === reqHost || allowed.some(a => host === a || (a.startsWith("*.") && host.endsWith(a.slice(2))));
      } catch {}
    } else {
      pass = true;
    }
    if (!pass) {
      return new Response("forbidden", { status: 403 });
    }
  }
  const obj = await env.img.get(key);
  try {
    // no-op: placeholder to catch binding errors
  } catch {
    return new Response("storage error", { status: 500 });
  }
  if (!obj) {
    return new Response("not found", { status: 404 });
  }
  const headers = new Headers();
  const ct = obj.httpMetadata && obj.httpMetadata.contentType ? obj.httpMetadata.contentType : "application/octet-stream";
  headers.set("content-type", ct);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(obj.body, { status: 200, headers });
};

export const onRequestHead = async ({ env, params, request }) => {
  const key = params.key;
  if (!key) {
    return new Response("bad request", { status: 400 });
  }
  const allowed = (env.ALLOWED_REFERRERS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  if (allowed.length) {
    const ref = request.headers.get("referer") || "";
    let pass = false;
    const reqHost = (() => { try { return new URL(request.url).hostname.toLowerCase(); } catch { return ""; } })();
    if (ref) {
      try {
        const host = new URL(ref).hostname.toLowerCase();
        pass = host === reqHost || allowed.some(a => host === a || (a.startsWith("*.") && host.endsWith(a.slice(2))));
      } catch {}
    } else {
      pass = true;
    }
    if (!pass) {
      return new Response("forbidden", { status: 403 });
    }
  }
  const head = await env.img.head(key);
  try {
    // no-op: placeholder to catch binding errors
  } catch {
    return new Response("storage error", { status: 500 });
  }
  if (!head) {
    return new Response("not found", { status: 404 });
  }
  const headers = new Headers();
  const ct = head.httpMetadata && head.httpMetadata.contentType ? head.httpMetadata.contentType : "application/octet-stream";
  headers.set("content-type", ct);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(null, { status: 200, headers });
};

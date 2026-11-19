// Wordlong server: zero dependencies. Run with: node server.js
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, "public", "index.html");
const docs = new Map();   // "rooms/ABC123/players/u1" -> { data, version, touched }
const leases = new Map(); // path -> { holder, exp }
const DAY = 24 * 3600 * 1000;

function parent(p) { return p.split("/").slice(0, -1).join("/"); }
function validPath(p) { return typeof p === "string" && /^[A-Za-z0-9_\-.~:@+]+(\/[A-Za-z0-9_\-.~:@+]+)*$/.test(p) && p.length < 300; }

// forget rooms older than a day
setInterval(() => {
  const cutoff = Date.now() - DAY;
  for (const [k, v] of docs) if (v.touched < cutoff) docs.delete(k);
}, 3600 * 1000).unref();

function api(op, b) {
  const p = b.path || b.collection;
  if (!validPath(p)) return { error: "bad path" };
  switch (op) {
    case "get": { const d = docs.get(p); return { data: d ? d.data : null, version: d ? d.version : 0 }; }
    case "set": { const d = docs.get(p); docs.set(p, { data: b.data, version: (d ? d.version : 0) + 1, touched: Date.now() }); return { ok: true }; }
    case "update": {
      const d = docs.get(p); if (!d) return { error: "document does not exist" };
      d.data = Object.assign({}, d.data, b.data); d.version++; d.touched = Date.now(); return { ok: true };
    }
    case "delete": docs.delete(p); return { ok: true };
    case "list": {
      const out = [];
      for (const [k, v] of docs) if (parent(k) === b.collection) out.push({ id: k.split("/").pop(), data: v.data });
      out.sort((x, y) => (x.id < y.id ? -1 : 1));
      return { docs: out };
    }
    case "acquire": {
      const l = leases.get(p), now = Date.now();
      const ttl = Math.min(Math.max(b.ttlMs || 30000, 1000), 600000);
      if (!l || l.exp < now || l.holder === b.holder) { leases.set(p, { holder: b.holder, exp: now + ttl }); return { acquired: true }; }
      return { acquired: false };
    }
  }
  return { error: "unknown op" };
}

http.createServer((req, res) => {
  if (req.method === "POST" && req.url.startsWith("/api/")) {
    let body = "";
    req.on("data", c => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on("end", () => {
      let out;
      try { out = api(req.url.slice(5), JSON.parse(body || "{}")); } catch (e) { out = { error: "bad request" }; }
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      res.end(JSON.stringify(out));
    });
    return;
  }
  if (req.method === "GET" && (req.url === "/" || req.url.startsWith("/?") || req.url.startsWith("/#"))) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    return fs.createReadStream(INDEX).pipe(res);
  }
  if (req.url === "/healthz") { res.writeHead(200); return res.end("ok"); }
  res.writeHead(404); res.end("Not found");
}).listen(PORT, "0.0.0.0", () => {
  console.log("\n  Wordlong is running.\n");
  console.log("  You:           http://localhost:" + PORT);
  for (const list of Object.values(os.networkInterfaces()))
    for (const i of list || []) if (i.family === "IPv4" && !i.internal) console.log("  Friend (same Wi-Fi): http://" + i.address + ":" + PORT);
  console.log("\n  Press Ctrl+C to stop.\n");
});

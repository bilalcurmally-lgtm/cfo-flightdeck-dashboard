export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("allow", "POST");
    return response.status(405).json({ ok: false });
  }

  const expected = process.env.APP_REVIEW_PASSWORD;
  if (!expected) return response.status(503).json({ ok: false });

  const body = parseBody(request.body);
  const password = String(body.password || "");

  if (password !== expected) return response.status(401).json({ ok: false });
  return response.status(200).json({ ok: true });
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

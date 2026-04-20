import { describe, expect, it } from "vitest";
import handler from "../../api/unlock.js";

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    jsonBody: null,
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.jsonBody = body;
      return this;
    }
  };
}

describe("review app gate", () => {
  it("rejects non-POST unlock attempts", async () => {
    const response = createResponse();

    await handler({ method: "GET" }, response);

    expect(response.statusCode).toBe(405);
    expect(response.headers.allow).toBe("POST");
  });

  it("accepts only the configured review password", async () => {
    const previous = process.env.APP_REVIEW_PASSWORD;
    process.env.APP_REVIEW_PASSWORD = "flightdeck";
    const rejected = createResponse();
    const accepted = createResponse();

    await handler({ method: "POST", body: { password: "wrong" } }, rejected);
    await handler({ method: "POST", body: { password: "flightdeck" } }, accepted);

    expect(rejected.statusCode).toBe(401);
    expect(accepted.statusCode).toBe(200);
    expect(accepted.jsonBody).toEqual({ ok: true });

    if (previous === undefined) {
      delete process.env.APP_REVIEW_PASSWORD;
    } else {
      process.env.APP_REVIEW_PASSWORD = previous;
    }
  });
});

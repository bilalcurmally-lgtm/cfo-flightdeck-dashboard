import { describe, it, expect } from "vitest";
import { escapeHtml, csvEscape } from "../core/escape.js";

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("a&b")).toBe("a&amp;b");
  });

  it("escapes angle brackets", () => {
    expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('say "hi"')).toBe("say &quot;hi&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("handles null input", () => {
    expect(escapeHtml(null)).toBe("");
  });

  it("handles undefined input", () => {
    expect(escapeHtml(undefined)).toBe("");
  });

  it("returns plain strings unchanged", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });

  it("escapes all special characters at once", () => {
    expect(escapeHtml('<a href="x&p=\'y\'">')).toBe("&lt;a href=&quot;x&amp;p=&#39;y&#39;&quot;&gt;");
  });
});

describe("csvEscape", () => {
  it("returns plain strings unchanged", () => {
    expect(csvEscape("hello")).toBe("hello");
  });

  it("wraps strings with commas in double quotes", () => {
    expect(csvEscape("hello, world")).toBe('"hello, world"');
  });

  it("wraps strings with double quotes and escapes them", () => {
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
  });

  it("wraps strings with newlines", () => {
    expect(csvEscape("line1\nline2")).toBe('"line1\nline2"');
  });

  it("handles null input", () => {
    expect(csvEscape(null)).toBe("");
  });

  it("handles undefined input", () => {
    expect(csvEscape(undefined)).toBe("");
  });

  it("handles numbers", () => {
    expect(csvEscape(42)).toBe("42");
  });
});

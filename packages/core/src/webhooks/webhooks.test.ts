import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { isPublicUrl, isHttpUrl } from "../urls/isPublicUrl.ts";
import { signWebhookPayload } from "./signWebhookPayload.ts";

describe("signWebhookPayload", () => {
  it("signs the timestamp and body with the secret", () => {
    const expected = createHmac("sha256", "whsec_test")
      .update('1791890000.{"event":"task.completed"}')
      .digest("hex");
    expect(
      signWebhookPayload(
        "whsec_test",
        1791890000,
        '{"event":"task.completed"}',
      ),
    ).toBe(`t=1791890000,v1=${expected}`);
  });

  it("changes when the body, timestamp or secret changes", () => {
    const base = signWebhookPayload("secret", 1, "body");
    expect(signWebhookPayload("secret", 1, "other")).not.toBe(base);
    expect(signWebhookPayload("secret", 2, "body")).not.toBe(base);
    expect(signWebhookPayload("other", 1, "body")).not.toBe(base);
  });
});

describe("isHttpUrl", () => {
  it("accepts http and https addresses only", () => {
    expect(isHttpUrl("https://example.com/hook")).toBe(true);
    expect(isHttpUrl("http://localhost:9000/hook")).toBe(true);
    expect(isHttpUrl("ftp://example.com")).toBe(false);
    expect(isHttpUrl("file:///etc/passwd")).toBe(false);
    expect(isHttpUrl("not a url")).toBe(false);
  });
});

describe("isPublicUrl", () => {
  it("accepts a public address", () => {
    expect(isPublicUrl("https://example.com/hook")).toBe(true);
    expect(isPublicUrl("https://172.32.0.1/hook")).toBe(true);
  });

  it.each([
    "http://localhost:9000/hook",
    "http://api.localhost/hook",
    "http://printer.local/hook",
    "http://db.internal/hook",
    "http://127.0.0.1/hook",
    "http://10.1.2.3/hook",
    "http://172.16.0.1/hook",
    "http://172.31.255.255/hook",
    "http://192.168.0.202/hook",
    "http://169.254.169.254/latest/meta-data",
    "http://100.64.0.1/hook",
    "http://0.0.0.0/hook",
    "http://[::1]/hook",
    "http://[fd00::1]/hook",
    "http://[fe80::1]/hook",
    "http://[::ffff:127.0.0.1]/hook",
  ])("rejects the private address %s", (url) => {
    expect(isPublicUrl(url)).toBe(false);
  });

  it("rejects anything that is not a web address", () => {
    expect(isPublicUrl("ftp://example.com")).toBe(false);
    expect(isPublicUrl("example.com")).toBe(false);
  });
});

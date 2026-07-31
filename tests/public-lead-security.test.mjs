import assert from "node:assert/strict";
import test from "node:test";

import {
  findLeadSpamSignals,
  protectCrmMirror,
  protectPublicLead,
  resetLeadSecurityForTests,
} from "../src/lib/security/public-lead-security.ts";

process.env.LEAD_SECURITY_STORAGE = "memory";
delete process.env.TURNSTILE_SECRET_KEY;

function request(origin = "https://www.xiphiasimmigration.com", ip = "203.0.113.10") {
  return new Request("https://www.xiphiasimmigration.com/api/enquiry", {
    method: "POST",
    headers: {
      origin,
      host: "www.xiphiasimmigration.com",
      "cf-connecting-ip": ip,
    },
  });
}

const legitimateLead = {
  name: "Adyanta Dubey",
  email: "adyanta.dubey@example.com",
  phone: "+91 99860 72700",
  message: "I would like to understand my options for Canadian permanent residency.",
};

test.beforeEach(() => {
  resetLeadSecurityForTests();
  delete process.env.TURNSTILE_SECRET_KEY;
});

test("accepts a normal immigration enquiry", async () => {
  const response = await protectPublicLead(request(), legitimateLead, { endpoint: "test" });
  assert.equal(response, null);
});

test("silently filters a server-side honeypot submission", async () => {
  const response = await protectPublicLead(
    request(),
    { ...legitimateLead, honeypot: "cheap-seo.example" },
    { endpoint: "test" },
  );
  assert.equal(response?.status, 200);
  assert.deepEqual(await response?.json(), { ok: true, filtered: true });
});

test("detects the fragmented email and unlikely-name pattern from the spam sample", () => {
  const result = findLeadSpamSignals({
    name: "Ypsawsyg Otpxnjz",
    email: "o.q.ok.i.c.axot.i.75@gmail.com",
  });
  assert.ok(result.score >= 4);
  assert.ok(result.reasons.includes("fragmented-email"));
  assert.ok(result.reasons.includes("unlikely-name"));
});

test("does not classify legitimate varied names as spam", () => {
  for (const name of ["Rohit Krishnan", "Nguyen Thi Minh", "Krzysztof Nowak", "Md Shams Uddin"]) {
    const result = findLeadSpamSignals({ name, email: "client@example.com" });
    assert.ok(result.score < 4, `${name} should not be blocked`);
  }
});

test("does not block a legitimate autofilled form for being submitted quickly", async () => {
  const response = await protectPublicLead(
    request(),
    { ...legitimateLead, startedAt: Date.now() },
    { endpoint: "fast-legitimate-test" },
  );
  assert.equal(response, null);
});

test("suppresses an identical repeat submission", async () => {
  const first = await protectPublicLead(request(), legitimateLead, { endpoint: "duplicate-test" });
  const second = await protectPublicLead(request(), legitimateLead, { endpoint: "duplicate-test" });
  assert.equal(first, null);
  assert.equal(second?.status, 200);
  assert.equal((await second?.json()).filtered, true);
});

test("rate limits bursts from one IP", async () => {
  for (let index = 0; index < 2; index += 1) {
    const response = await protectPublicLead(
      request("https://www.xiphiasimmigration.com", "198.51.100.20"),
      { ...legitimateLead, email: `person${index}@example.com`, message: `Question ${index}` },
      { endpoint: "rate-test", ipLimit: 2 },
    );
    assert.equal(response, null);
  }
  const blocked = await protectPublicLead(
    request("https://www.xiphiasimmigration.com", "198.51.100.20"),
    { ...legitimateLead, email: "third@example.com", message: "Question 3" },
    { endpoint: "rate-test", ipLimit: 2 },
  );
  assert.equal(blocked?.status, 429);
});

test("rejects a cross-site submission origin", async () => {
  const response = await protectPublicLead(request("https://spam.invalid"), legitimateLead, {
    endpoint: "origin-test",
  });
  assert.equal(response?.status, 403);
});

test("requires a Turnstile token when the server secret is configured", async () => {
  process.env.TURNSTILE_SECRET_KEY = "test-secret";
  const response = await protectPublicLead(request(), legitimateLead, {
    endpoint: "turnstile-test",
    requireTurnstile: true,
  });
  assert.equal(response?.status, 400);
  delete process.env.TURNSTILE_SECRET_KEY;
});

test("CRM mirror blocks obvious spam and rapid exact duplicates", () => {
  const spam = protectCrmMirror({
    id: "lead_spam",
    name: "Ypsawsyg Otpxnjz",
    email: "o.q.ok.i.c.axot.i.75@gmail.com",
  });
  assert.equal(spam.ok, false);

  resetLeadSecurityForTests();
  const first = protectCrmMirror({ id: "lead_1", ...legitimateLead });
  const duplicate = protectCrmMirror({ id: "lead_2", ...legitimateLead });
  assert.equal(first.ok, true);
  assert.equal(duplicate.ok, false);
});

import assert from "node:assert/strict";
import test from "node:test";

import { classifyJobApplication } from "../src/lib/crm/job-application.ts";

/**
 * Every message below is taken verbatim from tbl_Enquiry, including the
 * " | Page: ... | Source: ..." suffix the CRM appends, so the fixtures match
 * what the classifier actually sees in production.
 */

const lead = (message, extra = {}) => ({ message, page: "", tags: [], ...extra });

test("careers form submissions are always job applications", () => {
  const verdict = classifyJobApplication(
    lead("Career application for Accounts Executive.", { tags: ["career-application", "Accounts Executive"] }),
  );
  assert.equal(verdict.isJobApplication, true);
  assert.equal(verdict.reason, "careers-form");
});

test("explicit job seeking goes to HRMS", () => {
  for (const message of [
    "Currently I am looking for a job...... Total work experience in 2 years location ( Banglore Or Mysore)",
    "Uploading the Resume,Intrested digital marketing role please Consider my resume Sir &Mam",
    "Dear Hiring Manager, I am writing to apply for the Accounts Assistant position at your company",
    "Currently i'm working, looking for a another Job",
  ]) {
    assert.equal(classifyJobApplication(lead(message)).isJobApplication, true, message);
  }
});

test("immigration enquiries stay in enquiries even when they mention jobs", () => {
  for (const message of [
    "I am planning to move to Australia for my job career so need assistance in the VISA application process",
    "I want to know the work visa process and job opportunities in America",
    "I want work in abroad do you have any vacancy for me",
    "I have completed my graduation currently looking for a job on immigration on any role",
  ]) {
    assert.equal(classifyJobApplication(lead(message)).isJobApplication, false, message);
  }
});

test("immigration keywords in the page path do not mask a job application", () => {
  // The page URL is appended to the enquiry text in the CRM. /careers/visa-processing-officer
  // contains "visa", which previously made real applications look like immigration leads.
  const verdict = classifyJobApplication(
    lead("Wanted to apply job | Page: /careers/visa-processing-officer | Source: website", {
      page: "/careers/visa-processing-officer",
    }),
  );
  assert.equal(verdict.isJobApplication, true);
  assert.equal(verdict.position, "Visa Processing Officer");
});

test("a careers page submission routes even without an explicit job phrase", () => {
  const verdict = classifyJobApplication(
    lead("Please review my profile for this role.", { page: "/careers/accounts-executive" }),
  );
  assert.equal(verdict.isJobApplication, true);
  assert.equal(verdict.position, "Accounts Executive");
});

test("loosely worded applications are carried by the careers page they came from", () => {
  // "I'm currently needed some account based job" has no phrase we would trust on
  // its own - on a blog page it could equally be someone wanting work abroad.
  // The page it was submitted from is what makes it unambiguous.
  const wording = "I'm currently needed some account based job";
  assert.equal(classifyJobApplication(lead(wording)).isJobApplication, false);
  assert.equal(
    classifyJobApplication(lead(wording, { page: "/careers/accounts-executive" })).isJobApplication,
    true,
  );
});

test("ordinary immigration enquiries are untouched", () => {
  for (const message of [
    "I would like to know about Canada PR process and the fees",
    "Interested in Australia subclass 189. Please call me back.",
    "What documents are needed for an Express Entry profile?",
  ]) {
    assert.equal(classifyJobApplication(lead(message)).isJobApplication, false, message);
  }
});

test("position falls back to a usable value for HRMS", () => {
  // hrms_SubmitCandidate rejects a position shorter than 2 characters.
  const verdict = classifyJobApplication(lead("I need a job"));
  assert.ok(verdict.position.length >= 2);
});

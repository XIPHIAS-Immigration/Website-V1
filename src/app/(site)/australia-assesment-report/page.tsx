import type { Metadata } from "next";
import ReportClient from "./ReportClient";

/*
 * Australia Assessment Report page
 *
 * Designed to be pasted into Gmail/Outlook as email body.
 * Email-safe HTML: tables + inline styles + hybrid responsive blocks.
 */

export const metadata: Metadata = {
  title: "Australia Assessment Report – XIPHIAS Immigration",
  description:
    "Australia PR (Subclass 189 & 190) initial assessment report with ANZSCO code, points table and fee overview by XIPHIAS Immigration.",
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

function pickParam(sp: SearchParams, key: string, fallback: string) {
  const v = sp?.[key];
  if (Array.isArray(v)) return (v[0] ?? fallback).toString();
  if (typeof v === "string") return v;
  return fallback;
}

function escapeHtml(input: string) {
  return input.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#039;";
      default:
        return ch;
    }
  });
}

function buildReportHtml(args: {
  name: string;
  anzscoCode: string;
  anzscoTitle: string;
  assetOrigin: string;
}) {
  const nowYear = new Date().getFullYear();

  const name = escapeHtml(args.name);
  const anzscoCode = escapeHtml(args.anzscoCode);
  const anzscoTitle = escapeHtml(args.anzscoTitle);

  const logoUrl = `${args.assetOrigin}/images/logo/xiphias-immigration-white.png`;

  const iconPng = (domain: string, size = 64) =>
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
      domain
    )}&sz=${size}`;

  const fb = iconPng("facebook.com");
  const tw = iconPng("x.com");
  const li = iconPng("linkedin.com");
  const ig = iconPng("instagram.com");
  const yt = iconPng("youtube.com");
  const play = iconPng("play.google.com");
  const apple = iconPng("apple.com");

  const brandBlue = "#1E5CB8";
  const brandBlueDark = "#15489A";
  const brandBlueDeep = "#0E2F6F";
  const accentOrange = "#F3AA3A";
  const ink = "#0B1220";

  return `
<!-- Preheader (hidden preview line in email clients) -->
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
  Australia PR (Subclass 189 &amp; 190) – Initial Assessment Report
</div>

<style type="text/css">
  /* Email resets */
  table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; max-width:100% !important; height:auto !important; }
  body, table, td, div, p { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  a { text-decoration:underline; }
  ul, ol { margin:0; padding-left:18px; }

  /* Visibility helpers */
  .mobileOnly { display:none; max-height:0; overflow:hidden; mso-hide:all; }
  .desktopOnly { display:block; }

  /* Mobile responsiveness (works where style tags survive) */
  @media only screen and (max-width: 680px) {
    .wrap { width: 100% !important; max-width: 100% !important; }
    .card { border-radius: 14px !important; }
    .pad { padding-left: 14px !important; padding-right: 14px !important; }
    .title { font-size: 20px !important; line-height: 26px !important; }
    .subtitle { font-size: 13px !important; line-height: 19px !important; }
    .bodyText { font-size: 13px !important; line-height: 20px !important; }

    /* Key fix: swap points table to stacked cards */
    .desktopOnly { display:none !important; }
    .mobileOnly  { display:block !important; max-height:none !important; overflow:visible !important; }
  }
</style>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;background-color:#EEF1F6;">
  <tr>
    <td align="center" style="padding:16px 10px;background-color:#EEF1F6;">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="wrap" style="max-width:700px;">
        <tr>
          <td align="center">

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
              class="card"
              style="max-width:640px;background-color:#FFFFFF;border:1px solid #D9DEE8;border-radius:16px;overflow:hidden;">

              <!-- Header (responsive + Outlook-safe) -->
              <tr>
                <td style="padding:0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td bgcolor="${brandBlue}" style="background-color:${brandBlue};padding:18px 22px 14px 22px;">

                        <!--[if mso]>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="left" valign="middle" style="padding:0;">
                              <img src="${logoUrl}" width="124" alt="XIPHIAS Immigration" style="display:block;border:0;height:auto;" />
                            </td>
                            <td align="right" valign="middle" style="padding-left:12px;font-family:Arial,Roboto,sans-serif;">
                              <span style="display:inline-block;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.22);color:#EAF0FF;font-size:11px;font-weight:900;letter-spacing:0.4px;padding:8px 12px;border-radius:999px;white-space:nowrap;">
                                Australia PR • Subclass 189 &amp; 190 • Assessment
                              </span>
                            </td>
                          </tr>
                        </table>
                        <![endif]-->

                        <!--[if !mso]><!-->
                        <div style="font-size:0;line-height:0;">
                          <div style="display:inline-block;vertical-align:middle;width:100%;max-width:320px;">
                            <img
                              src="${logoUrl}"
                              width="124"
                              alt="XIPHIAS Immigration"
                              style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:124px;"
                            />
                          </div>

                          <div style="display:inline-block;vertical-align:middle;width:100%;max-width:260px;margin-top:10px;">
                            <span style="
                              display:inline-block;
                              background:rgba(255,255,255,0.12);
                              border:1px solid rgba(255,255,255,0.22);
                              color:#EAF0FF;
                              font-size:11px;
                              font-weight:900;
                              letter-spacing:0.4px;
                              padding:8px 12px;
                              border-radius:999px;
                              white-space:normal;
                              line-height:14px;
                            ">
                              Australia PR • Subclass 189 &amp; 190 • Assessment
                            </span>
                          </div>
                        </div>
                        <!--<![endif]-->

                        <div style="margin-top:12px;font-family:Arial,Roboto,sans-serif;">
                          <div class="title" style="font-size:22px;line-height:28px;font-weight:900;color:${accentOrange};letter-spacing:0.4px;">
                            <strong>CONGRATULATIONS ${name},</strong>
                          </div>

                          <div class="subtitle" style="margin-top:6px;font-size:15px;line-height:20px;color:#FFFFFF;letter-spacing:0.3px;">
                            Greetings from XIPHIAS Immigration!
                          </div>
                        </div>

                      </td>
                    </tr>

                    <tr>
                      <td bgcolor="${brandBlue}" style="background-color:${brandBlue};padding:0;">
                        <div style="height:4px;line-height:4px;background:${accentOrange};">&nbsp;</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body: intro -->
              <tr>
                <td class="pad bodyText" style="padding:16px 22px 12px 22px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;text-align:justify;">
                  Based on the information communicated and submitted by you, our government-authorized immigration consultancy has conducted an initial immigration assessment. We are delighted to inform you that you are eligible for Australia PR under Subclass 189 and 190 for Australia. The minimum eligibility for Australian Skilled Immigration Visa is 65 points.
                </td>
              </tr>

              <!-- ANZSCO card (responsive + Outlook-safe) -->
              <tr>
                <td class="pad" style="padding:6px 22px 16px 22px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="border-collapse:separate;border-spacing:0;background:#FFFFFF;border:1px solid #E6EAF2;border-radius:12px;overflow:hidden;">
                    <tr>
                      <td style="padding:14px 14px 12px 14px;font-family:Arial,Roboto,sans-serif;">

                        <!-- Top row: badge + right label -->
                        <!--[if mso]>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="left" valign="middle" style="padding:0;">
                              <span style="display:inline-block;background:rgba(243,170,58,0.18);border:1px solid rgba(243,170,58,0.35);color:${ink};font-weight:900;font-size:11px;letter-spacing:0.6px;padding:7px 10px;border-radius:999px;white-space:nowrap;text-transform:uppercase;">
                                Your ANZSCO code is - ${anzscoCode}
                              </span>
                            </td>
                            <td align="right" valign="middle" style="padding:0;font-family:Arial,Roboto,sans-serif;color:${brandBlue};font-size:12px;font-weight:900;white-space:nowrap;">
                              Australia PR
                            </td>
                          </tr>
                        </table>
                        <![endif]-->

                        <!--[if !mso]><!-->
                        <div style="font-size:0;line-height:0;">
                          <div style="display:inline-block;vertical-align:middle;width:100%;max-width:420px;">
                            <span style="
                              display:inline-block;
                              background:rgba(243,170,58,0.18);
                              border:1px solid rgba(243,170,58,0.35);
                              color:${ink};
                              font-weight:900;
                              font-size:11px;
                              letter-spacing:0.6px;
                              padding:7px 10px;
                              border-radius:999px;
                              text-transform:uppercase;
                              white-space:normal;
                              line-height:14px;
                            ">
                              Your ANZSCO code is - ${anzscoCode}
                            </span>
                          </div>

                          <div style="display:inline-block;vertical-align:middle;width:100%;max-width:140px;text-align:right;margin-top:8px;">
                            <span style="font-family:Arial,Roboto,sans-serif;color:${brandBlue};font-size:12px;font-weight:900;white-space:nowrap;">
                              Australia PR
                            </span>
                          </div>
                        </div>
                        <!--<![endif]-->

                        <div style="margin-top:12px;padding-top:12px;border-top:1px solid #EEF1F6;text-align:center;">
                          <div style="font-size:10px;color:#667085;letter-spacing:0.25px;text-transform:uppercase;font-weight:900;">
                            Nominated occupation
                          </div>

                          <div style="margin-top:6px;font-size:20px;line-height:24px;font-weight:900;color:${brandBlueDeep};">
                            ${anzscoTitle}
                          </div>

                          <div style="margin-top:8px;">
                            <span style="
                              display:inline-block;
                              background:${brandBlueDeep};
                              color:#FFFFFF;
                              font-family:Arial,Roboto,sans-serif;
                              font-weight:900;
                              font-size:12px;
                              letter-spacing:0.3px;
                              padding:8px 12px;
                              border-radius:999px;
                              white-space:nowrap;
                            ">
                              ANZSCO ${anzscoCode}
                            </span>
                          </div>
                        </div>

                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- investment paragraph -->
              <tr>
                <td class="pad bodyText" style="padding:0 22px 14px 22px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;text-align:justify;">
                  Consider this your investment in a brighter future. With your consent, we are eager to provide you with personalized immigration consultation and representation services. Connect to our team immediately to enroll yourself in this program. Should you choose to partner with XIPHIAS Immigration for processing your Visa 189/190, you'll receive a finalized retainer agreement signed from XIPHIAS IMMIGRATION PVT. LTD.
                </td>
              </tr>

              <!-- Points Summary (DESKTOP table) -->
              <tr>
                <td class="pad" style="padding:0 22px 14px 22px;">
                  <div class="desktopOnly">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="border-collapse:separate;border-spacing:0;border:1px solid #E6EAF2;border-radius:14px;overflow:hidden;background:#FFFFFF;box-shadow:0 6px 18px rgba(16,24,40,0.06);">
                      <tr>
                        <td style="background:${brandBlueDeep};color:#FFFFFF;font-family:Arial,Roboto,sans-serif;font-size:13px;font-weight:900;padding:12px;text-align:center;">
                          Points Summary
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:12px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:13px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                            <tr>
                              <td style="padding:8px 8px;background:#f1f5fb;font-weight:900;border-bottom:1px solid #e2e8f0;">Particulars</td>
                              <td style="padding:8px 8px;background:#f1f5fb;font-weight:900;border-bottom:1px solid #e2e8f0;">Shared Information by the client</td>
                              <td align="right" style="padding:8px 8px;background:#f1f5fb;font-weight:900;border-bottom:1px solid #e2e8f0;">Maximum Points</td>
                              <td align="right" style="padding:8px 8px;background:#f1f5fb;font-weight:900;border-bottom:1px solid #e2e8f0;">Your Points</td>
                            </tr>

                            <tr>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">Age/DOB</td>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">Age (33-39 years)</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">30</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">25</td>
                            </tr>

                            <tr>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">English Language Ability [IELTS/PTE/TOEFL]</td>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">PTE Academic 90 (Superior)</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">IELTS 8.0 or PTE Academic 79</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">20</td>
                            </tr>

                            <tr>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">Qualifications</td>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">Bachelor / Master</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">20 (if doctorate)</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">15</td>
                            </tr>

                            <tr>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">Work Experience (Overseas Work Experience)</td>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">&lt;3 years</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">15</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">0</td>
                            </tr>

                            <tr>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">Partner Skills / Single Applicant</td>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">Single</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">10</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">10</td>
                            </tr>

                            <tr>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">Australian Qualification</td>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">Master's</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">5</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">5</td>
                            </tr>

                            <tr>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">Australia Qualification in Regional Area</td>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">NA</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">5</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">0</td>
                            </tr>

                            <tr>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">Australian Employment</td>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">3+ years</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">20</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">10</td>
                            </tr>

                            <tr>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">State Sponsorship</td>
                              <td style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">Applicable for State-Sponsored Visa</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">5</td>
                              <td align="right" style="padding:8px 8px;border-bottom:1px solid #e2e8f0;">5</td>
                            </tr>

                            <tr>
                              <td colspan="3" style="padding:10px 8px;font-weight:900;border-top:1px solid #e2e8f0;">Your Total Points</td>
                              <td align="right" style="padding:10px 8px;font-weight:900;border-top:1px solid #e2e8f0;">90</td>
                            </tr>

                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Points Summary (MOBILE stacked cards) -->
                  <div class="mobileOnly">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="border-collapse:separate;border-spacing:0;border:1px solid #E6EAF2;border-radius:14px;overflow:hidden;background:#FFFFFF;box-shadow:0 6px 18px rgba(16,24,40,0.06);">
                      <tr>
                        <td style="background:${brandBlueDeep};color:#FFFFFF;font-family:Arial,Roboto,sans-serif;font-size:13px;font-weight:900;padding:12px;text-align:center;">
                          Points Summary
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px;font-family:Arial,Roboto,sans-serif;color:#2A3443;">

                          ${[
                            ["Age/DOB", "Age (33-39 years)", "30", "25"],
                            [
                              "English Language Ability [IELTS/PTE/TOEFL]",
                              "PTE Academic 90 (Superior)",
                              "IELTS 8.0 or PTE Academic 79",
                              "20",
                            ],
                            ["Qualifications", "Bachelor / Master", "20 (if doctorate)", "15"],
                            ["Work Experience (Overseas Work Experience)", "&lt;3 years", "15", "0"],
                            ["Partner Skills / Single Applicant", "Single", "10", "10"],
                            ["Australian Qualification", "Master's", "5", "5"],
                            ["Australia Qualification in Regional Area", "NA", "5", "0"],
                            ["Australian Employment", "3+ years", "20", "10"],
                            ["State Sponsorship", "Applicable for State-Sponsored Visa", "5", "5"],
                          ]
                            .map(
                              ([p, shared, max, yours]) => `
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                            style="border-collapse:separate;border-spacing:0;border:1px solid #E6EAF2;border-radius:12px;overflow:hidden;background:#FFFFFF;margin-bottom:10px;">
                            <tr>
                              <td style="padding:10px 12px;background:rgba(11,87,208,0.06);font-family:Arial,Roboto,sans-serif;">
                                <div style="font-weight:900;color:${ink};font-size:13px;line-height:18px;">
                                  ${p}
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:10px 12px;font-family:Arial,Roboto,sans-serif;color:#2A3443;">
                                <div style="font-size:12px;line-height:18px;color:#445064;font-weight:900;margin-bottom:4px;">
                                  Shared Information by the client
                                </div>
                                <div style="font-size:13px;line-height:19px;">
                                  ${shared}
                                </div>

                                <div style="height:1px;line-height:1px;background:#EEF1F6;margin:10px 0;">&nbsp;</div>

                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                                  <tr>
                                    <td style="font-size:12px;line-height:18px;color:#445064;font-weight:900;">Maximum Points</td>
                                    <td align="right" style="font-size:13px;line-height:19px;color:#2A3443;font-weight:900;">${max}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding-top:6px;font-size:12px;line-height:18px;color:#445064;font-weight:900;">Your Points</td>
                                    <td align="right" style="padding-top:6px;font-size:13px;line-height:19px;color:#2A3443;font-weight:900;">${yours}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          `
                            )
                            .join("")}

                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                            style="border-collapse:separate;border-spacing:0;border:1px solid #E6EAF2;border-radius:12px;overflow:hidden;background:#FFFFFF;">
                            <tr>
                              <td style="padding:12px;font-family:Arial,Roboto,sans-serif;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="font-weight:900;color:${ink};font-size:13px;line-height:18px;">
                                      Your Total Points
                                    </td>
                                    <td align="right" style="font-weight:900;color:${brandBlueDeep};font-size:16px;line-height:20px;">
                                      90
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- Terms & Conditions -->
              <tr>
                <td class="pad" style="padding:0 22px 8px 22px;font-family:Arial,Roboto,sans-serif;">
                  <div style="font-size:15px;font-weight:900;color:${ink};">
                    Terms &amp; Conditions :-
                  </div>
                  <div style="margin-top:8px;height:1px;background:#E5EAF4;line-height:1px;">&nbsp;</div>
                </td>
              </tr>

              <tr>
                <td class="pad bodyText" style="padding:0 22px 10px 22px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;">
                  We will provide the following services for the visa applicant(s):
                  <ul style="margin-top:8px;">
                    <li style="margin:0 0 6px 0;">Complete guidance on the skills assessment and state sponsorship for the main applicant if applicable.</li>
                    <li style="margin:0 0 6px 0;">Completion of all visa application forms and checking of all supporting evidence as required for the visa application.</li>
                    <li style="margin:0 0 6px 0;">Visa application lodgement and application status tracking with regular communication with the applicant(s).</li>
                    <li style="margin:0 0 6px 0;">Advice about health checks and no criminal record arrangements advice if required.</li>
                    <li style="margin:0;">FREE advice about education, family settlement, and job seeking in the country.</li>
                  </ul>
                </td>
              </tr>

              <!-- Consultation + Fee + Steps (Redesigned Section) -->
<tr>
  <td class="pad" style="padding:0 22px 16px 22px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="border-collapse:separate;border-spacing:0;background:#FFFFFF;border:1px solid #E6EAF2;border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(16,24,40,0.06);">

      <!-- Section header -->
      <tr>
        <td style="padding:14px 14px 12px 14px;font-family:Arial,Roboto,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" style="padding:0;">
                <div style="font-size:14px;line-height:18px;font-weight:900;color:${ink};">
                  Immigration Consultation &amp; Representation
                </div>
                <div style="margin-top:4px;font-size:12px;line-height:18px;color:#5A667A;">
                  Transparent payment plan for your Australia PR process
                </div>
              </td>
              <td align="right" style="padding:0;">
                <span style="
                  display:inline-block;
                  background:rgba(30,92,184,0.10);
                  border:1px solid rgba(30,92,184,0.20);
                  color:${brandBlueDeep};
                  font-family:Arial,Roboto,sans-serif;
                  font-weight:900;
                  font-size:11px;
                  letter-spacing:0.4px;
                  padding:7px 10px;
                  border-radius:999px;
                  white-space:nowrap;
                ">
                  Service Fees
                </span>
              </td>
            </tr>
          </table>

          <div style="margin-top:12px;height:1px;line-height:1px;background:#EEF1F6;">&nbsp;</div>
        </td>
      </tr>

      <!-- Total fee highlight -->
      <tr>
        <td style="padding:0 14px 12px 14px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
            style="border-collapse:separate;border-spacing:0;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:12px 12px;background:${brandBlueDeep};font-family:Arial,Roboto,sans-serif;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="left" style="padding:0;">
                      <div style="font-size:11px;line-height:14px;letter-spacing:0.5px;color:#CFE0FF;font-weight:900;text-transform:uppercase;">
                        Total Professional Fee
                      </div>
                      <div style="margin-top:6px;font-size:22px;line-height:26px;font-weight:900;color:#FFFFFF;">
                        6000 AUD
                        <span style="font-size:12px;line-height:16px;color:#CFE0FF;font-weight:900;vertical-align:middle;">
                          + TAX
                        </span>
                      </div>
                    </td>

                    <td align="right" style="padding:0;">
                      <span style="
                        display:inline-block;
                        background:${accentOrange};
                        color:#000000;
                        font-family:Arial,Roboto,sans-serif;
                        font-weight:900;
                        font-size:11px;
                        letter-spacing:0.4px;
                        padding:8px 10px;
                        border-radius:10px;
                        white-space:nowrap;
                      ">
                        Pay in 4 Steps
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:10px 12px;background:#F7FAFF;font-family:Arial,Roboto,sans-serif;border:1px solid #E6EAF2;border-top:0;">
                <div style="font-size:12px;line-height:18px;color:#516074;">
                  Includes consultation, representation &amp; processing support. Government fees and third-party charges are separate.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Steps grid (2-column desktop, stacked mobile) -->
      <tr>
        <td style="padding:0 14px 14px 14px;font-family:Arial,Roboto,sans-serif;">

          <!--[if mso]>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="50%" valign="top" style="padding-right:8px;">
          <![endif]-->

          <!-- Column 1 -->
          <div style="display:inline-block;vertical-align:top;width:100%;">
            <!-- STEP 1 -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
              style="border-collapse:separate;border-spacing:0;border:1px solid #E6EAF2;border-radius:12px;overflow:hidden;background:#FFFFFF;margin-bottom:10px;">
              <tr>
                <td style="padding:10px 12px;background:rgba(243,170,58,0.18);border-bottom:1px solid #E6EAF2;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="left" style="font-weight:900;color:${ink};font-size:12px;letter-spacing:0.4px;">
                        STEP 1
                      </td>
                      <td align="right" style="font-weight:900;color:${brandBlueDeep};font-size:12px;white-space:nowrap;">
                        Immediate
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:12px;font-family:Arial,Roboto,sans-serif;">
                  <div style="font-size:14px;line-height:20px;font-weight:900;color:${brandBlueDeep};">
                    2000 AUD + Tax
                  </div>
                  <div style="margin-top:6px;font-size:12px;line-height:18px;color:#5A667A;">
                    1st installment to start the process.
                  </div>
                  <div style="margin-top:10px;height:1px;background:#EEF1F6;line-height:1px;">&nbsp;</div>
                  <div style="margin-top:10px;font-size:11px;line-height:16px;color:#6B778C;">
                    Note: Skill Assessment fee may vary as per assessment bodies.
                  </div>
                </td>
              </tr>
            </table>

            <!-- STEP 3 -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
              style="border-collapse:separate;border-spacing:0;border:1px solid #E6EAF2;border-radius:12px;overflow:hidden;background:#FFFFFF;margin-bottom:10px;">
              <tr>
                <td style="padding:10px 12px;background:rgba(30,92,184,0.08);border-bottom:1px solid #E6EAF2;">
                  <div style="font-weight:900;color:${ink};font-size:12px;letter-spacing:0.4px;">
                    STEP 3
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:12px;font-family:Arial,Roboto,sans-serif;">
                  <div style="font-size:14px;line-height:20px;font-weight:900;color:${brandBlueDeep};">
                    2000 AUD + Tax
                  </div>
                  <div style="margin-top:6px;font-size:12px;line-height:18px;color:#5A667A;">
                    With EOI — Expression of Interest filing.
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!--[if mso]>
              </td><td width="50%" valign="top" style="padding-left:8px;">
          <![endif]-->

          <!-- Spacer for non-mso -->
          <div style="display:inline-block;width:100%;max-width:12px;height:12px;line-height:12px;">&nbsp;</div>

          <!-- Column 2 -->
          <div style="display:inline-block;vertical-align:top;width:100%;">
            <!-- STEP 2 -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
              style="border-collapse:separate;border-spacing:0;border:1px solid #E6EAF2;border-radius:12px;overflow:hidden;background:#FFFFFF;margin-bottom:10px;">
              <tr>
                <td style="padding:10px 12px;background:rgba(243,170,58,0.18);border-bottom:1px solid #E6EAF2;">
                  <div style="font-weight:900;color:${ink};font-size:12px;letter-spacing:0.4px;">
                    STEP 2
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:12px;font-family:Arial,Roboto,sans-serif;">
                  <div style="font-size:13px;line-height:19px;font-weight:900;color:${brandBlueDeep};">
                    AUD $ 500 – AUD $ 3000
                  </div>
                  <div style="margin-top:6px;font-size:12px;line-height:18px;color:#5A667A;">
                    Credit card payment — Assessment Authority fees paid to Govt of Australia for initial approval.
                  </div>
                  <div style="margin-top:10px;height:1px;background:#EEF1F6;line-height:1px;">&nbsp;</div>
                  <div style="margin-top:10px;font-size:11px;line-height:16px;color:#6B778C;">
                    Note: Skill Assessment fee may vary as per assessment bodies.
                  </div>
                </td>
              </tr>
            </table>

            <!-- STEP 4 -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
              style="border-collapse:separate;border-spacing:0;border:1px solid #E6EAF2;border-radius:12px;overflow:hidden;background:#FFFFFF;margin-bottom:0;">
              <tr>
                <td style="padding:10px 12px;background:rgba(30,92,184,0.08);border-bottom:1px solid #E6EAF2;">
                  <div style="font-weight:900;color:${ink};font-size:12px;letter-spacing:0.4px;">
                    STEP 4
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:12px;font-family:Arial,Roboto,sans-serif;">
                  <div style="font-size:14px;line-height:20px;font-weight:900;color:${brandBlueDeep};">
                    2000 AUD + Tax
                  </div>
                  <div style="margin-top:6px;font-size:12px;line-height:18px;color:#5A667A;">
                    After receiving the invitation (ITA).
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!--[if mso]>
              </td>
            </tr>
          </table>
          <![endif]-->

        </td>
      </tr>
    </table>
  </td>
</tr>


              <!-- govt fees -->
              <tr>
                <td class="pad bodyText" style="padding:0 22px 14px 22px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;">
                  <strong>Government Visa Application Fees (approx.):</strong>
                  <ul style="margin-top:8px;">
                    <li style="margin:0 0 6px 0;">Primary applicant fee: AUD $ 4910</li>
                    <li style="margin:0 0 6px 0;">Dependent applicant fee if applicable (spouse): AUD $ 2455</li>
                    <li style="margin:0;">Additional applicant charge for each additional adult that is 18 years or under: AUD $ 1230</li>
                  </ul>

                  <div style="margin-top:10px;">
                    After acceptance of EOI &mdash; proceed to payment.
                  </div>

                  <div style="margin-top:10px;color:#555555;font-size:13px;line-height:20px;">
                    <strong>NOTE:</strong> The fees do not include any flight ticket charges and post immigration charges.
                  </div>
                </td>
              </tr>

              <!-- summary / bullets -->
              <tr>
                <td class="pad bodyText" style="padding:0 22px 14px 22px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;">
                  <strong>Summary overview of Immigration process as per all retainer agreement(s)</strong>
                  <ul style="margin-top:8px;">
                    <li style="margin:0 0 6px 0;">Assist with Skill assessment completion.</li>
                    <li style="margin:0 0 6px 0;">Assist with the Medical Examination process to be completed in advance.</li>
                    <li style="margin:0 0 6px 0;">Assist to gather all required documents and filing applications when "Invitation to apply" is received.</li>
                    <li style="margin:0;">Provide regular updates to you until the decision is made by the government of Australia.</li>
                  </ul>

                  <div style="margin-top:10px;">
                    Once we receive proof of payment for Process 1 and signed a copy of the retainer agreement(s) we will assign a coordinator. They will work closely on your profile and provide you with ongoing support and get answers to all your immigration-related questions.
                  </div>

                  <div style="margin-top:10px;">
                    We closely work with our offices, associates, and partners to provide guidance/referral to cover pre-departure and post-landing activities along with job search assistance.
                  </div>

                  <div style="margin-top:10px;">
                    Please visit our website to know more about our company and services.
                  </div>

                  <div style="margin-top:10px;">
                    Please feel free to contact us regarding any query related to this email or assessment.
                  </div>
                </td>
              </tr>

              <!-- Footer (same style as Canada) -->
              <tr>
                <td style="padding:0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="border-collapse:separate;border-spacing:0;">
                    <tr>
                      <td style="padding:0;background:${brandBlue};">
                        <div style="height:4px;line-height:4px;background:${accentOrange};">&nbsp;</div>
                      </td>
                    </tr>

                    <tr>
                      <td bgcolor="${brandBlue}" style="background-color:${brandBlue};padding:16px 20px 18px 20px;">
                        <!--[if (gte mso 9)|(IE)]>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td width="50%" valign="top" style="padding-right:12px;">
                        <![endif]-->

                        <div style="display:inline-block;vertical-align:top;width:100%;max-width:280px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family:Arial,Roboto,sans-serif;color:#FFFFFF;font-size:12px;line-height:18px;">
                                <div style="font-size:12px;font-weight:900;letter-spacing:0.3px;margin-bottom:8px;">
                                  Get in touch
                                </div>

                                <div style="color:#EAF0FF;">
                                  <a href="mailto:immigration@xiphias.in" style="color:#FFFFFF;text-decoration:underline;">
                                    immigration@xiphias.in
                                  </a>
                                </div>

                                <div style="margin-top:4px;color:#EAF0FF;">
                                  <a href="tel:+919021335577" style="color:#FFFFFF;text-decoration:underline;">
                                    +91 9021335577
                                  </a>
                                </div>

                                <div style="margin-top:12px;">
                                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                      <td style="padding:0 8px 0 0;">
                                        <a href="https://www.facebook.com/xiphiasimmigration" target="_blank" style="text-decoration:none;">
                                          <img src="${fb}" width="20" height="20" alt="Facebook" style="display:block;border:0;border-radius:6px;" />
                                        </a>
                                      </td>
                                      <td style="padding:0 8px 0 0;">
                                        <a href="https://twitter.com/XiphiasInfo" target="_blank" style="text-decoration:none;">
                                          <img src="${tw}" width="20" height="20" alt="X" style="display:block;border:0;border-radius:6px;" />
                                        </a>
                                      </td>
                                      <td style="padding:0 8px 0 0;">
                                        <a href="https://www.linkedin.com/company/xiphias-immigration-pvt-limited" target="_blank" style="text-decoration:none;">
                                          <img src="${li}" width="20" height="20" alt="LinkedIn" style="display:block;border:0;border-radius:6px;" />
                                        </a>
                                      </td>
                                      <td style="padding:0 8px 0 0;">
                                        <a href="https://www.instagram.com/xiphias.immigration/" target="_blank" style="text-decoration:none;">
                                          <img src="${ig}" width="20" height="20" alt="Instagram" style="display:block;border:0;border-radius:6px;" />
                                        </a>
                                      </td>
                                      <td style="padding:0;">
                                        <a href="https://www.youtube.com/@immigrationxiphias5228" target="_blank" style="text-decoration:none;">
                                          <img src="${yt}" width="20" height="20" alt="YouTube" style="display:block;border:0;border-radius:6px;" />
                                        </a>
                                      </td>
                                    </tr>
                                  </table>
                                </div>

                                <div style="margin-top:10px;">
                                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                      <td style="padding:0 8px 0 0;">
                                        <a href="https://play.google.com/store/apps/details?id=com.xiphiasimmigration.app.android" target="_blank" style="text-decoration:none;">
                                          <img src="${play}" width="20" height="20" alt="Android" style="display:block;border:0;border-radius:6px;" />
                                        </a>
                                      </td>
                                      <td style="padding:0;">
                                        <a href="https://itunes.apple.com/in/app/xiphias-immigration/id1376016286?mt=8" target="_blank" style="text-decoration:none;">
                                          <img src="${apple}" width="20" height="20" alt="Apple" style="display:block;border:0;border-radius:6px;" />
                                        </a>
                                      </td>
                                    </tr>
                                  </table>
                                </div>

                              </td>
                            </tr>
                          </table>
                        </div>

                        <div style="display:inline-block;width:100%;max-width:16px;height:14px;line-height:14px;">&nbsp;</div>

                        <!--[if (gte mso 9)|(IE)]>
                            </td><td width="50%" valign="top" style="padding-left:12px;">
                        <![endif]-->

                        <div style="display:inline-block;vertical-align:top;width:100%;max-width:280px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family:Arial,Roboto,sans-serif;color:#EAF0FF;font-size:10px;line-height:15px;">
                                <div style="font-size:11px;font-weight:900;color:#FFFFFF;letter-spacing:0.3px;margin-bottom:8px;">
                                  Company info
                                </div>

                                <div style="margin-bottom:10px;">
                                  ©2009–${nowYear} XIPHIAS Immigration. All rights reserved.
                                </div>

                                <div style="opacity:0.95;">
                                  Registered in India • CIN: U74900KA2015PTC078396<br />
                                  Jurisdiction: Bengaluru, Karnataka
                                </div>

                                <div style="margin-top:12px;border-top:1px solid rgba(255,255,255,0.18);padding-top:10px;">
                                  <span style="opacity:0.95;">You received this email because you requested an assessment.</span>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </div>

                        <!--[if (gte mso 9)|(IE)]>
                            </td>
                          </tr>
                        </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>
`;
}

export default async function AustraliaAssessmentReportPage({
  searchParams,
}: {
  searchParams: SearchParams | Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const name = pickParam(sp, "name", "Enter Name");
  const anzscoCode = pickParam(sp, "anzsco", "261313");
  const anzscoTitle = pickParam(sp, "title", "Software Engineer");

  const assetOrigin =
    process.env.NEXT_PUBLIC_ASSET_ORIGIN?.replace(/\/$/, "") ||
    "https://xiphiasimmigration.com";

  const reportHtml = buildReportHtml({
    name,
    anzscoCode,
    anzscoTitle,
    assetOrigin,
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: "14px 10px",
        backgroundColor: "#EEF1F6",
      }}
    >
      {/* Hide global site header/footer/nav for this route */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            header, footer, nav {
              display: none !important;
              visibility: hidden !important;
              height: 0 !important;
              overflow: hidden !important;
            }
          `,
        }}
      />
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <ReportClient html={reportHtml} />
      </div>
    </main>
  );
}
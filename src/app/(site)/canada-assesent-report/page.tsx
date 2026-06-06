import type { Metadata } from "next";
import ReportClient from "./ReportClient";

/*
 * Canada Assessment Report page
 *
 * Designed to be pasted into Gmail/Outlook as email body.
 * Email-safe HTML: tables + inline styles + hybrid responsive blocks.
 */

export const metadata: Metadata = {
  title: "Canada Assessment Report – XIPHIAS Immigration",
  description:
    "Canada Express Entry initial assessment report with eligibility, NOC details, settlement funds and fee overview by XIPHIAS Immigration.",
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

function formatNumber(input: string) {
  const n = Number(String(input).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return input;
  return new Intl.NumberFormat("en-CA", { maximumFractionDigits: 0 }).format(n);
}

function buildReportHtml(args: {
  name: string;
  nocCodes: string;
  nocTitle: string;
  familyMembers: string;
  settlementFundsCad: string;
  assetOrigin: string;
}) {
  const nowYear = new Date().getFullYear();

  const name = escapeHtml(args.name);
  const nocCodes = escapeHtml(args.nocCodes);
  const nocTitle = escapeHtml(args.nocTitle);
  const familyMembers = escapeHtml(args.familyMembers);
  const settlementFundsCad = escapeHtml(formatNumber(args.settlementFundsCad));

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

  // Outlook fallback cell (table-based)
  const statTd = (label: string, value: string) => `
    <td style="padding:10px 8px;font-family:Arial,Roboto,sans-serif;text-align:center;vertical-align:top;">
      <div style="font-size:10px;color:#445064;margin-bottom:4px;letter-spacing:0.2px;">${label}</div>
      <div style="font-size:16px;font-weight:900;color:${ink};line-height:20px;">${value}</div>
    </td>
  `;

  // Non-Outlook hybrid block (wraps naturally on narrow screens)
  const statBlock = (label: string, value: string) => `
    <div style="
      display:inline-block;
      vertical-align:top;
      width:100%;
      max-width:150px;
      padding:10px 8px;
      box-sizing:border-box;
      text-align:center;
      font-family:Arial,Roboto,sans-serif;
    ">
      <div style="font-size:10px;color:#445064;margin-bottom:4px;letter-spacing:0.2px;">
        ${label}
      </div>
      <div style="font-size:16px;font-weight:900;color:${ink};line-height:20px;">
        ${value}
      </div>
    </div>
  `;

  return `
<!-- Preheader (hidden preview line in email clients) -->
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
  Canada Express Entry – Initial Assessment Report
</div>

<style type="text/css">
  /* Email resets */
  table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  body, table, td, div, p { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  a { text-decoration:underline; }

  /* Mobile responsiveness (works where style tags survive) */
  @media only screen and (max-width: 680px) {
    .wrap { width: 100% !important; max-width: 100% !important; }
    .card { border-radius: 14px !important; }
    .pad { padding-left: 14px !important; padding-right: 14px !important; }
    .title { font-size: 20px !important; line-height: 26px !important; }
    .subtitle { font-size: 13px !important; line-height: 19px !important; }
    .bodyText { font-size: 13px !important; line-height: 20px !important; }
  }

  ul, ol { margin:0; padding-left:18px; }
</style>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;background-color:#EEF1F6;">
  <tr>
    <td align="center" style="background-color:#EEF1F6;">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="wrap" style="max-width:700px;">
        <tr>
          <td align="center">

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
              class="card"
              style="max-width:640px;background-color:#FFFFFF;border:1px solid #D9DEE8;border-radius:16px;overflow:hidden;">

              <!-- Header + Title (mobile responsive: stacks badge under logo) -->
<tr>
  <td style="padding:0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td bgcolor="${brandBlue}" style="background-color:${brandBlue};padding:18px 22px 14px 22px;">

          <!--[if mso]>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" valign="middle">
                <img src="${logoUrl}" width="124" alt="XIPHIAS Immigration" style="display:block;border:0;height:auto;" />
              </td>
              <td align="right" valign="middle" style="font-family:Arial,Roboto,sans-serif;padding-left:12px;">
                <span style="display:inline-block;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.22);color:#EAF0FF;font-size:11px;font-weight:900;letter-spacing:0.4px;padding:8px 12px;border-radius:999px;white-space:nowrap;">
                  Canada Express Entry • Assessment
                </span>
              </td>
            </tr>
          </table>
          <![endif]-->

          <!--[if !mso]><!-->
          <div style="font-size:0;line-height:0;">
            <div style="display:inline-block;vertical-align:middle;width:100%;max-width:340px;">
              <img
                src="${logoUrl}"
                width="124"
                alt="XIPHIAS Immigration"
                style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:124px;"
              />
            </div>

            <div style="display:inline-block;vertical-align:middle;width:100%;max-width:240px;text-align:right;margin-top:10px;">
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
                white-space:nowrap;
              ">
                Canada Express Entry • Assessment
              </span>
            </div>
          </div>
          <!--<![endif]-->

          <div style="margin-top:12px;font-family:Arial,Roboto,sans-serif;">
            <div style="font-size:20px;line-height:26px;font-weight:900;color:#FFFFFF;">
              Dear ${name}, <span style="color:${accentOrange};">Congratulations!</span>
            </div>

            <div style="margin-top:6px;font-size:12px;line-height:18px;color:rgba(234,240,255,0.92);">
              Your assessment summary is ready. Please review the key scores &amp; next steps below.
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




              <!-- Body -->
              <tr>
                <td class="pad bodyText" style="padding:10px 22px 12px 22px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;text-align:justify;">
                  After the successful launch of the Express Entry Stream in January 2015, anticipation around this stream has surged as it promises to finalise PR applications within six months after ITA and final application submission. The Canadian Government launched the Express Entry Stream to handle Federal Skilled Worker applications and several other economic class applications.
                </td>
              </tr>

              <tr>
                <td class="pad" style="padding:10px 22px 6px 22px;font-family:Arial,Roboto,sans-serif;">
                  <div style="font-size:15px;font-weight:900;color:${brandBlueDeep};letter-spacing:0.2px;">
                    How the Express Entry Process Works
                  </div>
                  <div style="margin-top:8px;height:1px;background:#E5EAF4;line-height:1px;">&nbsp;</div>
                </td>
              </tr>

              <tr>
                <td class="pad bodyText" style="padding:0 22px 10px 22px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;text-align:justify;">
                  Candidates with extraordinary skills, placed in the Express Entry pool, can significantly benefit from this stream as it provides them access to Canada’s Job Bank and even become permanent residents of Canada. The Government of Canada has lifted all fees previously associated with employer eligibility checks for job offers. Therefore, the candidates can pursue employment opportunities with no financial barriers.
                </td>
              </tr>

              <tr>
                <td class="pad bodyText" style="padding:0 22px 12px 22px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;text-align:justify;">
                  Based on the information that you have provided, our government-authorised Immigration Consultancy has conducted an initial immigration assessment. Considering the criteria stated below, we are pleased to inform you that you are eligible for the above Express Entry Process (Placement in Pool and Job Bank using the Federal Skilled Worker Category).
                </td>
              </tr>

              <!-- NOC (simple + clean, one card) -->
<tr>
  <td class="pad" style="padding:6px 22px 10px 22px;font-family:Arial,Roboto,sans-serif;">
    <div style="font-size:14px;line-height:20px;font-weight:900;color:${ink};">
      Documentary proof* of Work Experience:
    </div>
  </td>
</tr>

<tr>
  <td class="pad" style="padding:0 22px 16px 22px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="border-collapse:separate;border-spacing:0;background:#FFFFFF;border:1px solid #E6EAF2;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:14px 14px 12px 14px;font-family:Arial,Roboto,sans-serif;">

          <!-- Top row: label + link -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" valign="middle" style="padding:0;">
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
                  white-space:nowrap;
                ">
                  Profession NOC
                </span>
              </td>

              <td align="right" valign="middle" style="padding:0;">
                <a href="https://noc.esdc.gc.ca/" target="_blank"
                  style="font-family:Arial,Roboto,sans-serif;color:${brandBlue};text-decoration:none;font-size:12px;font-weight:900;white-space:nowrap;">
                  View requirements →
                </a>
              </td>
            </tr>
          </table>

          <!-- Main content -->
          <div style="margin-top:12px;">
            <div style="font-size:18px;line-height:22px;font-weight:900;color:${brandBlueDeep};">
              ${nocCodes}
            </div>
            <div style="margin-top:6px;font-size:13px;line-height:19px;color:#2A3443;">
              ${nocTitle}
            </div>
          </div>

          <!-- Tip -->
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid #EEF1F6;font-size:12px;line-height:18px;color:#667085;">
            Tip: Open the official NOC site and paste your code to confirm duties &amp; eligibility.
          </div>

        </td>
      </tr>
    </table>
  </td>
</tr>

              <tr>
                <td class="pad bodyText" style="padding:0 22px 10px 22px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;text-align:justify;">
                  At least 50% to 60% of the tasks you performed at each of your previous job roles must align perfectly with the outlined links for the respective National Occupational Classification (NOC). If there are any discrepancies in NOC, this could be your final chance to rectify them. So, you must collaborate with your coordinator to determine the accurate NOC for your work experience. While future job NOCs can be updated without additional charges, any changes to previous or current experience NOCs may incur additional fees. Your understanding of these requirements is crucial for successfully processing your visa application.
                </td>
              </tr>

              <tr>
                <td class="pad bodyText" style="padding:0 22px 10px 22px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;text-align:justify;">
                  Education credential assessment (ECA-WES) from the Government of Canada designated organisation applicant and spouse (if applicable).<br />
                  The spouse should also complete ECA to earn a higher ranking in Express Entry.
                </td>
              </tr>

              <tr>
                <td class="pad bodyText" style="padding:0 22px 14px 22px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;text-align:justify;">
                  Language Test Score: One of the possible IELTS Generic Test combinations for the Main Applicant to earn 24 points listed on this assessment: Speaking: 7 Reading: 7 Writing: 7 Listening: 8. The higher score you get the better your CRS. Spouse (if applicable) will require 3.5 in reading, 4 in writing, 4.5 in listening and 4 in speaking on the IELTS Generic Test in order to get 5 points for adaptability. After combining all other points if 67 points are achieved comfortably, then there is no requirement for a spouse to write IELTS but in that case ranking score may go a little low.
                </td>
              </tr>

              <!-- Funds -->
              <!-- Funds (simple highlight bar) -->
<tr>
  <td class="pad" style="padding:0 22px 14px 22px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="border-collapse:separate;border-spacing:0;background:${brandBlueDeep};border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:14px 16px;font-family:Arial,Roboto,sans-serif;color:#FFFFFF;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" valign="middle" style="padding:0;">
                <div style="font-size:11px;line-height:15px;letter-spacing:0.4px;font-weight:900;opacity:0.92;">
                  Total settlement funds
                </div>
                <div style="margin-top:6px;font-size:12px;line-height:18px;opacity:0.95;">
                  for <b>${familyMembers}</b> family member(s)
                </div>
              </td>

              <td align="right" valign="middle" style="padding-left:12px;">
                <span style="
                  display:inline-block;
                  background:rgba(255,255,255,0.14);
                  border:1px solid rgba(255,255,255,0.22);
                  color:#FFFFFF;
                  font-family:Arial,Roboto,sans-serif;
                  font-weight:900;
                  font-size:13px;
                  letter-spacing:0.2px;
                  padding:8px 12px;
                  border-radius:999px;
                  white-space:nowrap;
                ">
                  CAD ${settlementFundsCad}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>


              <!-- Score cards title -->
              <tr>
                <td class="pad"
                  style="padding:0 22px 8px 22px;font-family:Arial,Roboto,sans-serif;color:${ink};font-size:14px;font-weight:900;">
                  Expected Qualifying and Express Entry Comprehensive Ranking Score chart:
                </td>
              </tr>

              <!-- Score cards (already hybrid responsive) -->
              <tr>
                <td class="pad" style="padding:0 22px 14px 22px;">
                  <!--[if (gte mso 9)|(IE)]>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="50%" valign="top" style="padding-right:10px;">
                  <![endif]-->

                  <div style="display:inline-block;vertical-align:top;width:100%;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="border-collapse:separate;border-spacing:0;border:1px solid #E6EAF2;border-radius:14px;overflow:hidden;background:#FFFFFF;box-shadow:0 6px 18px rgba(16,24,40,0.06);">
                      <tr>
                        <td style="background:${brandBlueDeep};color:#FFFFFF;font-family:Arial,Roboto,sans-serif;font-size:13px;font-weight:900;padding:12px;text-align:center;">
                          Skilled worker (67 points to pass)
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:13px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                            <tr>
                              <td style="padding:6px 0;border-bottom:1px solid #EEF1F6;font-weight:900;">Selection Factor</td>
                              <td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;font-weight:900;">Points</td>
                            </tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Age</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">12</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Education level</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">22</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Experience</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">15</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">First language</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">24</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Second language</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">0</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Adaptability</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">5</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Employment job offer</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">0</td></tr>

                            <tr>
                              <td style="padding:10px 0 8px 0;border-top:1px solid #D9DEE8;font-weight:900;">Total:</td>
                              <td align="right" style="padding:10px 0 8px 0;border-top:1px solid #D9DEE8;font-weight:900;">78</td>
                            </tr>

                            <tr>
                              <td colspan="2" align="right" style="padding-top:10px;">
                                <span style="display:inline-block;background:#E9F7EF;color:#166534;border:1px solid #BFE7D0;padding:6px 10px;font-weight:900;border-radius:999px;">
                                  Qualified
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <div style="display:inline-block;width:100%;max-width:16px;height:16px;line-height:16px;">&nbsp;</div>

                  <!--[if (gte mso 9)|(IE)]>
                      </td><td width="50%" valign="top" style="padding-left:10px;">
                  <![endif]-->

                  <div style="display:inline-block;vertical-align:top;width:100%;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="border-collapse:separate;border-spacing:0;border:1px solid #E6EAF2;border-radius:14px;overflow:hidden;background:#FFFFFF;box-shadow:0 6px 18px rgba(16,24,40,0.06);">
                      <tr>
                        <td style="background:${brandBlueDeep};color:#FFFFFF;font-family:Arial,Roboto,sans-serif;font-size:13px;font-weight:900;padding:12px;text-align:center;">
                          Express Entry
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:13px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                            <tr>
                              <td style="padding:6px 0;border-bottom:1px solid #EEF1F6;font-weight:900;">Selection Factor</td>
                              <td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;font-weight:900;">Points</td>
                            </tr>

                            <tr>
                              <td colspan="2" style="padding:8px 10px;background:${brandBlueDark};color:#fff;font-weight:900;border-radius:10px;">
                                Core Human Capital Maximum: 460 points
                              </td>
                            </tr>

                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Age</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">70</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Education</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">119</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">First language</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">116</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Second language</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">0</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Canadian work experience</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">0</td></tr>

                            <tr>
                              <td colspan="2" style="padding:8px 10px;background:${brandBlueDark};color:#fff;font-weight:900;border-radius:10px;">
                                Core Human Capital (Spouse/Common-law) Maximum: 40 points
                              </td>
                            </tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Education</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">10</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">First language</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">12</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Canadian work experience</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">0</td></tr>

                            <tr>
                              <td colspan="2" style="padding:8px 10px;background:${brandBlueDark};color:#fff;font-weight:900;border-radius:10px;">
                                Skill transferability combos Maximum: 100 points
                              </td>
                            </tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Education and language</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">50</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Education and Canadian work</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">0</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Foreign work and language</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">50</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Foreign work and Canadian work</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">0</td></tr>

                            <tr>
                              <td style="padding:10px 0 8px 0;border-top:1px solid #D9DEE8;font-weight:900;">Total:</td>
                              <td align="right" style="padding:10px 0 8px 0;border-top:1px solid #D9DEE8;font-weight:900;">427</td>
                            </tr>

                            <tr>
                              <td colspan="2" style="padding:8px 10px;background:${brandBlueDark};color:#fff;font-weight:900;border-radius:10px;">
                                Additional points (max 600)
                              </td>
                            </tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Provincial nomination</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">0</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Study in Canada</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">0</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">Sibling in Canada</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">15</td></tr>
                            <tr><td style="padding:6px 0;border-bottom:1px solid #EEF1F6;">French-language skills</td><td align="right" style="padding:6px 0;border-bottom:1px solid #EEF1F6;">0</td></tr>

                            <tr>
                              <td style="padding:10px 0 0 0;border-top:1px solid #D9DEE8;font-weight:900;">Subtotal additional points:</td>
                              <td align="right" style="padding:10px 0 0 0;border-top:1px solid #D9DEE8;font-weight:900;">15</td>
                            </tr>
                          </table>
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

              <!-- Guidance -->
              <tr>
                <td class="pad bodyText" style="padding:0 22px 12px 22px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;text-align:justify;">
                  Even though it's your discretion, many times when you try to create a legal profile on your own, even a small error can cause big implications in immigration, and if refused, it creates an issue even for applying to other countries. If you would like XIPHIAS to handle your Canadian immigration and related services, please do not create Express entry or other online profiles on your own. We will professionally evaluate, manage, and create your profile through our designated access with CIC. We won't be able to do so if you create your profiles on your own by mistake, because it will be rejected for duplication.
                </td>
              </tr>

              <tr>
                <td class="pad bodyText" style="padding:0 22px 10px 22px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;text-align:justify;">
                  There are three situations to get faster "ITA" to become a Permanent Resident in the fastest possible timeframe:
                </td>
              </tr>

              <!-- Ways to improve chances (simple card + clean bullets) -->
<tr>
  <td class="pad" style="padding:0 22px 14px 22px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="border-collapse:separate;border-spacing:0;background:#FFFFFF;border:1px solid #E6EAF2;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:12px 14px;background:rgba(11,87,208,0.06);font-family:Arial,Roboto,sans-serif;">
          <div style="font-size:13px;line-height:18px;font-weight:900;color:${brandBlueDeep};letter-spacing:0.2px;">
            Ways to improve your chances
          </div>
        </td>
      </tr>

      <tr>
        <td style="padding:12px 14px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td width="22" valign="top" style="padding:2px 0 10px 0;">
                <div style="width:16px;height:16px;line-height:16px;text-align:center;background:rgba(243,170,58,0.22);border:1px solid rgba(243,170,58,0.35);border-radius:6px;">
                  <span style="display:inline-block;width:6px;height:6px;background:${brandBlueDeep};border-radius:99px;">&nbsp;</span>
                </div>
              </td>
              <td valign="top" style="padding:0 0 10px 10px;">
                Meet the CRS score cut-off of the Government.
              </td>
            </tr>

            <tr>
              <td colspan="2" style="padding:0 0 10px 0;">
                <div style="height:1px;line-height:1px;background:#EEF1F6;">&nbsp;</div>
              </td>
            </tr>

            <tr>
              <td width="22" valign="top" style="padding:2px 0 10px 0;">
                <div style="width:16px;height:16px;line-height:16px;text-align:center;background:rgba(243,170,58,0.22);border:1px solid rgba(243,170,58,0.35);border-radius:6px;">
                  <span style="display:inline-block;width:6px;height:6px;background:${brandBlueDeep};border-radius:99px;">&nbsp;</span>
                </div>
              </td>
              <td valign="top" style="padding:0 0 10px 10px;">
                Job offer through the government-managed Job Bank (you will get access).
              </td>
            </tr>

            <tr>
              <td colspan="2" style="padding:0 0 10px 0;">
                <div style="height:1px;line-height:1px;background:#EEF1F6;">&nbsp;</div>
              </td>
            </tr>

            <tr>
              <td width="22" valign="top" style="padding:2px 0 0 0;">
                <div style="width:16px;height:16px;line-height:16px;text-align:center;background:rgba(243,170,58,0.22);border:1px solid rgba(243,170,58,0.35);border-radius:6px;">
                  <span style="display:inline-block;width:6px;height:6px;background:${brandBlueDeep};border-radius:99px;">&nbsp;</span>
                </div>
              </td>
              <td valign="top" style="padding:0 0 0 10px;">
                Nomination by a Province.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>


              <tr>
                <td class="pad bodyText" style="padding:0 22px 14px 22px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;text-align:justify;">
                  Usually, Provincial Nomination programs have limitations of settlement and are independent with their own full consulting/govt fee. But we have designed special pricing and plan (Processes 1, 2 and 3 optional) for the fastest possible timeframe to become PR. First, we start with federal possibility and then we try our best to explore provincial solutions for you in case of low CRS or no job offer.
                </td>
              </tr>

              <!-- Process + Fees (already hybrid responsive) -->
              ${/* Keeping exactly your existing Process + Fees block */ ""}
              <tr>
                <td class="pad" style="padding:4px 22px 16px 22px;">
                  <!--[if (gte mso 9)|(IE)]>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="50%" valign="top" style="padding-right:10px;">
                  <![endif]-->

                  <div style="display:inline-block;vertical-align:top;width:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="border-collapse:separate;border-spacing:0;background:#FFFFFF;border:1px solid #E6EAF2;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="padding:12px 14px;background:${brandBlueDeep};font-family:Arial,Roboto,sans-serif;">
        <div style="color:#FFFFFF;font-weight:900;font-size:13px;letter-spacing:0.3px;line-height:18px;">
          Process Plan
        </div>
      </td>
    </tr>

    <tr>
      <td style="padding:12px 14px;font-family:Arial,Roboto,sans-serif;color:#2A3443;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          
          <tr>
            <td width="28" valign="top" style="padding:0 0 12px 0;">
              <div style="width:22px;height:22px;line-height:22px;text-align:center;background:${accentOrange};color:${ink};font-weight:900;border-radius:8px;font-size:12px;">
                1
              </div>
            </td>
            <td valign="top" style="padding:0 0 12px 10px;">
              <div style="font-weight:900;color:${ink};font-size:13px;line-height:18px;">
                Express Entry Profile
              </div>
              <div style="margin-top:2px;font-size:12px;color:#445064;line-height:17px;">
                Placement in pool &amp; Job Bank via FSW category.
              </div>
            </td>
          </tr>

          <tr>
            <td colspan="2" style="padding:0 0 12px 0;">
              <div style="height:1px;line-height:1px;background:#EEF1F6;">&nbsp;</div>
            </td>
          </tr>

          <tr>
            <td width="28" valign="top" style="padding:0 0 12px 0;">
              <div style="width:22px;height:22px;line-height:22px;text-align:center;background:${accentOrange};color:${ink};font-weight:900;border-radius:8px;font-size:12px;">
                2
              </div>
            </td>
            <td valign="top" style="padding:0 0 12px 10px;">
              <div style="font-weight:900;color:${ink};font-size:13px;line-height:18px;">
                PR Application Filing
              </div>
              <div style="margin-top:2px;font-size:12px;color:#445064;line-height:17px;">
                Final PR application &amp; representation after ITA/nomination.
              </div>
            </td>
          </tr>

          <tr>
            <td colspan="2" style="padding:0 0 12px 0;">
              <div style="height:1px;line-height:1px;background:#EEF1F6;">&nbsp;</div>
            </td>
          </tr>

          <tr>
            <td width="28" valign="top" style="padding:0;">
              <div style="width:22px;height:22px;line-height:22px;text-align:center;background:${accentOrange};color:${ink};font-weight:900;border-radius:8px;font-size:12px;">
                3
              </div>
            </td>
            <td valign="top" style="padding:0 0 0 10px;">
              <div style="font-weight:900;color:${ink};font-size:13px;line-height:18px;">
                PNP (Optional)
              </div>
              <div style="margin-top:2px;font-size:12px;color:#445064;line-height:17px;">
                Only if required for faster ITA.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</div>


                  <div style="display:inline-block;width:100%;max-width:16px;height:16px;line-height:16px;">&nbsp;</div>

                  <!--[if (gte mso 9)|(IE)]>
                      </td><td width="50%" valign="top" style="padding-left:10px;">
                  <![endif]-->

                  <div style="display:inline-block;vertical-align:top;width:100%;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="border-collapse:separate;border-spacing:0;background:#FFFFFF;border:1px solid #E6EAF2;border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(16,24,40,0.06);">
                      <tr>
                        <td style="background:${brandBlueDeep};color:#fff;font-family:Arial,Roboto,sans-serif;font-weight:900;padding:12px 14px;font-size:13px;letter-spacing:0.3px;">
                          Fees &amp; Payments
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px;font-family:Arial,Roboto,sans-serif;color:#2A3443;">
                          <div style="font-weight:900;color:${ink};font-size:13px;line-height:18px;margin-bottom:8px;">
                            Estimated total (FSW): INR 2,65,500
                          </div>

                          <div style="font-size:12px;color:#445064;line-height:17px;margin-bottom:12px;">
                            Includes taxes and Government fees (approx. CAD 1525) plus biometrics (CAD 85 for single applicant / CAD 170 for family).
                          </div>

                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                            <tr>
                              <td style="padding:0 0 12px 0;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                                  style="border-collapse:separate;border-spacing:0;border:1px solid #E6EAF2;border-radius:12px;overflow:hidden;background:#FFFFFF;">
                                  <tr>
                                    <td style="padding:10px 12px;background:${brandBlue};color:#fff;font-family:Arial,Roboto,sans-serif;font-weight:900;font-size:12px;">
                                      Process 1
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding:10px 12px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:12px;line-height:18px;">
                                      Consultation &amp; representation fee: INR 1,18,000 (incl. tax) + WES assessment fee (CAD 250–300).
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:0 0 12px 0;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                                  style="border-collapse:separate;border-spacing:0;border:1px solid #E6EAF2;border-radius:12px;overflow:hidden;background:#FFFFFF;">
                                  <tr>
                                    <td style="padding:10px 12px;background:${brandBlue};color:#fff;font-family:Arial,Roboto,sans-serif;font-weight:900;font-size:12px;">
                                      Process 2
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding:10px 12px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:12px;line-height:18px;">
                                      INR 1,18,000 payable after ITA/provincial nomination; includes consultation &amp; representation.
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>

                            <tr>
                              <td>
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                                  style="border-collapse:separate;border-spacing:0;border:1px solid #E6EAF2;border-radius:12px;overflow:hidden;background:#FFFFFF;">
                                  <tr>
                                    <td style="padding:10px 12px;background:${brandBlue};color:#fff;font-family:Arial,Roboto,sans-serif;font-weight:900;font-size:12px;">
                                      Process 3 (optional)
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding:10px 12px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:12px;line-height:18px;">
                                      INR 29,500 (optional) payable only if Provincial Nomination Program is required for faster results.
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

                  <!--[if (gte mso 9)|(IE)]>
                      </td>
                    </tr>
                  </table>
                  <![endif]-->
                </td>
              </tr>

              <!-- Payment / Next steps (clean section + card) -->
<tr>
  <td class="pad" style="padding:10px 22px 10px 22px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="border-collapse:separate;border-spacing:0;background:#FFFFFF;border:1px solid #E6EAF2;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:12px 14px;background:rgba(11,87,208,0.06);font-family:Arial,Roboto,sans-serif;">
          <div style="font-size:15px;line-height:20px;font-weight:900;color:${brandBlueDeep};">
            Complete your payment
          </div>
          <div style="margin-top:4px;font-size:12px;line-height:18px;color:#3A4658;">
            Please find the bank details to transfer online.
          </div>
        </td>
      </tr>

      <tr>
        <td style="padding:12px 14px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;text-align:justify;">
          This could be your investment for a better future. With your permission, we want to start the process to provide you immigration consultation and representation service. Please proceed immediately by contacting our team to know and get current special discount. After you pay for Process 1 and sign the retainer agreement(s) (mandated by ICCRC), we will start your process. You will get final retainer agreement(s) signed by our ICCRC RCIC.
        </td>
      </tr>

      <tr>
        <td style="padding:0 14px 8px 14px;font-family:Arial,Roboto,sans-serif;">
          <div style="font-size:13px;line-height:18px;font-weight:900;color:${ink};">
            Summary overview (as per retainer agreement)
          </div>
          <div style="margin-top:8px;height:1px;line-height:1px;background:#EEF1F6;">&nbsp;</div>
        </td>
      </tr>

      <tr>
        <td style="padding:10px 14px 12px 14px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;">
          <ul style="margin:0;padding-left:18px;">
            <li style="margin:0 0 6px 0;">Assist with ECA credential assessment completion.</li>
            <li style="margin:0 0 6px 0;">Assist with medical examination process to be completed in advance.</li>
            <li style="margin:0 0 6px 0;">Assist to gather all required documents and file application when “Invitation to apply” is received.</li>
            <li style="margin:0 0 6px 0;">Provide ongoing representation to your application with government offices in Canada and India.</li>
            <li style="margin:0;">Provide regular updates to you until a decision is made by the government of Canada.</li>
          </ul>
        </td>
      </tr>

      <tr>
        <td style="padding:0 14px 14px 14px;font-family:Arial,Roboto,sans-serif;color:#2A3443;font-size:14px;line-height:22px;text-align:justify;">
          Once we receive proof of payment for Process 1 and a signed copy of the retainer agreement(s), we will assign one coordinator. They will work closely with an RCIC-authorised Canadian immigration consultant to provide you ongoing support and get answers for all your immigration-related questions.
          <br>
        
          We closely work with our offices, associates and partners to provide guidance/referral to cover per-departure and post-landing activities along with Job search assistance.
        </td>
      </tr>
    </table>
  </td>
</tr>


              <!-- Footer (your responsive footer, unchanged) -->
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

export default async function CanadaAssessmentReportPage({
  searchParams,
}: {
  searchParams: SearchParams | Promise<SearchParams>;
}) {
  const sp = await searchParams; // ✅ unwrap promise

  const name = pickParam(sp, "name", "Enter Name");
  const nocCodes = pickParam(sp, "noc", "60010, 11201");
  const nocTitle = pickParam(
    sp,
    "title",
    "Corporate Sales Managers, Business Management Consultant"
  );
  const familyMembers = pickParam(sp, "family", "2");
  const settlementFundsCad = pickParam(sp, "funds", "19001");

  const assetOrigin =
    process.env.NEXT_PUBLIC_ASSET_ORIGIN?.replace(/\/$/, "") ||
    "https://xiphiasimmigration.com";

  const reportHtml = buildReportHtml({
    name,
    nocCodes,
    nocTitle,
    familyMembers,
    settlementFundsCad,
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

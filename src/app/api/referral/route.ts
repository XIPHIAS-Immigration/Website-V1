import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getPlatformRepository } from "@/lib/platform/repository";
import { captureVisitorEvent } from "@/lib/platform/visitor-analytics";

export async function POST(req: Request) {
  console.log("📨 API /api/referral hit");

  try {
    const body = await req.json();

    const {
      referrerName,
      referrerEmail,
      referrerPhone,
      referrerClientId,
      friendName,
      friendEmail,
      friendPhone,
      friendCountry,
      notes,
      page,
      referrerUrl,
    } = body || {};

    if (!referrerName || !referrerEmail || !friendName || !friendEmail) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    console.log(
      "✅ Referral received from:",
      referrerName,
      "for:",
      friendName
    );

    let leadId: string | undefined;
    try {
      const cleanFriendName = String(friendName || "").trim();
      const cleanFriendEmail = String(friendEmail || "").trim().toLowerCase();
      const cleanFriendPhone = String(friendPhone || "").trim();
      const cleanFriendCountry = String(friendCountry || "").trim();
      const cleanNotes = String(notes || "").trim();
      const cleanPage = String(page || req.headers.get("referer") || "/client-referrals").trim();
      const cleanReferrerUrl = String(referrerUrl || req.headers.get("referer") || "").trim();
      const repo = getPlatformRepository();
      const lead = repo.createLead({
        source: "website",
        status: "new",
        name: cleanFriendName,
        email: cleanFriendEmail,
        phone: cleanFriendPhone || undefined,
        country: cleanFriendCountry || undefined,
        message: `Client referral from ${String(referrerName || "").trim()}${cleanNotes ? `: ${cleanNotes}` : ""}`,
        page: cleanPage || "/client-referrals",
        referrer: cleanReferrerUrl || undefined,
        consent: true,
        tags: ["client-referral", referrerClientId ? "existing-client-referral" : ""].filter(Boolean),
      });
      leadId = lead.id;
      repo.createConversation({
        leadId: lead.id,
        channel: "portal",
        direction: "inbound",
        from: String(referrerName || "Referral").trim() || "Referral",
        to: "XIPHIAS",
        body: `Referred ${cleanFriendName}${cleanFriendCountry ? ` for ${cleanFriendCountry}` : ""}.${cleanNotes ? ` Notes: ${cleanNotes}` : ""}`,
      });
      await captureVisitorEvent(
        {
          type: "lead_capture",
          visitorId: lead.id,
          path: cleanPage || "/client-referrals",
          referrer: cleanReferrerUrl || undefined,
          label: "client-referral",
          name: cleanFriendName,
          email: cleanFriendEmail,
          phone: cleanFriendPhone || undefined,
          query: cleanNotes || undefined,
          interests: ["referral", cleanFriendCountry].filter(Boolean),
          metadata: {
            leadId: lead.id,
            referrerName,
            referrerEmail,
            referrerPhone,
            referrerClientId,
          },
        },
        req.headers,
      );
    } catch (leadError) {
      console.error("[referral] X-Hub lead capture failed:", leadError);
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ---- Referrer email ----
    const referrerHtml = `
      <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:auto;background:#fff;border:1px solid #eaeaea;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div style="background:linear-gradient(90deg,#002961,#004fa3);color:#fff;text-align:center;padding:20px;">
          <h2 style="margin:0;font-size:20px;">Thank you for your referral, ${escapeHtml(
            referrerName
          )}</h2>
        </div>
        <div style="padding:24px;color:#333;line-height:1.7;">
          <p style="font-size:16px;">Dear <strong>${escapeHtml(
            referrerName
          )}</strong>,</p>
          <p>Thank you for referring <strong>${escapeHtml(
            friendName
          )}</strong> to <strong>XIPHIAS Immigration</strong>.</p>
          <div style="background:#f9f9f9;padding:16px 20px;border-left:4px solid #004fa3;margin-top:20px;border-radius:6px;">
            <p style="margin:0 0 8px 0;font-weight:600;">Referral summary</p>
            <p style="margin:4px 0;"><strong>Friend's name:</strong> ${escapeHtml(
              friendName
            )}</p>
            <p style="margin:4px 0;"><strong>Friend's email:</strong> <a href="mailto:${friendEmail}" style="color:#004fa3;text-decoration:none;">${friendEmail}</a></p>
            ${
              friendPhone
                ? `<p style="margin:4px 0;"><strong>Friend's phone:</strong> ${escapeHtml(
                    friendPhone
                  )}</p>`
                : ""
            }
            ${
              friendCountry
                ? `<p style="margin:4px 0;"><strong>Country of interest:</strong> ${escapeHtml(
                    friendCountry
                  )}</p>`
                : ""
            }
            ${
              notes
                ? `<p style="margin:4px 0;"><strong>Notes:</strong> ${escapeHtml(
                    notes
                  )}</p>`
                : ""
            }
          </div>
          <p style="margin-top:20px;">Our team will reach out to your referral shortly, mention your name, and guide them through the next steps.</p>
          <p style="margin-top:20px;font-size:14px;">We appreciate your trust in us.</p>
          <div style="text-align:center;margin-top:30px;">
            <a href="https://www.xiphiasimmigration.com" target="_blank" style="background:#004fa3;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">Visit our website</a>
          </div>
        </div>
      </div>
    `;

    // ---- Admin email ----
    const adminHtml = `
      <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:auto;background:#fff;border:1px solid #eaeaea;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div style="background:#004fa3;color:#fff;text-align:center;padding:20px;">
          <h2 style="margin:0;font-size:20px;">📩 New Client Referral from Website</h2>
        </div>
        <div style="padding:24px;color:#333;line-height:1.7;">
          <h3 style="margin-top:0;font-size:15px;">Referrer details</h3>
          <table style="width:100%;border-collapse:collapse;margin-top:4px;">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Name</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(
              referrerName
            )}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Email</strong></td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="mailto:${referrerEmail}" style="color:#004fa3;text-decoration:none;">${referrerEmail}</a></td></tr>
            ${
              referrerPhone
                ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Phone</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(
                    referrerPhone
                  )}</td></tr>`
                : ""
            }
            ${
              referrerClientId
                ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Client ID / Case no.</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(
                    referrerClientId
                  )}</td></tr>`
                : ""
            }
          </table>

          <h3 style="margin-top:18px;font-size:15px;">Referred contact details</h3>
          <table style="width:100%;border-collapse:collapse;margin-top:4px;">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Name</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(
              friendName
            )}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Email</strong></td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="mailto:${friendEmail}" style="color:#004fa3;text-decoration:none;">${friendEmail}</a></td></tr>
            ${
              friendPhone
                ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Phone</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(
                    friendPhone
                  )}</td></tr>`
                : ""
            }
            ${
              friendCountry
                ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Country of interest</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(
                    friendCountry
                  )}</td></tr>`
                : ""
            }
            ${
              notes
                ? `<tr><td style="padding:8px;"><strong>Notes</strong></td><td style="padding:8px;">${escapeHtml(
                    notes
                  )}</td></tr>`
                : ""
            }
          </table>

          <p style="margin-top:16px;font-size:13px;color:#666;">
            Page: ${page || "-"}<br/>
            Referrer URL: ${referrerUrl || "-"}
          </p>
        </div>
      </div>
    `;

    const userMail = {
      from: `"XIPHIAS Immigration" <${process.env.SMTP_USER}>`,
      to: referrerEmail,
      subject: "🙏 Thank you for your referral",
      html: referrerHtml,
    };

    const adminMail = {
      from: `"XIPHIAS Website" <${process.env.SMTP_USER}>`,
      to: "immigration@xiphias.in",
      subject: "📩 New client referral from website",
      html: adminHtml,
    };

    // TODO: CRM integration here (send `body` to your CRM API)

    await Promise.all([
      transporter.sendMail(adminMail),
      transporter.sendMail(userMail),
    ]);

    console.log("✅ Referral emails sent to admin and referrer");
    return NextResponse.json({
      ok: true,
      message: "Referral submitted successfully",
      leadId,
    });
  } catch (err: any) {
    console.error("❌ Error in /api/referral:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function escapeHtml(str: string | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

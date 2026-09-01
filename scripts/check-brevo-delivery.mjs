const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) throw new Error("Brevo settings are missing");
const url = new URL("https://api.brevo.com/v3/smtp/emails");
url.searchParams.set("limit", "50");
url.searchParams.set("sort", "desc");
url.searchParams.set("email", "abdulaziz.stocks11@gmail.com");
const response = await fetch(url, { headers: { accept: "application/json", "api-key": apiKey } });
const body = await response.json().catch(() => ({}));
if (!response.ok) {
  console.error(JSON.stringify({ ok: false, status: response.status, error: body?.message ?? "Brevo log lookup failed" }));
  process.exit(1);
}
const messages = Array.isArray(body?.transactionalEmails) ? body.transactionalEmails : [];
const matches = messages.filter((item) => String(item?.recipient ?? item?.to ?? "").toLowerCase().includes("abdulaziz.stocks11@gmail.com") || String(item?.subject ?? "").includes("اختبار بريد رَكيزة"));
console.log(JSON.stringify({ ok: true, total: messages.length, matches: matches.map((item) => ({ date: item?.date ?? null, subject: item?.subject ?? null, recipient: item?.recipient ?? item?.to ?? null, status: item?.status ?? null })) }));

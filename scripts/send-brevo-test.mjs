const apiKey = process.env.BREVO_API_KEY;
const senderEmail = process.env.BREVO_SENDER_EMAIL;
const recipient = "abdulaziz.stocks11@gmail.com";

if (!apiKey || !senderEmail) {
  throw new Error("Brevo settings are missing");
}

const response = await fetch("https://api.brevo.com/v3/smtp/email", {
  method: "POST",
  headers: {
    accept: "application/json",
    "api-key": apiKey,
    "content-type": "application/json",
  },
  body: JSON.stringify({
    sender: { email: senderEmail, name: "رَكيزة" },
    to: [{ email: recipient, name: "عبدالعزيز" }],
    subject: "اختبار بريد رَكيزة",
    textContent: "هذه رسالة اختبار واحدة من رَكيزة للتحقق من إعداد Brevo. لا تحتوي على رمز دخول أو بيانات موظفين.",
  }),
});

const body = await response.json().catch(() => ({}));
if (!response.ok) {
  console.error(JSON.stringify({ ok: false, status: response.status, error: body?.message ?? "Brevo rejected the message" }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, status: response.status, messageId: body?.messageId ? "received" : "not-returned" }));

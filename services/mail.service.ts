import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER)

export interface MailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

export async function sendEmail({ to, subject, text, html }: MailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "ASTRAL AI <no-reply@astral-ai.com>",
      to,
      subject,
      text,
      html,
    })
    console.log(`[EMAIL_SENT]: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("[EMAIL_SEND_FAILURE]:", error)
    return { success: false, error }
  }
}

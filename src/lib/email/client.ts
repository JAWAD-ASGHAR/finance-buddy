import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import {
  getSmtpHost,
  getSmtpPass,
  getSmtpPort,
  getSmtpUser,
} from "@/lib/email/env";

let transporter: Transporter | null = null;

export function getSmtpTransporter(): Transporter | null {
  const user = getSmtpUser();
  const pass = getSmtpPass();
  if (!user || !pass) {
    return null;
  }

  if (!transporter) {
    const port = getSmtpPort();
    transporter = nodemailer.createTransport({
      host: getSmtpHost(),
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return transporter;
}

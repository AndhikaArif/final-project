import fs from "fs/promises";
import Handlebars from "handlebars";
import { sendEmail } from "./mailer.js";

export class EmailUtil {
  private async renderTemplate(
    templateName: string,
    context: Record<string, unknown>,
  ) {
    const source = await fs.readFile(
      `src/emails/templates/${templateName}.template.hbs`,
      "utf-8",
    );

    const template = Handlebars.compile(source);
    return template(context);
  }

  async sendVerificationEmail(email: string, token: string) {
    const verifyLink = `${process.env.WEB_DOMAIN}/verify-email?token=${token}`;

    const html = await this.renderTemplate("verify-email", {
      verifyLink,
    });

    await sendEmail({
      to: email,
      subject: "Verify your account",
      html,
    });
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const resetLink = `${process.env.WEB_DOMAIN}/reset-password?token=${token}`;

    const html = await this.renderTemplate("reset-password", {
      resetLink,
    });

    await sendEmail({
      to: email,
      subject: "Reset Password",
      html,
    });
  }
}

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get("SMTP_HOST", "smtp.mailtrap.io"),
      port: Number(config.get("SMTP_PORT", "2525")),
      auth: {
        user: config.get("SMTP_USER", ""),
        pass: config.get("SMTP_PASS", "")
      }
    });
  }

  async sendWelcomeEmail(email: string, name: string) {
    return this.sendEmail({
      to: email,
      subject: "Welcome to LEILPORTAL",
      html: `
        <h1>Welcome, ${name}!</h1>
        <p>Your account has been created successfully.</p>
        <p>Get started by logging in and exploring your dashboard.</p>
        <a href="${this.config.get("WEB_ORIGIN", "http://localhost:3000")}">Go to Dashboard</a>
      `
    });
  }

  async sendProjectInvite(email: string, projectName: string, inviterName: string) {
    return this.sendEmail({
      to: email,
      subject: `You've been invited to project: ${projectName}`,
      html: `
        <h1>Project Invitation</h1>
        <p>${inviterName} has invited you to collaborate on <strong>${projectName}</strong>.</p>
        <p>Log in to view the project and start collaborating.</p>
      `
    });
  }

  async sendTaskAssigned(email: string, taskTitle: string, projectName: string) {
    return this.sendEmail({
      to: email,
      subject: `New task assigned: ${taskTitle}`,
      html: `
        <h1>Task Assigned</h1>
        <p>You've been assigned to task: <strong>${taskTitle}</strong> in project <em>${projectName}</em>.</p>
      `
    });
  }

  async sendInvoiceNotification(email: string, amount: string, dueDate: string) {
    return this.sendEmail({
      to: email,
      subject: `New Invoice: $${amount}`,
      html: `
        <h1>New Invoice</h1>
        <p>You've received a new invoice for <strong>$${amount}</strong>.</p>
        <p>Due date: ${dueDate}</p>
        <a href="${this.config.get("WEB_ORIGIN", "http://localhost:3000")}/billing">View Invoice</a>
      `
    });
  }

  private async sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    try {
      await this.transporter.sendMail({
        from: this.config.get("SMTP_FROM", "noreply@leilportal.com"),
        to,
        subject,
        html
      });
    } catch (err) {
      console.error("Failed to send email:", err);
    }
  }
}
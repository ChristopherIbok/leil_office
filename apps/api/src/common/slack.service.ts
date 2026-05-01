import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

interface SlackMessage {
  text?: string;
  blocks?: SlackBlock[];
}

interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  elements?: Array<{
    type: string;
    text?: string;
    url?: string;
  }>;
}

@Injectable()
export class SlackService {
  private webhookUrl: string;

  constructor(private readonly config: ConfigService) {
    this.webhookUrl = this.config.get<string>("SLACK_WEBHOOK_URL") || "";
  }

  async sendNotification(message: string, channel?: string) {
    if (!this.webhookUrl) {
      console.log("Slack webhook not configured, skipping notification");
      return;
    }

    const payload: SlackMessage = {
      text: message,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: message
          }
        }
      ]
    };

    if (channel) {
      payload.text = `<#${channel}> ${message}`;
    }

    try {
      await axios.post(this.webhookUrl, payload);
    } catch (err) {
      console.error("Failed to send Slack notification:", err);
    }
  }

  async sendProjectUpdate(projectName: string, status: string, message: string) {
    const text = `*Project Update: ${projectName}*\nStatus: ${status}\n${message}`;
    return this.sendNotification(text);
  }

  async sendTaskNotification(taskTitle: string, assignee: string, action: string) {
    const text = `*Task ${action}*\nTask: ${taskTitle}\nAssignee: ${assignee}`;
    return this.sendNotification(text);
  }

  async sendInvoiceNotification(clientName: string, amount: string, status: string) {
    const text = `*Invoice ${status}*\nClient: ${clientName}\nAmount: $${amount}`;
    return this.sendNotification(text);
  }
}
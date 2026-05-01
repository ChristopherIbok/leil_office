import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

interface NotionTask {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
}

@Injectable()
export class NotionService {
  private apiKey: string;
  private databaseId: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>("NOTION_API_KEY") || "";
    this.databaseId = this.config.get<string>("NOTION_DATABASE_ID") || "";
  }

  async syncProjectToNotion(projectName: string, tasks: NotionTask[]) {
    if (!this.apiKey || !this.databaseId) {
      console.log("Notion not configured, skipping sync");
      return;
    }

    try {
      for (const task of tasks) {
        await axios.post(
          "https://api.notion.com/v1/pages",
          {
            parent: { database_id: this.databaseId },
            properties: {
              Name: { title: [{ text: { content: task.title } }] },
              Status: { select: { name: task.status } },
              ...(task.dueDate && {
                "Due Date": { date: { start: task.dueDate } }
              })
            }
          },
          {
            headers: {
              "Authorization": `Bearer ${this.apiKey}`,
              "Notion-Version": "2022-06-28",
              "Content-Type": "application/json"
            }
          }
        );
      }
    } catch (err) {
      console.error("Failed to sync with Notion:", err);
    }
  }

  async getTasksFromNotion() {
    if (!this.apiKey || !this.databaseId) {
      return [];
    }

    try {
      const response = await axios.post(
        `https://api.notion.com/v1/databases/${this.databaseId}/query`,
        {},
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
          }
        }
      );

      return response.data.results.map((page: any) => ({
        id: page.id,
        title: page.properties.Name.title[0]?.plain_text || "Untitled",
        status: page.properties.Status?.select?.name || "Not Started",
        dueDate: page.properties["Due Date"]?.date?.start
      }));
    } catch (err) {
      console.error("Failed to fetch from Notion:", err);
      return [];
    }
  }
}
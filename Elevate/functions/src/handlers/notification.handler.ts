// functions/src/handlers/notification.handler.ts
import {Request, Response} from "express";
import {NotificationService} from "../services/notification.service";

export const getNotifications = async (_req: Request, res: Response) => {
  try {
    const notifications = await NotificationService.getAll();
    res.json({success: true, notifications});
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({success: false, message: "Internal Server Error"});
  }
};

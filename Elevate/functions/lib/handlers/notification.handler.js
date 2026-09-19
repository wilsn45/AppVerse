"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = void 0;
const notification_service_1 = require("../services/notification.service");
const getNotifications = async (_req, res) => {
    try {
        const notifications = await notification_service_1.NotificationService.getAll();
        res.json({ success: true, notifications });
    }
    catch (error) {
        console.error("Error getting notifications:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.getNotifications = getNotifications;
//# sourceMappingURL=notification.handler.js.map
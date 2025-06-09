// functions/src/services/notification.service.ts
import * as admin from "firebase-admin";

export class NotificationService {
  static async getAll() {
    const snapshot = await admin.firestore().collection("Notification").get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      courseId: doc.data().courseId,
      timestamp: doc.data().timestamp,
    }));
  }
}

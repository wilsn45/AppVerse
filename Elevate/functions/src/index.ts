import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express, {Request, Response, NextFunction} from "express";
import cors from "cors";
import {getNotifications} from "./handlers/notification.handler";
import {onCall} from "firebase-functions/v2/https";
import {getCurioFeedHandler} from "./curio/feed";

admin.initializeApp();

const app = express();

app.use(cors({origin: true}));

app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({message: "Unauthorized: No token provided"});
      return; // 🔁 ensures this path ends
    }

    const idToken = authHeader.split("Bearer ")[1];

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    (req as any).user = decodedToken;
    next(); // 🔁 happy path
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({message: "Unauthorized: Invalid token"});
    return; // 🔁 ensures catch block ends
  }
});

app.get("/notifications", getNotifications);

// ✅ This is the function name you're exposing via Firebase
export const api = functions.https.onRequest(app);

// Public by design: Curio V1 does not require an account.
export const getCurioFeed = onCall(
  {region: "us-central1", cors: true},
  getCurioFeedHandler,
);

import * as admin from "firebase-admin";
import {onCall} from "firebase-functions/v2/https";
import {getCurioFeedHandler} from "./curio/feed";

admin.initializeApp();

// Public by design: Curio V1 does not require an account.
export const getCurioFeed = onCall(
  {
    region: "us-central1",
    cors: true,
  },
  getCurioFeedHandler,
);

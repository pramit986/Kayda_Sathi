import { Router, Request, Response } from "express";
import { db, firebaseApp, firebaseInitError } from "../config/firebase";

const router = Router();

// GET /api/health
router.get("/", (_req: Request, res: Response) => {
  return res.json({
    success: true,
    message: "Kayda Sathi API is running",
  });
});

// GET /api/health/firebase
router.get("/firebase", async (_req: Request, res: Response) => {
  try {
    if (!firebaseApp || !db || firebaseInitError) {
      return res.status(503).json({
        success: false,
        error: "Firebase is not configured correctly. Check service account credentials.",
      });
    }

    // Verify backend can communicate with Firestore
    await db.listCollections();

    return res.json({
      success: true,
      firebase: "connected",
    });
  } catch (error: any) {
    const errorDetails: string = error?.details || error?.message || "";
    let errorMessage = "Failed to communicate with Firestore.";

    if (
      errorDetails.includes("Cloud Firestore API has not been used") ||
      errorDetails.includes("disabled")
    ) {
      errorMessage =
        "Cloud Firestore API is not enabled or the Firestore Database has not been created yet. Please visit the Firebase Console (Build > Firestore Database) and create the database.";
    } else if (errorDetails.includes("NOT_FOUND") || error?.code === 5) {
      errorMessage =
        "Firestore database does not exist or has not been initialized yet in the Firebase Console.";
    } else if (error?.code === 7 || error?.code === "permission-denied") {
      errorMessage = "Permission denied while accessing Firestore. Check service account roles.";
    }

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

export default router;

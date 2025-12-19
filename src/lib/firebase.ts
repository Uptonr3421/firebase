/**
 * Firebase Client Configuration
 * Initialize Firebase for client-side use
 */

import { initializeApp, getApps } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bespokeethos-analytics-475007",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const functions = getFunctions(app, "us-central1");

// Export callable functions
export const callFunction = <T, R>(name: string) => {
  return httpsCallable<T, R>(functions, name);
};

// Typed function wrappers
export const functions_api = {
  marketingBrief: (data: {
    dateRange?: "today" | "yesterday" | "last7days" | "last30days";
    properties?: string[];
  }) => callFunction("marketingBrief")(data),

  competitorWatch: (data: {
    competitors?: string[];
    checkType?: "full" | "quick";
  }) => callFunction("competitorWatch")(data),

  contentDrafter: (data: {
    topic: string;
    contentType?: "blog" | "social" | "email" | "ad";
    targetKeywords?: string[];
    tone?: "professional" | "casual" | "authoritative";
    wordCount?: number;
  }) => callFunction("contentDrafter")(data),

  opportunityScanner: (data: {
    sources?: Array<"nglcc" | "events" | "news" | "linkedin">;
    industry?: string;
    minRelevanceScore?: number;
  }) => callFunction("opportunityScanner")(data),

  selfHealing: (data: {
    checkAll?: boolean;
    specificService?: string;
  }) => callFunction("selfHealing")(data),
};

export default app;

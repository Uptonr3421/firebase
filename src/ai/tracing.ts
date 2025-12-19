/**
 * OpenTelemetry Tracing Configuration for Genkit Flows
 *
 * This sets up tracing for all AI operations to enable debugging and monitoring.
 * Traces are sent to AI Toolkit (local) or Cloud Trace (production).
 */

import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

// Determine environment
const isProduction = process.env.NODE_ENV === "production";

// Configure OTLP exporter
// Local: AI Toolkit at localhost:4318
// Production: Google Cloud Trace (auto-configured via ADC)
const traceExporter = new OTLPTraceExporter({
  url: isProduction
    ? "https://cloudtrace.googleapis.com/v2/projects/bespokeethos-analytics-475007/traces:batchWrite"
    : "http://localhost:4318/v1/traces",
});

// Initialize OpenTelemetry SDK
export const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: "prometheus-ai",
    [ATTR_SERVICE_VERSION]: "1.0.0",
  }),
  traceExporter,
});

// Start the SDK
export function initTracing(): void {
  try {
    sdk.start();
    console.log("✅ Tracing initialized", {
      environment: isProduction ? "production" : "development",
      endpoint: isProduction ? "Cloud Trace" : "localhost:4318",
    });
  } catch (error) {
    console.error("❌ Failed to initialize tracing:", error);
  }
}

// Graceful shutdown
export async function shutdownTracing(): Promise<void> {
  try {
    await sdk.shutdown();
    console.log("✅ Tracing shut down gracefully");
  } catch (error) {
    console.error("❌ Error shutting down tracing:", error);
  }
}

// Auto-initialize if this module is imported
initTracing();

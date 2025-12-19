/**
 * Vector Search / Embeddings Utility
 * Uses Vertex AI text-embedding-004 for semantic search
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { ai } from '../ai/genkit';

// Collection for storing embeddings
const EMBEDDINGS_COLLECTION = 'embeddings';

export interface EmbeddingDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
  createdAt: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
}

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

/**
 * Generate embedding for text using Vertex AI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await ai.embed({
      embedder: 'vertexai/text-embedding-004',
      content: text,
    });

    // Response is an array of embeddings, get first one
    const embeddings = response as { embedding: number[] }[];
    return embeddings[0].embedding;
  } catch (error) {
    console.error('EMBEDDING_ERROR', {
      error: error instanceof Error ? error.message : String(error),
      textLength: text.length,
    });
    throw error;
  }
}

/**
 * Store document with embedding in Firestore
 */
export async function storeEmbedding(
  id: string,
  content: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const db = getFirestore();

  try {
    const embedding = await generateEmbedding(content);

    const doc: EmbeddingDocument = {
      id,
      content,
      embedding,
      metadata,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await db.collection(EMBEDDINGS_COLLECTION).doc(id).set(doc);

    console.log('EMBEDDING_STORED', { id, contentLength: content.length });
  } catch (error) {
    console.error('STORE_EMBEDDING_ERROR', {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Batch store multiple documents with embeddings
 */
export async function batchStoreEmbeddings(
  documents: Array<{ id: string; content: string; metadata?: Record<string, unknown> }>
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  // Process in batches of 5 to avoid rate limits
  for (let i = 0; i < documents.length; i += 5) {
    const batch = documents.slice(i, i + 5);

    await Promise.all(
      batch.map(async (doc) => {
        try {
          await storeEmbedding(doc.id, doc.content, doc.metadata || {});
          success++;
        } catch {
          failed++;
        }
      })
    );

    // Small delay between batches
    if (i + 5 < documents.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log('BATCH_EMBEDDINGS_COMPLETE', { success, failed, total: documents.length });
  return { success, failed };
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same dimension');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Search for similar documents using vector similarity
 * Note: For production, use Firestore Vector Search extension
 */
export async function searchSimilar(
  query: string,
  limit: number = 5,
  minScore: number = 0.7
): Promise<SearchResult[]> {
  const db = getFirestore();

  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);

    // Fetch all embeddings (for small datasets)
    // For large datasets, use Firestore Vector Search or Pinecone
    const snapshot = await db.collection(EMBEDDINGS_COLLECTION).get();

    const results: SearchResult[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as EmbeddingDocument;
      const score = cosineSimilarity(queryEmbedding, data.embedding);

      if (score >= minScore) {
        results.push({
          id: data.id,
          content: data.content,
          score,
          metadata: data.metadata,
        });
      }
    });

    // Sort by score descending and limit
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  } catch (error) {
    console.error('SEARCH_ERROR', {
      error: error instanceof Error ? error.message : String(error),
      queryLength: query.length,
    });
    throw error;
  }
}

/**
 * Delete embedding by ID
 */
export async function deleteEmbedding(id: string): Promise<void> {
  const db = getFirestore();
  await db.collection(EMBEDDINGS_COLLECTION).doc(id).delete();
  console.log('EMBEDDING_DELETED', { id });
}

/**
 * Get embedding document by ID
 */
export async function getEmbedding(id: string): Promise<EmbeddingDocument | null> {
  const db = getFirestore();
  const doc = await db.collection(EMBEDDINGS_COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as EmbeddingDocument;
}

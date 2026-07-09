import { collectionsQuerySchema } from "../validators/collection.schema";
import { getCollectionsResponse } from "../services/collectionService";

export function processCollectionsQuery(query: unknown) {
  const parsed = collectionsQuerySchema.safeParse(query);

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid collections query.",
      errors: parsed.error.flatten(),
    };
  }

  return getCollectionsResponse(parsed.data);
}


import { z } from 'zod';
import { medicines, insertMedicineSchema, analysisRequestSchema } from './schema';
export { analysisRequestSchema };

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  medicines: {
    list: {
      method: 'GET' as const,
      path: '/api/medicines',
      responses: {
        200: z.array(z.custom<typeof medicines.$inferSelect>()),
      },
    },
    search: {
      method: 'GET' as const,
      path: '/api/medicines/search',
      input: z.object({ q: z.string() }),
      responses: {
        200: z.array(z.custom<typeof medicines.$inferSelect>()),
      },
    }
  },
  analysis: {
    analyze: {
      method: 'POST' as const,
      path: '/api/analyze',
      input: analysisRequestSchema,
      responses: {
        200: z.custom<{ results: any[], disclaimer: string }>(),
        400: errorSchemas.validation,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

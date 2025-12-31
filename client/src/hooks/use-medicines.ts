import { useMutation, useQuery } from "@tanstack/react-query";
import { api, type analysisRequestSchema } from "@shared/routes";
import { z } from "zod";

type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
// Define the response type based on the route definition
type AnalysisResponse = {
  results: Array<{
    original: string;
    found: boolean;
    ingredients: string[];
    generics: Array<{
      id: number;
      name: string;
      type: "branded" | "generic";
      price: number;
      ingredients: string[];
      manufacturer: string;
      description: string | null;
    }>;
    savings: number;
    warnings: string[];
  }>;
  disclaimer: string;
};

export function useMedicines() {
  return useQuery({
    queryKey: [api.medicines.list.path],
    queryFn: async () => {
      const res = await fetch(api.medicines.list.path);
      if (!res.ok) throw new Error("Failed to fetch medicines");
      return api.medicines.list.responses[200].parse(await res.json());
    },
  });
}

export function useSearchMedicines(query: string) {
  return useQuery({
    queryKey: [api.medicines.search.path, query],
    enabled: query.length > 0,
    queryFn: async () => {
      // Manually constructing query param here as buildUrl handles path params better
      const url = `${api.medicines.search.path}?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to search medicines");
      return api.medicines.search.responses[200].parse(await res.json());
    },
  });
}

export function useAnalyzePrescriptions() {
  return useMutation({
    mutationFn: async (data: AnalysisRequest) => {
      const validated = api.analysis.analyze.input.parse(data);
      const res = await fetch('http://localhost:5001/api/analyze', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.analysis.analyze.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Analysis failed");
      }

      // We manually cast the response here because Zod validation of deep nested objects 
      // can be strict and error-prone if backend sends slight variations. 
      // The shared type is `z.custom<{ results: any[], disclaimer: string }>()`
      return (await res.json()) as AnalysisResponse;
    },
  });
}

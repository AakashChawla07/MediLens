import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seeding Logic
  const seedMedicines = async () => {
    try {
      const existing = await storage.searchMedicines("");
      if (existing.length === 0) {
        console.log("Seeding medicines...");
        const seeds = [
          { name: "Panadol", type: "branded", price: 5000, ingredients: ["Paracetamol"], manufacturer: "GSK", description: "Pain reliever" },
          { name: "Panamax", type: "generic", price: 2000, ingredients: ["Paracetamol"], manufacturer: "Sanofi", description: "Pain reliever" },
          { name: "Nurofen", type: "branded", price: 7000, ingredients: ["Ibuprofen"], manufacturer: "Reckitt", description: "Anti-inflammatory" },
          { name: "Advil", type: "branded", price: 8000, ingredients: ["Ibuprofen"], manufacturer: "Pfizer", description: "Anti-inflammatory" },
          { name: "Generic Ibuprofen", type: "generic", price: 3000, ingredients: ["Ibuprofen"], manufacturer: "Generic Corp", description: "Anti-inflammatory" },
          { name: "Amoxil", type: "branded", price: 15000, ingredients: ["Amoxicillin"], manufacturer: "Aspen", description: "Antibiotic" },
          { name: "Amoxicillin Sandoz", type: "generic", price: 6000, ingredients: ["Amoxicillin"], manufacturer: "Sandoz", description: "Antibiotic" },
          { name: "Lipitor", type: "branded", price: 30000, ingredients: ["Atorvastatin"], manufacturer: "Pfizer", description: "Cholesterol" },
          { name: "Atorvastatin Generic", type: "generic", price: 10000, ingredients: ["Atorvastatin"], manufacturer: "Generic Corp", description: "Cholesterol" },
        ];
        for (const seed of seeds) {
          // @ts-ignore
          await storage.createMedicine(seed);
        }
        console.log("Seeding complete.");
      }
    } catch (e) {
      console.error("Seeding failed:", e);
    }
  };
  
  // Call seeding
  seedMedicines();

  app.get(api.medicines.list.path, async (req, res) => {
    const medicines = await storage.searchMedicines("");
    res.json(medicines);
  });

  app.get(api.medicines.search.path, async (req, res) => {
    const query = req.query.q as string || "";
    const results = await storage.searchMedicines(query);
    res.json(results);
  });

  app.post(api.analysis.analyze.path, async (req, res) => {
    try {
      const input = api.analysis.analyze.input.parse(req.body);
      const results = [];

      for (const medName of input.prescriptions) {
        if (!medName.trim()) continue;
        const medicine = await storage.getMedicineByName(medName.trim());
        
        if (!medicine) {
          results.push({
            original: medName,
            found: false,
            ingredients: [],
            generics: [],
            savings: 0,
            warnings: []
          });
          continue;
        }

        const ingredients = medicine.ingredients;
        const warnings = [];
        // Check allergies
        for (const allergy of input.allergies) {
          if (!allergy.trim()) continue;
          for (const ing of ingredients) {
             if (ing.toLowerCase().includes(allergy.toLowerCase()) || allergy.toLowerCase().includes(ing.toLowerCase())) {
               warnings.push(`Contains ${ing} which conflicts with allergy ${allergy}`);
             }
          }
        }

        // Find generics
        const allGenerics = await storage.getGenericsForIngredients(ingredients);
        const alternatives = allGenerics.filter(m => m.id !== medicine.id && m.type === 'generic' && m.price < medicine.price);
        
        // Calculate max savings
        let maxSavings = 0;
        if (medicine.type === 'branded' && alternatives.length > 0) {
           const cheapest = alternatives.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
           maxSavings = (medicine.price - cheapest.price) / 100;
        }

        results.push({
          original: medicine.name,
          found: true,
          ingredients: ingredients,
          generics: alternatives,
          savings: maxSavings,
          warnings: warnings
        });
      }

      res.json({
        results,
        disclaimer: "This platform does not provide medical advice. Consult a doctor before changing prescriptions."
      });

    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input" });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  return httpServer;
}

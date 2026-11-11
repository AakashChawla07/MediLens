import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, IndianRupee, Pill, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

// Define local types matching the API response structure
interface Medicine {
  id: number;
  name: string;
  type: "branded" | "generic";
  price: number;
  ingredients: string[];
  manufacturer: string;
  description: string | null;
}

interface ResultProps {
  original: string;
  found: boolean;
  price: number | null;
  ingredients: string[];
  generics: Medicine[];
  savings: number;
  warnings: string[];
  index: number;
}

// Prices from the API are in rupees, e.g. 1200 -> "1,200" and 4.5 -> "4.50"
export function formatRupees(amount: number) {
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function AnalysisResultCard({ 
  original, 
  found, 
  price,
  ingredients, 
  generics, 
  savings, 
  warnings,
  index 
}: ResultProps) {
  const hasSavings = savings > 0;
  const hasWarnings = warnings.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className={`overflow-hidden border-l-4 ${hasWarnings ? 'border-l-destructive' : 'border-l-primary'} shadow-lg hover:shadow-xl transition-all duration-300`}>
        <div className="p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold font-display text-foreground">{original}</h3>
                {!found && (
                  <Badge variant="outline" className="text-muted-foreground bg-muted/50">
                    Not Found
                  </Badge>
                )}
                {found && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    Prescribed
                  </Badge>
                )}
              </div>
              
              {found && typeof price === "number" && (
                <p className="text-sm text-muted-foreground">
                  Brand price: <span className="font-semibold text-foreground">₹{formatRupees(price)}</span>
                </p>
              )}

              {found && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1 py-1">Active Ingredients:</span>
                  {ingredients.map((ing) => (
                    <Badge key={ing} variant="outline" className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      {ing}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {hasSavings && (
              <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl border border-green-100 dark:border-green-800/50">
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full text-green-700 dark:text-green-300">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">Potential Savings</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">
                    ₹{formatRupees(savings)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Warnings Section */}
          {hasWarnings && (
            <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-destructive mb-1">Allergy Warning</h4>
                <ul className="list-disc list-inside text-sm text-destructive/90">
                  {warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Alternatives Section */}
          {found && generics.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Generic Alternatives
              </h4>
              <div className="grid gap-3">
                {generics.map((med) => (
                  <div 
                    key={med.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {med.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{med.manufacturer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">₹{formatRupees(med.price)}</p>
                      {typeof price === "number" && (
                        <p className="text-xs font-medium text-green-700 dark:text-green-400 whitespace-nowrap">
                          Save ₹{formatRupees(price - med.price)} ({Math.round(((price - med.price) / price) * 100)}%)
                        </p>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                             <Info className="w-3 h-3 text-muted-foreground/50 hover:text-primary transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Generic price estimate</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {found && generics.length === 0 && (
            <div className="mt-6 pt-6 border-t border-border/50 text-center py-4">
              <p className="text-muted-foreground text-sm">No cheaper generic alternatives found for this medication.</p>
            </div>
          )}

          {!found && (
            <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-border/50 text-center">
              <p className="text-muted-foreground text-sm">
                We couldn't find detailed data for "{original}". Check the spelling or try searching for the active ingredient directly.
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

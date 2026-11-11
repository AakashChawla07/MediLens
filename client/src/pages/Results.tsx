import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { AnalysisResultCard, formatRupees } from "@/components/AnalysisResultCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Reuse local types
interface Medicine {
  id: number;
  name: string;
  type: "branded" | "generic";
  price: number;
  ingredients: string[];
  manufacturer: string;
  description: string | null;
}

interface AnalysisResult {
  original: string;
  found: boolean;
  price: number | null;
  ingredients: string[];
  generics: Medicine[];
  savings: number;
  warnings: string[];
}

interface AnalysisData {
  results: AnalysisResult[];
  disclaimer: string;
}

export default function Results() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    const stored = sessionStorage.getItem('analysisResults');
    if (!stored) {
      setLocation('/');
      return;
    }
    try {
      setData(JSON.parse(stored));
    } catch (e) {
      setLocation('/');
    }
  }, [setLocation]);

  if (!data) return null;

  const totalSavings = data.results.reduce((acc, curr) => acc + curr.savings, 0);
  const totalWarnings = data.results.reduce((acc, curr) => acc + curr.warnings.length, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        
        {/* Navigation & Summary Header */}
        <div className="mb-10">
          <Link href="/">
            <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Analyze New Prescriptions
            </Button>
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">Analysis Results</h1>
              <p className="text-muted-foreground">
                We analyzed {data.results.length} medicine{data.results.length !== 1 ? 's' : ''} against our database.
              </p>
            </div>

            {totalSavings > 0 && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg shadow-green-500/20"
              >
                <p className="text-green-50 text-xs font-medium uppercase tracking-wider mb-1">Total Potential Savings</p>
                <p className="text-3xl font-bold">₹{formatRupees(totalSavings)}</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Global Warnings Alert */}
        {totalWarnings > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8"
          >
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg font-bold ml-2">Interaction Warnings Detected</AlertTitle>
              <AlertDescription className="ml-2 mt-1 text-destructive/90">
                We found {totalWarnings} potential issue{totalWarnings !== 1 ? 's' : ''} based on your allergy profile. Please review the highlighted items below carefully.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Results List */}
        <div className="space-y-8">
          {data.results.map((result, idx) => (
            <AnalysisResultCard 
              key={idx}
              index={idx}
              {...result}
            />
          ))}
        </div>

        {/* Disclaimer Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 p-6 bg-muted/30 border border-border/50 rounded-xl"
        >
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-bold text-foreground">Important Medical Disclaimer</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {data.disclaimer}
              </p>
              <p className="text-xs text-muted-foreground/80 mt-2">
                Prices shown are estimates and may vary by pharmacy and location. Always verify generic substitutions with your pharmacist or prescribing doctor.
              </p>
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}

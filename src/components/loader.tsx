
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

const steps = [
  "Analyzing search queries...",
  "Evaluating brand visibility...",
  "Identifying content gaps...",
  "Compiling recommendations...",
  "Finalizing analysis report...",
];

export function Loader() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    // This effect ensures all steps turn green before the parent component moves on.
    const timers = steps.map((_, index) => 
      setTimeout(() => {
        setCompletedSteps(prev => [...prev, index]);
      }, (index + 1) * 1200) // Stagger the checkmarks a bit more slowly
    );

    return () => timers.forEach(clearTimeout);
  }, []);
  
  return (
    <Card className="text-center max-w-2xl mx-auto shadow-2xl shadow-primary/5 border-2 border-primary/10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Analyzing Your Brand...</CardTitle>
        <CardDescription className="text-base">Please wait while our AI detective scans the web for your brand's presence.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8">
            <div className="relative w-40 h-40">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin-slow" style={{ animationDuration: '3s', clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}></div>
                <div className="absolute inset-2 border-4 border-secondary/30 rounded-full animate-spin-slow" style={{ animationDuration: '5s', animationDirection: 'reverse' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex flex-col items-start gap-4 py-8 max-w-md mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-4 w-full transition-all duration-300">
              <div className="flex-shrink-0">
                {completedSteps.includes(index) ? (
                  <CheckCircle className="h-7 w-7 text-green-500" />
                ) : (
                  <div className="h-7 w-7 rounded-full border-2 border-primary animate-spin"></div>
                )}
              </div>
              <p className={`text-left text-lg ${completedSteps.includes(index) ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {step}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Add keyframes for custom animation if not already in globals.css
// You might need to add this to your globals.css or use a style tag
// @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }


"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BrandForm, type BrandFormValues } from '@/components/brand-form';
import { QueriesForm } from '@/components/queries-form';
import { AnalysisResults, type AnalysisResultData } from '@/components/analysis-results';
import { Loader } from '@/components/loader';
import { Stepper } from '@/components/stepper';
import { Button } from '@/components/ui/button';

type Step = 'initial' | 'queries_generated' | 'analyzing' | 'results_displayed';

export default function Home() {
  const [step, setStep] = useState<Step>('initial');
  const [brandInfo, setBrandInfo] = useState<(BrandFormValues & { docId: string }) | null>(null);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResultData | null>(null);
  const [currentStepNumber, setCurrentStepNumber] = useState(1);

  const handleBrandFormSubmit = (info: BrandFormValues & { docId: string }, queries: string[]) => {
    setBrandInfo(info);
    setSearchQueries(queries);
    setStep('queries_generated');
    setCurrentStepNumber(2);
  };

  const handleQueriesFormSubmit = (results: AnalysisResultData) => {
    setAnalysisResults(results);
    setStep('results_displayed');
    setCurrentStepNumber(4);
  };

  const handleAnalysisStart = () => {
    setStep('analyzing');
    setCurrentStepNumber(3);
  };
  
  const handleAnalysisError = () => {
      setStep('queries_generated');
      setCurrentStepNumber(2);
  }

  const handleReset = (repopulate = false) => {
    if (!repopulate) {
      setBrandInfo(null);
    }
    setStep('initial');
    setSearchQueries([]);
    setAnalysisResults(null);
    setCurrentStepNumber(1);
  };

  const renderStep = () => {
    switch(step) {
      case 'initial':
        return <BrandForm initialData={brandInfo} onSubmitSuccess={handleBrandFormSubmit} />;
      case 'queries_generated':
        if (!brandInfo) {
          handleReset();
          return null;
        }
        return <QueriesForm
            initialQueries={searchQueries}
            brandInfo={brandInfo}
            onAnalysisStart={handleAnalysisStart}
            onAnalysisComplete={handleQueriesFormSubmit}
            onAnalysisError={handleAnalysisError}
          />;
      case 'analyzing':
        return <Loader />;
      case 'results_displayed':
        return <AnalysisResults 
                  results={analysisResults} 
                  onReset={handleReset} 
                  currentStep={currentStepNumber} 
                />;
      default:
        return <BrandForm initialData={brandInfo} onSubmitSuccess={handleBrandFormSubmit} />;
    }
  }
  
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background text-foreground">
      <nav className="w-full bg-card border-b border-border/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                  <div className="flex items-center gap-3">
                      <Image
                          src="https://getclevrr.com/wp-content/uploads/2025/06/01.1-Transparent-BG-Color_Black.png"
                          alt="Clevrr AI Logo"
                          width={80}
                          height={60}
                          className="rounded-md"
                      />
                      <h1 className="text-xl sm:text-2xl font-bold">
                          <span className="text-primary">|</span> Search Detective
                      </h1>
                  </div>
                  <Link href="https://getclevrr.com?utm_source=search_detective&utm_medium=app&utm_campaign=learn_more" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">Learn More</Button>
                  </Link>
              </div>
          </div>
      </nav>

      <div className="w-full max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col items-center justify-center space-y-6">
            <Stepper steps={["Brand Info", "Search Queries", "Analysis", "Results"]} currentStep={currentStepNumber} />
        </header>

        <div className="w-full">
          {renderStep()}
        </div>
      </div>
    </main>
  );
}

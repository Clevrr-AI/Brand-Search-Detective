
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BrandForm, type BrandFormValues } from '@/components/brand-form';
import { QueriesForm, type QueriesFormValues } from '@/components/queries-form';
import { AnalysisResultsDynamic } from '@/components/analysis-results-dynamic';
import { OtpDialog } from '@/components/otp-dialog';
import { Stepper } from '@/components/stepper';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

type Step = 'initial' | 'queries_generated' | 'results_displayed';

export default function Home() {
  const [step, setStep] = useState<Step>('initial');
  const [brandInfo, setBrandInfo] = useState<BrandFormValues | null>(null);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [docId, setDocId] = useState<string | null>(null);
  const [currentStepNumber, setCurrentStepNumber] = useState(1);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [queriesForAnalysis, setQueriesForAnalysis] = useState<string[]>([]);

  const handleBrandFormSubmit = (info: BrandFormValues, queries: string[], doc_id: string) => {
    setBrandInfo(info);
    setSearchQueries(queries);
    setDocId(doc_id);
    setStep('queries_generated');
    setCurrentStepNumber(2);
  };

  const handleQueriesFormSubmit = (values: QueriesFormValues) => {
    setQueriesForAnalysis(values.queries);
    setIsOtpDialogOpen(true);
  };
  
  const handleOtpSuccess = () => {
    setIsOtpDialogOpen(false);
    setStep('results_displayed');
    setCurrentStepNumber(3);
  };

  const handleReset = (repopulate = false) => {
    setStep('initial');
    if (!repopulate) {
      setBrandInfo(null);
      setDocId(null);
    }
    setSearchQueries([]);
    setQueriesForAnalysis([]);
    setCurrentStepNumber(1);
  };

  const renderStep = () => {
    switch(step) {
      case 'initial':
        return <BrandForm initialData={brandInfo} onSubmitSuccess={handleBrandFormSubmit} />;
      case 'queries_generated':
        return <QueriesForm
            initialQueries={searchQueries}
            onSubmit={handleQueriesFormSubmit}
          />;
      case 'results_displayed':
        return <AnalysisResultsDynamic 
                  brandInfo={brandInfo!}
                  queries={queriesForAnalysis}
                  docId={docId!}
                  onReset={handleReset} 
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
                      <Link href="https://getclevrr.com?utm-source=header&utm-medium=search-detective&utm-campaign=search-detective" className="flex items-center gap-3">
                        <Image
                            src="https://getclevrr.com/wp-content/uploads/2025/06/01.1-Transparent-BG-Color_Black.png"
                            alt="Clevrr AI Logo"
                            width={80}
                            height={60}
                            className="rounded-md"
                        />
                      </Link>
                      <h1 className="text-xl sm:text-2xl font-bold">
                          <span className="text-primary font-light">|</span> Search Detective
                      </h1>
                  </div>
                  <Link href="https://getclevrr.com?utm_source=search_detective&utm_medium=app&utm_campaign=learn_more" target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition-opacity">
                      <Sparkles className="mr-2 h-5 w-5" />What's Clevrr AI?
                    </Button>
                  </Link>
              </div>
          </div>
      </nav>

      <div className="w-full max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8 flex-1 flex flex-col">
        <header className="flex flex-col items-center justify-center space-y-12">
            <Stepper steps={["Brand Info", "Search Queries", "Results"]} currentStep={currentStepNumber} />
        </header>

        <div className="w-full flex-1 flex items-start justify-center">
          {renderStep()}
        </div>
      </div>
      {brandInfo && docId &&
        <OtpDialog
            isOpen={isOtpDialogOpen}
            onClose={() => setIsOtpDialogOpen(false)}
            onOtpSuccess={handleOtpSuccess}
            brandInfo={brandInfo}
            queries={queriesForAnalysis}
            docId={docId}
        />
      }
    </main>
  );
}


"use client";

import { useEffect, useState } from "react";
import React from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AnalysisResults, type AnalysisResultData } from "@/components/analysis-results";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from 'lucide-react';
import Image from "next/image";

export default function ReportPage({ params }: { params: Promise<{ docId: string }> }) {
    const { docId } = React.use(params);
    const [reportData, setReportData] = useState<AnalysisResultData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!docId) {
            setLoading(false);
            setError("No report ID provided.");
            return;
        }

        async function fetchReport() {
            try {
                const docRef = doc(db, "reports", docId);
                const snapshot = await getDoc(docRef);

                if (snapshot.exists()) {
                    setReportData(snapshot.data() as AnalysisResultData);
                } else {
                    setError("Report not found.");
                    setReportData(null);
                }
            } catch (err) {
                console.error("Error fetching report:", err);
                setError("Failed to fetch report.");
                setReportData(null);
            } finally {
                setLoading(false);
            }
        }

        fetchReport();
    }, [docId]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading report...</p>
                </div>
            );
        }

        if (error) {
            return (
                 <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    <p className="text-xl font-semibold text-destructive">{error}</p>
                     <Button asChild>
                        <Link href="/">Go Back Home</Link>
                    </Button>
                </div>
            );
        }

        if (!reportData) {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    <p className="text-xl font-semibold">Report not found.</p>
                     <Button asChild>
                        <Link href="/">Go Back Home</Link>
                    </Button>
                </div>
            );
        }

        return <AnalysisResults results={reportData} docId={docId} />;
    };

    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-background text-foreground">
            <nav className="w-full bg-card border-b border-border/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link href="https://getclevrr.com?utm-source=header&utm-medium=search-detective&utm-campaign=search-detective" className="flex items-center gap-3">
                            <Image
                                src="https://getclevrr.com/wp-content/uploads/2025/06/01.1-Transparent-BG-Color_Black.png"
                                alt="Clevrr AI Logo"
                                width={80}
                                height={60}
                                className="rounded-md"
                            />
                        </Link>
                        <Link href="/" className="flex items-center gap-3">
                            <h1 className="text-xl sm:text-2xl font-bold">
                                <span className="text-primary font-light">|</span> Search Detective
                            </h1>
                        </Link>
                        <Link href="https://getclevrr.com?utm_source=search_detective&utm_medium=app&utm_campaign=learn_more" target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition-opacity">
                            <Sparkles className="mr-2 h-5 w-5" />What's Clevrr AI?
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="w-full max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8 flex-1 flex flex-col">
               {renderContent()}
            </div>
        </main>
    );
}

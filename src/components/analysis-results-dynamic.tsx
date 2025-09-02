
"use client";

import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { analyzeBrand, generateRecommendations } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { BrandFormValues } from './brand-form';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, BarChart, Target, TrendingUp, Check, Lightbulb, BrainCircuit, MessageSquareQuote, Medal, Search, FileText, Hash, Eye, ListChecks, Repeat, ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import ReactMarkdown from 'react-markdown';
import { ShareButton } from './share-button';


export interface AnalysisItem {
    ai_answer: string;
    is_full_match: boolean;
    is_partial_match: boolean;
    is_visible: boolean;
    mentions: number;
    num_partial_mentions: number;
    partial_match_keyword: string;
    query: string;
    rank: number;
    recommendations: string[];
    sources: string[];
}

interface AnalysisResultsDynamicProps {
    brandInfo: BrandFormValues;
    queries: string[];
    docId: string;
    onReset: (repopulate?: boolean) => void;
}

const MetricCard = ({ icon: Icon, title, value, colorClass, isLoading }: { icon: React.ElementType, title: string, value: string | number, colorClass: string, isLoading?: boolean }) => (
    <Card className="flex-1 min-w-[200px] bg-card shadow-lg border-l-4" style={{ borderColor: `hsl(var(${colorClass}))` }}>
        <CardContent className="p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-muted`}>
                <Icon className={`h-6 w-6 text-primary`} />
            </div>
            <div>
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <p className="text-2xl font-bold">{value}</p>}
                <p className="text-sm text-muted-foreground">{title}</p>
            </div>
        </CardContent>
    </Card>
);

const DetailItem = ({ icon: Icon, label, value, valueClass }: { icon: React.ElementType, label: string, value: React.ReactNode, valueClass?: string }) => (
    <div className="flex items-start gap-3 rounded-lg p-3 bg-muted/50">
        <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
        <div className="flex-1">
            <p className="font-semibold text-foreground/80">{label}</p>
            <div className={cn("text-base font-bold text-foreground", valueClass)}>{value}</div>
        </div>
    </div>
);

const QueryAnalysisDetail = ({ result, domain, index, docId, onRecommendationsUpdate, }: {
    result: AnalysisItem; domain: string; index: number; docId: string; onRecommendationsUpdate: (
        queryIndex: number,
        newRecommendations: string[]
    ) => void;
}) => {
    const [isAnswerExpanded, setIsAnswerExpanded] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const answerLines = result.ai_answer.split('\n');
    const showExpandButton = answerLines.length > 4;

    const domainToMatch = domain.replace(/^https?:\/\//, '');

    const handleGenerateRecs = async () => {
        setIsGenerating(true);
        const res = await generateRecommendations(docId, index);
        setIsGenerating(false);

        if (res.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: res.error,
            });
        } else if (res.data?.recommendations) {
            toast({
                title: "Success!",
                description: "New recommendations generated.",
            });
            onRecommendationsUpdate(index, res.data.recommendations);
        }
    };

    return (
        <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailItem
                    icon={Eye}
                    label="Brand Visible"
                    value={result.is_visible ? <Badge className="bg-green-100 text-green-800 border-green-300">Yes</Badge> : <Badge variant="destructive">No</Badge>}
                />
                <DetailItem
                    icon={CheckCircle2}
                    label="Full Match"
                    value={result.is_full_match ? <Badge className="bg-green-100 text-green-800 border-green-300">Yes</Badge> : <Badge variant="destructive">No</Badge>}
                />
                <DetailItem
                    icon={CheckCircle2}
                    label="Partial Match"
                    value={result.is_partial_match ? <Badge className="bg-green-100 text-green-800 border-green-300">Yes</Badge> : <Badge variant="destructive">No</Badge>}
                />
                <DetailItem
                    icon={Medal}
                    label="Rank"
                    value={result.rank > 0 ? `#${result.rank}` : 'N/A'}
                />
                <DetailItem
                    icon={MessageSquareQuote}
                    label="Brand Mentions"
                    value={result.mentions}
                />
                <DetailItem
                    icon={Hash}
                    label="Partial Mentions"
                    value={result.num_partial_mentions}
                />
                <DetailItem
                    icon={Search}
                    label="Partial Match Keyword"
                    value={result.partial_match_keyword || 'N/A'}
                />
            </div>

            <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <BrainCircuit className="h-6 w-6" />
                    AI Generated Answer
                </h4>
                <div className="prose prose-sm max-w-none text-muted-foreground bg-accent/50 p-4 rounded-lg border border-primary/20">
                    <ReactMarkdown>
                        {isAnswerExpanded ? result.ai_answer : answerLines.slice(0, 4).join('\n')}
                    </ReactMarkdown>
                </div>
                {showExpandButton && (
                    <Button variant="link" onClick={() => setIsAnswerExpanded(!isAnswerExpanded)} className="text-primary p-0 h-auto">
                        {isAnswerExpanded ? "Show Less" : "Show More"}
                        {isAnswerExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                    </Button>
                )}
            </div>

            {result.recommendations && result.recommendations.length > 0 ? (
                <div className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2 text-primary"><ListChecks className="h-6 w-6" /> Recommendations to Improve Ranking</h4>
                    <ul className="space-y-2 pl-6">
                        {result.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-base text-muted-foreground">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground mb-4">No recommendations available for this query.</p>
                    <Button onClick={handleGenerateRecs} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate Recommendations
                    </Button>
                </div>
            )}

            {result.sources.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2 text-primary"><FileText className="h-6 w-6" /> Information Sources</h4>
                    <div className="flex flex-wrap gap-2">
                        {result.sources.slice(0, 15).map((source, i) => (
                            <a
                                href={`https://${source}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                key={i}
                                className={cn(
                                    "text-sm bg-muted text-muted-foreground px-3 py-1 rounded-full hover:bg-primary hover:text-primary-foreground flex items-center gap-1 transition-colors",
                                    source.includes(domainToMatch) && "bg-primary/80 text-primary-foreground border-2 border-primary-foreground ring-2 ring-primary"
                                )}
                            >
                                {source}
                            </a>
                        ))}
                        {result.sources.length > 15 && <span className="text-sm text-muted-foreground self-center">...and {result.sources.length - 15} more</span>}
                    </div>
                </div>
            )}
        </div>
    );
};


export function AnalysisResultsDynamic({ brandInfo, queries, docId, onReset }: AnalysisResultsDynamicProps) {
    const [results, setResults] = useState<AnalysisItem[]>([]);
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [summary, setSummary] = useState<{
        ai_visibility: string;
        average_rank: number;
        visibility_score: number;
        totalRecommendations: number;
    } | null>(null);

    const { toast } = useToast();

    useEffect(() => {
        const initialLoadingStates: Record<string, boolean> = {};
        queries.forEach(q => initialLoadingStates[q] = true);
        setLoadingStates(initialLoadingStates);

        const analyzeAll = async () => {
            const analysisPromises = queries.map((query, index) =>
                analyzeBrand({
                    doc_id: docId,
                    query: query,
                    brandName: brandInfo.brandName,
                    brandWebsite: brandInfo.brandWebsite,
                    keywords: [brandInfo.keywords],
                    num_query: index + 1,
                    total_queries: queries.length,
                }).then(res => ({ query, res }))
            );

            for (const promise of analysisPromises) {
                const { query, res } = await promise;
                if (res.error) {
                    toast({
                        variant: "destructive",
                        title: `Analysis Failed for "${query}"`,
                        description: res.error,
                    });
                } else if (res.data) {
                    setResults(prev => [...prev, res.data]);
                }
                setLoadingStates(prev => ({ ...prev, [query]: false }));
            }
        };

        analyzeAll();
    }, [brandInfo, queries, docId, toast]);

    useEffect(() => {
        if (results.length > 0 && results.length === queries.length) {
            const visibleCount = results.filter(r => r.is_visible).length;
            const valid_ranks = results.map(r => r.rank).filter(r => r > 0);
            const averageRank = valid_ranks.length > 0 ? valid_ranks.reduce((a, b) => a + b, 0) / valid_ranks.length : 0;
            const visibilityScore = (visibleCount / queries.length) * 100;
            const totalRecommendations = results.reduce((acc, item) => acc + (item.recommendations?.length || 0), 0);

            setSummary({
                ai_visibility: `${visibleCount}/${queries.length}`,
                average_rank: averageRank,
                visibility_score: visibilityScore,
                totalRecommendations: totalRecommendations,
            });
        }
    }, [results, queries.length]);

    const handleRecommendationsUpdate = (queryIndex: number, newRecommendations: string[]) => {
        setResults(prevResults => {
            return prevResults.map((item, i) => {
                if (i === queryIndex) {
                    return { ...item, recommendations: newRecommendations };
                }
                return item;
            });
        });
    };

    const isAnalysisComplete = results.length === queries.length;

    return (
        <div className="w-full space-y-12">
            <header className="text-center space-y-2">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Brand Visibility Analysis Dynamic</h2>
                <p className="text-muted-foreground text-xl">
                    Here's how <span className="font-bold text-primary">{brandInfo.brandName}</span> performs in AI search results
                </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard icon={Target} title="AI Search Visibility" value={summary?.ai_visibility ?? '...'} colorClass="--primary" isLoading={!summary} />
                <MetricCard icon={TrendingUp} title="Average Ranking Position" value={summary ? (summary.average_rank === 0 ? "N/A" : `#${summary.average_rank.toFixed(0)}`) : '...'} colorClass="--chart-2" isLoading={!summary} />
                <MetricCard icon={Check} title="Visibility Score" value={summary ? `${summary.visibility_score.toFixed(0)}%` : '...'} colorClass="--chart-4" isLoading={!summary} />
                <MetricCard icon={Lightbulb} title="Actionable Insights" value={summary?.totalRecommendations ?? '...'} colorClass="--chart-5" isLoading={!summary} />
            </div>

            <Card className="w-full shadow-2xl shadow-primary/5 border-2 border-primary/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <BarChart className="h-8 w-8 text-primary" />
                        Detailed Query Analysis
                    </CardTitle>
                    <CardDescription className="text-base">
                        Here's a breakdown of brand visibility for each search query. Results will appear as they are analyzed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" className="w-full">
                        {queries.map((query, index) => {
                            const result = results.find(r => r.query === query);
                            const isLoading = loadingStates[query];

                            return (
                                <AccordionItem value={`item-${index}`} key={index} className="border-b-2 border-primary/10 last:border-b-0">
                                    <AccordionTrigger className="text-lg hover:no-underline py-6">
                                        <div className="flex items-center gap-4 flex-1 text-left">
                                            {isLoading ? (
                                                <Loader2 className="h-6 w-6 text-primary animate-spin flex-shrink-0" />
                                            ) : result?.is_visible ? (
                                                <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                                            ) : (
                                                <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                                            )}
                                            <h3 className="font-semibold text-lg flex-1">
                                                <span className="font-normal text-muted-foreground">"{query}"</span>
                                            </h3>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="bg-accent/30 p-6 rounded-b-lg">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center p-8">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="ml-4 text-muted-foreground">Analyzing this query...</p>
                                            </div>
                                        ) : result ? (
                                            <QueryAnalysisDetail
                                                result={result}
                                                domain={brandInfo.brandWebsite}
                                                index={index}                // pass the index from map loop
                                                docId={docId}            // pass down docId from AnalysisResultsDynamicProps
                                                onRecommendationsUpdate={handleRecommendationsUpdate}
                                            />
                                        ) : (
                                            <div className="text-center p-8 text-destructive-foreground bg-destructive/80 rounded-lg">
                                                Analysis for this query failed or returned no data.
                                                <br></br>
                                                <Button
                                                    variant="destructive"
                                                    onClick={async () => {
                                                        setLoadingStates(prev => ({ ...prev, [query]: true }));
                                                        const res = await analyzeBrand({
                                                            doc_id: docId,
                                                            query: query,
                                                            brandName: brandInfo.brandName,
                                                            brandWebsite: brandInfo.brandWebsite,
                                                            keywords: [brandInfo.keywords],
                                                            num_query: index + 1,
                                                            total_queries: queries.length,
                                                        });
                                                        setLoadingStates(prev => ({ ...prev, [query]: false }));
                                                        if (res.error) {
                                                            toast({
                                                                variant: "destructive",
                                                                title: `Analysis Failed for "${query}"`,
                                                                description: res.error,
                                                            });
                                                        } else if (res.data) {
                                                            setResults(prev => {
                                                                // Replace or add the result for this query
                                                                const filtered = prev.filter(r => r.query !== query);
                                                                return [...filtered, res.data];
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <Repeat className="mr-2 h-5 w-5" />
                                                    Retry Analysis
                                                </Button>
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </CardContent>
            </Card>

            <div className="text-center space-y-4">
                 {isAnalysisComplete && <ShareButton docId={docId} />}
                <Button onClick={() => onReset(true)} size="lg" variant="outline" className="text-lg font-semibold">
                    <Repeat className="mr-2 h-5 w-5" />
                    Analyze Another Brand
                </Button>
            </div>

            <footer className="text-center text-sm text-muted-foreground pt-4">
                <p>Powered by Clevrr AI. Grow your brand with confidence.</p>
            </footer>
        </div>
    );
}


"use client";

import { useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { analyzePresence } from '@/app/actions';
import { queriesFormSchema } from '@/app/schemas';
import type { BrandFormValues } from './brand-form';
import type { AnalysisResultData } from './analysis-results';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, PlusCircle, Rocket } from 'lucide-react';

type QueriesFormValues = z.infer<typeof queriesFormSchema>;

interface QueriesFormProps {
  initialQueries: string[];
  brandInfo: BrandFormValues & { docId: string };
  onAnalysisStart: () => void;
  onAnalysisComplete: (results: AnalysisResultData) => void;
  onAnalysisError: () => void;
}

export function QueriesForm({ initialQueries, brandInfo, onAnalysisStart, onAnalysisComplete, onAnalysisError }: QueriesFormProps) {
  const { toast } = useToast();

  const form = useForm<QueriesFormValues>({
    resolver: zodResolver(queriesFormSchema),
    defaultValues: {
      email: "",
      queries: initialQueries.length > 0 ? initialQueries : [""]
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "queries",
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (values: QueriesFormValues) => {
    onAnalysisStart();
    startTransition(async () => {
      const result = await analyzePresence(brandInfo, values);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: result.error,
        });
        onAnalysisError();
      } else if (result.data) {
        toast({
            title: "Analysis Complete!",
            description: "Here are your brand presence results.",
        });
        onAnalysisComplete(result.data);
      }
    });
  };

  return (
    <Card className='max-w-3xl mx-auto border-2 border-primary/20 shadow-2xl shadow-primary/5'>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Confirm Your Queries</CardTitle>
        <CardDescription className="text-center text-base">
          We've generated these queries. Feel free to edit them. Your email is required to proceed.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Generated Search Queries</FormLabel>
              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`queries.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input {...field} placeholder={`Query ${index + 1}`} />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Remove Query</span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append("")}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Query
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} size="lg" className="w-full font-semibold text-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition-opacity">
              {isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Rocket className="mr-2 h-5 w-5" />
              )}
              Start Analysis
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

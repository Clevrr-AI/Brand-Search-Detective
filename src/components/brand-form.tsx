
"use client";

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateQueries } from '@/app/actions';
import { brandFormSchema } from '@/app/schemas';

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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from 'lucide-react';

export type BrandFormValues = z.infer<typeof brandFormSchema>;

interface BrandFormProps {
  initialData?: BrandFormValues | null;
  onSubmitSuccess: (values: BrandFormValues, queries: string[], doc_id: string) => void;
}

export function BrandForm({ initialData, onSubmitSuccess }: BrandFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: initialData || {
      brandName: "",
      brandWebsite: "",
      keywords: "",
    },
  });

  const onSubmit = (values: BrandFormValues) => {
    startTransition(async () => {
      const result = await generateQueries(values);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else if (result.data) {
        toast({
            title: "Success!",
            description: "We've generated some search queries for you.",
        });
        onSubmitSuccess(values, result.data.queries, result.data.doc_id);
      }
    });
  };

  return (
    <Card className='w-full max-w-3xl mx-auto border-2 border-primary/20 shadow-2xl shadow-primary/5'>
      <CardHeader>
        <CardTitle className="text-center">Tell us about your brand</CardTitle>
        <CardDescription className="text-center text-lg max-w-2xl mx-auto text-muted-foreground pt-4">
            Discover your brand's true visibility in the world of AI-powered search and gain a competitive edge with actionable insights.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="brandName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Cootle Bottles" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brandWebsite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://cootle.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords / Search Queries</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. eco-friendly water bottles, sustainable products"
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} size="lg" className="w-full font-semibold text-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition-opacity">
              {isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Generate Search Queries
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}


"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { queriesFormSchema } from '@/app/schemas';

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
import { PlusCircle, Rocket, Trash2 } from 'lucide-react';

export type QueriesFormValues = z.infer<typeof queriesFormSchema>;

interface QueriesFormProps {
  initialQueries: string[];
  onSubmit: (values: QueriesFormValues) => void;
}

export function QueriesForm({ initialQueries, onSubmit }: QueriesFormProps) {
  const form = useForm<QueriesFormValues>({
    resolver: zodResolver(queriesFormSchema),
    defaultValues: {
      queries: initialQueries.length > 0 ? initialQueries.map(q => q) : [""],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "queries",
  });

  return (
    <Card className='w-full max-w-3xl mx-auto border-2 border-primary/20 shadow-2xl shadow-primary/5'>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Confirm Your Queries</CardTitle>
        <CardDescription className="text-center text-base">
          We've generated these queries based on your input. Feel free to edit them before we start the analysis.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
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
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" className="w-full font-semibold text-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition-opacity">
                <Rocket className="mr-2 h-5 w-5" />
              Start Analysis
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

'use server';

import { z } from 'zod';
import * as schemas from './schemas';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const API_URL = "https://f66aa2f33ca1.ngrok-free.app";

export async function generateQueries(values: z.infer<typeof schemas.brandFormSchema>): Promise<{ data?: { queries: string[] }; error?: string }> {
  const validatedFields = schemas.brandFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const { brandName, brandWebsite, keywords } = validatedFields.data;
    
    // Store initial brand info in Firestore
    // const docRef = await addDoc(collection(db, "brand_info"), {
    //   name: brandName,
    //   domain: brandWebsite,
    //   keywords: keywords,
    //   createdAt: serverTimestamp()
    // });

    const response = await fetch(`${API_URL}/generate-queries`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: brandName,
            domain: brandWebsite,
            keywords: keywords,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        return { error: `API returned status ${response.status}. Please check the server logs.` };
    }

    const result = await response.json();

    if (result.response === 'success') {
      return { data: { queries: result.data } };
    } else {
      return { error: result.data || 'Failed to generate search queries.' };
    }
  } catch (e) {
    console.error(e);
    return { error: `Failed to generate search queries. Please try again. -- ${e}`};
  }
}

export async function analyzePresence(
    brandInfo: z.infer<typeof schemas.brandFormSchema> & { docId: string },
    queriesInfo: z.infer<typeof schemas.queriesFormSchema>
): Promise<{data?: any; error?: string}> {
  const validatedBrand = schemas.brandFormSchema.safeParse(brandInfo);
  const validatedQueries = schemas.queriesFormSchema.safeParse(queriesInfo);

   if (!validatedBrand.success || !validatedQueries.success) {
    return { error: 'Invalid input.' };
  }
  
  try {
    const { email, queries } = validatedQueries.data;
    const { brandName, brandWebsite, keywords } = validatedBrand.data;
    const { docId } = brandInfo;

    // Update the document with the email
    if (docId) {
      const brandDocRef = doc(db, "brand_info", docId);
      await updateDoc(brandDocRef, {
        email: email,
        updatedAt: serverTimestamp()
      });
    }

    const response = await fetch(`${API_URL}/get-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: brandName,
        domain: brandWebsite,
        keywords: keywords,
        queries: queries
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        return { error: `API returned status ${response.status}. Please check the server logs.` };
    }

    const result = await response.json();

    if (result.response === 'success') {
      // Also update the document with the analysis result
      if (docId) {
        const brandDocRef = doc(db, "brand_info", docId);
        await updateDoc(brandDocRef, {
          analysisResult: result.data,
          analysisCompletedAt: serverTimestamp()
        });
      }
      return { data: result.data };
    } else {
      return { error: result.data || 'Failed to analyze brand presence.' };
    }

  } catch (e) {
    console.error(e);
    return { error: 'Failed to analyze brand presence. Please try again.' };
  }
}
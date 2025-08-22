
'use server';

import { z } from 'zod';
import * as schemas from './schemas';

const API_URL = "https://f66aa2f33ca1.ngrok-free.app";

export async function generateQueries(values: z.infer<typeof schemas.brandFormSchema>): Promise<{ data?: { queries: string[], doc_id: string }; error?: string }> {
  const validatedFields = schemas.brandFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const { brandName, brandWebsite, keywords } = validatedFields.data;
    
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
      return { data: { queries: result.data, doc_id: result.doc_id } };
    } else {
      return { error: result.data || 'Failed to generate search queries.' };
    }
  } catch (e) {
    console.error(e);
    return { error: `Failed to generate search queries. Please try again. -- ${e}`};
  }
}

export async function sendOtp(email: string): Promise<{ success?: string; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();
    if (result.response === 'success') {
      return { success: result.message };
    }
    return { error: result.error || 'Failed to send OTP.' };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred.' };
  }
}

export async function verifyOtp(
  data: {
    email: string;
    otp: string;
    brandInfo: z.infer<typeof schemas.brandFormSchema>;
    queries: string[];
    docId: string;
  }
): Promise<{ success?: string; error?: string }> {
  const { email, otp, brandInfo, queries, docId } = data;
  const { brandName, brandWebsite, keywords } = brandInfo;
  try {
    const otpResponse = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, brand: brandName, domain: brandWebsite, keywords, queries, doc_id: docId }),
    });

    const otpResult = await otpResponse.json();

    if (otpResult.response !== 'success') {
      return { error: otpResult.error || 'Invalid OTP.' };
    }
    return { success: otpResult.message || "OTP Verified Successfully" };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to verify OTP. Please try again.' };
  }
}

export async function analyzeBrand(
  data: {
    doc_id: string;
    query: string;
    brandName: string;
    brandWebsite: string;
    keywords: string[];
  }
): Promise<{ data?: any; error?: string }> {
  try {
    const { doc_id, query, brandName, brandWebsite, keywords} = data;
    
    const analysisResponse = await fetch(`${API_URL}/get-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doc_id: doc_id,
        query: query,
        name: brandName,
        domain: brandWebsite,
        keywords: keywords
      }),
    });

    if (!analysisResponse.ok) {
        const errorText = await analysisResponse.text();
        console.error("API Error:", errorText);
        return { error: `API returned status ${analysisResponse.status}. Please check the server logs.` };
    }

    const analysisResult = await analysisResponse.json();

    if (analysisResult.response === 'success') {
      return { data: analysisResult.data };
    } else {
      return { error: analysisResult.data || 'Failed to analyze brand presence.' };
    }

  } catch (e) {
    console.error(e);
    return { error: 'Failed to analyze brand presence. Please try again.' };
  }
}

export async function generateRecommendations(query: string, domain: string): Promise<{ data?: { recommendations: string[] }; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/generate-recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, domain }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      return { error: `API returned status ${response.status}. Please check the server logs.` };
    }

    const result = await response.json();
    
    if (result.response === 'success') {
      return { data: { recommendations: result.data } };
    } else {
      return { error: result.data || 'Failed to generate recommendations.' };
    }
  } catch (e) {
    console.error(e);
    return { error: `Failed to generate recommendations. Please try again. -- ${e}`};
  }
}

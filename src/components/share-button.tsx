
"use client";

import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Share2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const XIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.74.45 3.38 1.25 4.81L2 22l5.34-1.37c1.4.75 2.97 1.17 4.57 1.17h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zM9.53 17.02c-.22 0-.44-.04-.65-.13-.57-.25-1.02-.6-1.38-1.02s-.7-1.04-.92-1.78c-.22-.75-.22-1.53-.02-2.32l.2-.77c.22-.84.6-1.58 1.1-2.2.5-.63 1.12-1.13 1.83-1.5.7-.37 1.48-.56 2.3-.56.9 0 1.74.22 2.47.65.73.44 1.33.98 1.78 1.64.45.66.72 1.4.82 2.2.04.33.04.66.04.99 0 .86-.2 1.68-.58 2.42-.38.74-.93 1.38-1.63 1.88-.7.5-1.54.8-2.47.88h-.1c-.55.03-1.09.02-1.63-.02-.54-.04-1.08-.1-1.6-.2l-1.06-.22z"/>
    </svg>
);

const LinkedInIcon = () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const MailIcon = () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);


interface ShareButtonProps {
  docId: string;
}

export function ShareButton({ docId }: ShareButtonProps) {
  const [shareUrl, setShareUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // This ensures window is defined, avoiding SSR issues.
    setShareUrl(`https://getclevrr.com/ai-brand-search/?report=${docId}&utm-source=footer&utm-medium=share`);
  }, [docId]);

  if (!shareUrl) {
    return null; // Or a loading spinner
  }

  const shareText = "I just checked my brand's AI search visibility and was shocked by the results! See how you rank before your competitors do. 👀";
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareOptions = [
    {
      name: "Copy Link",
      icon: Copy,
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        toast({ title: "Copied!", description: "Report link copied to clipboard." });
      },
    },
    {
      name: "X",
      icon: XIcon,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      name: "LinkedIn",
      icon: LinkedInIcon,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      url: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: "Email",
      icon: MailIcon,
      url: `mailto:?subject=${encodeURIComponent("Check out my brand's AI visibility score!")}&body=${encodedText}%0A%0A${encodedUrl}`,
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="lg" className="bg-gradient-to-r from-secondary to-primary/80 text-primary-foreground hover:opacity-90 transition-opacity">
          <Share2 className="mr-2 h-5 w-5" />
          Share My Report
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1">
        <div className="flex items-center gap-1">
          {shareOptions.map(({ name, icon: Icon, url, action }) =>
            url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" key={name}>
                <Button variant="outline" size="icon" aria-label={`Share on ${name}`}>
                  <Icon />
                </Button>
              </a>
            ) : (
              <Button key={name} variant="outline" size="icon" aria-label={name} onClick={action}>
                 <Icon />
              </Button>
            )
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

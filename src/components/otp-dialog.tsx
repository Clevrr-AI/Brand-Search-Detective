
"use client";

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendOtp, verifyOtp } from '@/app/actions';
import { emailSchema, otpSchema } from '@/app/schemas';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import type { BrandFormValues } from './brand-form';

const combinedSchema = emailSchema.merge(z.object({
  otp: otpSchema.shape.otp.optional()
}));
type FullFormValues = z.infer<typeof combinedSchema>;

interface OtpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOtpSuccess: () => void;
  brandInfo: BrandFormValues;
  queries: string[];
  docId: string;
}

export function OtpDialog({ isOpen, onClose, onOtpSuccess, brandInfo, queries, docId }: OtpDialogProps) {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, startOtpTransition] = useTransition();
  const [isVerifying, startVerifyTransition] = useTransition();
  const [resendTimer, setResendTimer] = useState(0);

  const { toast } = useToast();

  const form = useForm<FullFormValues>({
    resolver: zodResolver(combinedSchema),
    defaultValues: { email: '', otp: '' },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    const email = form.getValues('email');
    const emailValidation = emailSchema.safeParse({ email });
    if (!emailValidation.success) {
      form.setError('email', { type: 'manual', message: emailValidation.error.errors[0].message });
      return;
    }

    startOtpTransition(async () => {
      const result = await sendOtp(email);
      if (result.success) {
        toast({ title: 'Success', description: result.success });
        setIsOtpSent(true);
        setResendTimer(10);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    });
  };

  const handleVerifyOtp = async () => {
    const values = form.getValues();
    const validation = combinedSchema.safeParse(values);
    if (!validation.success) {
        const emailError = validation.error.errors.find(e => e.path[0] === 'email');
        const otpError = validation.error.errors.find(e => e.path[0] === 'otp');
        if (emailError) form.setError('email', { type: 'manual', message: emailError.message });
        if (otpError) form.setError('otp', { type: 'manual', message: otpError.message });
        return;
    }

    if (!values.otp) {
        form.setError('otp', { type: 'manual', message: 'OTP is required.' });
        return;
    }

    startVerifyTransition(async () => {
      const result = await verifyOtp({
        email: values.email,
        otp: values.otp!,
        brandInfo,
        queries,
        docId,
      });

      if (result.success) {
        toast({ title: 'Success!', description: result.success });
        setIsOtpVerified(true);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    });
  };

  const handleClose = () => {
    if (isSendingOtp || isVerifying) return;
    form.reset();
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setResendTimer(0);
    onClose();
  }

  const isLoading = isSendingOtp || isVerifying;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify Your Email</DialogTitle>
          <DialogDescription>
            {isOtpVerified 
              ? 'Email verified. You can now start the analysis.'
              : isOtpSent 
              ? `An OTP has been sent to ${form.getValues('email')}. Please enter it below.`
              : 'We need your email to send you the analysis results.'
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} disabled={isOtpSent || isLoading} />
                      </FormControl>
                       {!isOtpSent && (
                         <Button type="button" onClick={handleSendOtp} disabled={isSendingOtp}>
                            {isSendingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send OTP
                          </Button>
                       )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isOtpSent && !isOtpVerified && (
                <>
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OTP</FormLabel>
                        <div className="flex gap-2">
                            <FormControl>
                            <Input placeholder="123456" {...field} disabled={isVerifying}/>
                            </FormControl>
                            <Button type="button" onClick={handleVerifyOtp} disabled={isVerifying}>
                                {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify OTP
                            </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-right">
                    <Button
                      type="button"
                      variant="link"
                      className="text-primary p-0 h-auto"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp || resendTimer > 0}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </Button>
                  </div>
                </>
              )}
                
              {isOtpVerified && (
                <Button type="button" onClick={onOtpSuccess} className="w-full">
                    Start Analysis
                </Button>
              )}
            </form>
          </Form>
      </DialogContent>
    </Dialog>
  );
}

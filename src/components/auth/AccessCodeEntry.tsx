import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Terminal, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCampaign } from '@/contexts/CampaignContext';

interface AccessCodeEntryProps {
  onSuccess?: () => void;
}

export default function AccessCodeEntry({ onSuccess }: AccessCodeEntryProps) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { loginWithCode } = useCampaign();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginWithCode(code.trim());

      if (result.success) {
        toast({
          title: "Access Granted",
          description: "Welcome to the Traveller Terminal System!",
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Access Denied",
          description: result.error || "Invalid access code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-primary">
            <Terminal className="h-8 w-8" />
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-primary font-mono">
            TRAVELLER TERMINAL
          </h1>
          <p className="text-primary/60 font-mono text-sm">
            V&aacute;nagandr Mainframe Access
          </p>
        </div>

        {/* Access Code Entry */}
        <Card className="border-primary/30 bg-background/50">
          <CardHeader className="text-center">
            <CardTitle className="text-primary font-mono">
              Authentication Required
            </CardTitle>
            <CardDescription className="text-primary/60 font-mono text-sm">
              Enter your access code to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code" className="text-primary font-mono text-sm">
                  Access Code
                </Label>
                <Input
                  id="access-code"
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter access code"
                  className="font-mono bg-background/50 border-primary/30 text-primary placeholder:text-primary/40"
                  disabled={isSubmitting}
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={code.length === 0 || isSubmitting}
                className="w-full font-mono bg-primary text-background hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Access Terminal'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-primary/40 font-mono space-y-1">
          <p>Eclipse Shard Saga Campaign</p>
          <p>Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
}

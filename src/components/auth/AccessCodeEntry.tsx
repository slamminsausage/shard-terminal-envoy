import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Terminal, Lock } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';

interface AccessCodeEntryProps {
  onSuccess?: () => void;
}

export default function AccessCodeEntry({ onSuccess }: AccessCodeEntryProps) {
  const [accessCode, setAccessCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { validateAccessCode, isLoading } = usePlayer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const isValid = await validateAccessCode(accessCode.trim());
      
      if (isValid && onSuccess) {
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAccessCode = (value: string) => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Limit to 8 characters
    return cleaned.slice(0, 8);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAccessCode(e.target.value);
    setAccessCode(formatted);
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
            Vánagandr Mainframe Access
          </p>
        </div>

        {/* Access Code Entry */}
        <Card className="border-primary/30 bg-background/50">
          <CardHeader className="text-center">
            <CardTitle className="text-primary font-mono">
              Security Clearance Required
            </CardTitle>
            <CardDescription className="text-primary/60 font-mono text-sm">
              Enter your unique access code to continue
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
                  type="text"
                  value={accessCode}
                  onChange={handleInputChange}
                  placeholder="Enter 8-character code"
                  className="font-mono text-center text-lg tracking-widest uppercase bg-background/50 border-primary/30 text-primary placeholder:text-primary/40"
                  maxLength={8}
                  disabled={isLoading || isSubmitting}
                  autoComplete="off"
                  autoFocus
                />
                <p className="text-xs text-primary/40 font-mono text-center">
                  Code format: XXXXXXXX (8 characters)
                </p>
              </div>
              
              <Button
                type="submit"
                disabled={accessCode.length !== 8 || isLoading || isSubmitting}
                className="w-full font-mono bg-primary text-background hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading || isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Access System'
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
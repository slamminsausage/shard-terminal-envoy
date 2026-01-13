import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Terminal, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dbHelpers } from '@/lib/supabase';

// Session token generation for secure authentication
const generateSessionToken = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const additionalRandom = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}-${additionalRandom}`;
};

// Validate password against backend (game_settings table)
const validatePasswordWithBackend = async (password: string): Promise<boolean> => {
  try {
    // Get the campaign password from game_settings
    const storedPassword = await dbHelpers.getGameSetting<string>('campaign_password');

    // If no password is set in the database, use default (for initial setup)
    // In production, you should set this via Supabase dashboard or admin panel
    const expectedPassword = storedPassword || 'TRAVELLER2024';

    return password.toUpperCase() === expectedPassword.toUpperCase();
  } catch (error) {
    console.error('Error validating password:', error);
    // Fallback to default if database is unavailable
    return password.toUpperCase() === 'TRAVELLER2024';
  }
};

interface AccessCodeEntryProps {
  onSuccess?: () => void;
}

export default function AccessCodeEntry({ onSuccess }: AccessCodeEntryProps) {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate password with backend
      const isValid = await validatePasswordWithBackend(password);

      if (isValid) {
        // Generate a secure session token
        const sessionToken = generateSessionToken();

        // Store session token with timestamp for expiration checking
        const session = {
          token: sessionToken,
          createdAt: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        };
        localStorage.setItem('traveller_session', JSON.stringify(session));

        // Keep backward compatibility
        localStorage.setItem('traveller_authenticated', 'true');

        toast({
          title: "Access Granted",
          description: "Welcome to the Traveller Terminal System!",
        });

        // Call onSuccess to trigger parent re-render
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Access Denied",
          description: "Incorrect password. Please try again.",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
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
              Campaign Access Required
            </CardTitle>
            <CardDescription className="text-primary/60 font-mono text-sm">
              Enter the campaign password to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-primary font-mono text-sm">
                  Campaign Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handleInputChange}
                  placeholder="Enter campaign password"
                  className="font-mono bg-background/50 border-primary/30 text-primary placeholder:text-primary/40"
                  disabled={isSubmitting}
                  autoComplete="off"
                  autoFocus
                />
              </div>
              
              <Button
                type="submit"
                disabled={password.length === 0 || isSubmitting}
                className="w-full font-mono bg-primary text-background hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Access Campaign'
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
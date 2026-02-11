import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCampaign } from '@/contexts/CampaignContext';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { login } = useCampaign();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        toast({
          title: "Access Granted",
          description: "Welcome to the Traveller Terminal System!",
        });
      } else {
        toast({
          title: "Access Denied",
          description: result.error || "Invalid credentials. Please try again.",
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
    <Card className="border-primary/30 bg-background/50">
      <CardHeader className="text-center">
        <CardTitle className="text-primary font-mono">
          Authentication Required
        </CardTitle>
        <CardDescription className="text-primary/60 font-mono text-sm">
          Enter your credentials to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-username" className="text-primary font-mono text-sm">
              Username
            </Label>
            <Input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="font-mono bg-background/50 border-primary/30 text-primary placeholder:text-primary/40"
              disabled={isSubmitting}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-primary font-mono text-sm">
              Password
            </Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="font-mono bg-background/50 border-primary/30 text-primary placeholder:text-primary/40"
              disabled={isSubmitting}
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            disabled={!username.trim() || !password || isSubmitting}
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
  );
}

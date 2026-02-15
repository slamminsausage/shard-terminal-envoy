import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCampaign } from '@/contexts/CampaignContext';

export default function RegisterForm() {
  const [campaignCode, setCampaignCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [requestedRole, setRequestedRole] = useState<'gm' | 'player'>('player');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { register } = useCampaign();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaignCode.trim()) {
      toast({ title: "Error", description: "Campaign code is required.", variant: "destructive" });
      return;
    }

    if (!username.trim() || username.trim().length < 3) {
      toast({ title: "Error", description: "Username must be at least 3 characters.", variant: "destructive" });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      toast({ title: "Error", description: "Username can only contain letters, numbers, and underscores.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(campaignCode, username, password, displayName, requestedRole);

      if (result.success) {
        const roleMsg = result.role === 'gm'
          ? 'You are the Game Master!'
          : 'Welcome aboard, Traveller!';
        toast({
          title: "Registration Complete",
          description: roleMsg,
        });
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Could not create account.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "An error occurred during registration.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Card className="border-primary/30 bg-background/50">
      <CardHeader className="text-center">
        <CardTitle className="text-primary font-mono">
          Create Account
        </CardTitle>
        <CardDescription className="text-primary/60 font-mono text-sm">
          Register for terminal access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-campaign-code" className="text-primary font-mono text-sm">
              Campaign Code
            </Label>
            <Input
              id="reg-campaign-code"
              type="text"
              value={campaignCode}
              onChange={(e) => setCampaignCode(e.target.value)}
              placeholder="Enter campaign code"
              className="font-mono bg-background/50 border-primary/30 text-primary placeholder:text-primary/40"
              disabled={isSubmitting}
              autoComplete="off"
              autoFocus
            />
            <p className="text-primary/40 font-mono text-[10px]">
              Get this code from your Game Master
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-display-name" className="text-primary font-mono text-sm">
              Display Name
            </Label>
            <Input
              id="reg-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name (shown in-game)"
              className="font-mono bg-background/50 border-primary/30 text-primary placeholder:text-primary/40"
              disabled={isSubmitting}
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-username" className="text-primary font-mono text-sm">
              Username
            </Label>
            <Input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="font-mono bg-background/50 border-primary/30 text-primary placeholder:text-primary/40"
              disabled={isSubmitting}
              autoComplete="username"
            />
            <p className="text-primary/40 font-mono text-[10px]">
              Letters, numbers, and underscores only (3-20 chars)
            </p>
          </div>


          <div className="space-y-2">
            <Label htmlFor="reg-role" className="text-primary font-mono text-sm">
              Account Role
            </Label>
            <Select
              value={requestedRole}
              onValueChange={(value: 'gm' | 'player') => setRequestedRole(value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="reg-role" className="font-mono bg-background/50 border-primary/30 text-primary">
                <SelectValue placeholder="Select account role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">Player</SelectItem>
                <SelectItem value="gm">Game Master</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-primary/40 font-mono text-[10px]">
              Only one GM account can exist. If a GM already exists, choose Player.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-password" className="text-primary font-mono text-sm">
              Password
            </Label>
            <Input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
              className="font-mono bg-background/50 border-primary/30 text-primary placeholder:text-primary/40"
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-confirm-password" className="text-primary font-mono text-sm">
              Confirm Password
            </Label>
            <Input
              id="reg-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="font-mono bg-background/50 border-primary/30 text-primary placeholder:text-primary/40"
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            disabled={!campaignCode.trim() || !username.trim() || !password || !confirmPassword || isSubmitting}
            className="w-full font-mono bg-primary text-background hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

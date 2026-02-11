import React, { useState } from 'react';
import { Terminal, Lock, UserPlus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabaseDisabled } from '@/lib/supabase';
import AccessCodeEntry from './AccessCodeEntry';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Fall back to legacy access code screen when Supabase is disabled
  if (supabaseDisabled) {
    return <AccessCodeEntry />;
  }

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

        {/* Tab switcher: Login | Register */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
          <TabsList className="w-full grid grid-cols-2 bg-background/50 border border-primary/30">
            <TabsTrigger
              value="login"
              className="font-mono text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-primary/50"
            >
              <Lock className="h-3 w-3 mr-1.5" />
              LOGIN
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="font-mono text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-primary/50"
            >
              <UserPlus className="h-3 w-3 mr-1.5" />
              REGISTER
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-xs text-primary/40 font-mono space-y-1">
          <p>Eclipse Shard Saga Campaign</p>
          <p>Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
}

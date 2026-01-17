'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="relative w-full max-w-4xl overflow-hidden border-white/70 bg-white/90 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-transparent" />
        <CardContent className="relative grid gap-0 p-0 md:grid-cols-[1.1fr_1fr]">
          <div className="hidden h-full flex-col justify-between bg-primary px-8 py-10 text-primary-foreground md:flex">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-foreground/70">
                SeaMoneeCredit
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight">
                Admin command center
              </h1>
              <p className="mt-3 text-sm text-primary-foreground/80">
                Review leads, update content, and monitor daily performance from one hub.
              </p>
            </div>
            <div className="space-y-3 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-white/80" />
                Secure access to application data and settings.
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-white/80" />
                Publish new campaigns in minutes.
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-white/80" />
                Keep approvals and follow-ups organized.
              </div>
            </div>
          </div>
          <div className="bg-white/90 px-8 py-10">
            <CardHeader className="space-y-2 px-0 pb-6 text-left">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>Sign in to manage your lending pipeline.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

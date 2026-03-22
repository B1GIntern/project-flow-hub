import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LayoutDashboard, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const [loginLoading, setLoginLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (loginLoading) return;
    setLoginLoading(true);
    try {
      const success = await login(email, password);
      if (!success) setError('Invalid email or password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    setSeedLoading(true);
    setSeedMessage('');
    try {
      const url = import.meta.env.VITE_SUPABASE_URL ?? 'https://gprlkjsbxqpawcqpssgx.supabase.co';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (anonKey) headers['Authorization'] = `Bearer ${anonKey}`;
      const res = await fetch(`${url}/functions/v1/seed-database`, {
        method: 'POST',
        headers,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSeedMessage(data.message ?? 'Database seeded successfully');
      } else {
        setSeedMessage(data.error ?? 'Seed failed');
      }
    } catch {
      setSeedMessage('Failed to seed database');
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Apex Tracker</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="surface-card p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="sarah.admin@corp.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loginLoading}>
            {loginLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="surface-card p-4 space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleSeedDatabase}
            disabled={seedLoading}
            className="w-full"
          >
            {seedLoading ? 'Seeding...' : 'Seed Database'}
          </Button>
          {seedMessage && (
            <p className={`text-xs ${seedMessage.startsWith('Database') ? 'text-green-600' : 'text-destructive'}`}>
              {seedMessage}
            </p>
          )}
          <p className="text-xs font-medium text-muted-foreground">Demo Credentials</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p><span className="font-mono">sarah.admin@corp.com</span> / <span className="font-mono">admin123!</span> (Admin)</p>
            <p><span className="font-mono">marcus.head@corp.com</span> / <span className="font-mono">tempPassword123!</span> (Dept Head)</p>
            <p><span className="font-mono">david.sup@corp.com</span> / <span className="font-mono">tempPassword123!</span> (Supervisor)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

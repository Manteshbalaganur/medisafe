'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { AuthForm } from '@/components/auth-form';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const handleLogin = async (data: any) => {
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10 px-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">MediSafe AI</h1>
            <p className="text-muted-foreground">Smart Prescription Analysis</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Welcome Back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to access your prescriptions
            </p>
          </div>

          <AuthForm type="login" onSubmit={handleLogin} isLoading={isLoading} />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground mb-3">Demo Credentials:</p>
            <div className="bg-secondary/20 rounded p-3 space-y-1 text-xs">
              <p className="text-foreground">
                <span className="font-semibold">Email:</span> demo@example.com
              </p>
              <p className="text-foreground">
                <span className="font-semibold">Password:</span> demo123
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

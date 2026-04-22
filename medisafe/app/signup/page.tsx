'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { AuthForm } from '@/components/auth-form';
import { Card } from '@/components/ui/card';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();

  const handleSignup = async (data: any) => {
    try {
      await signup(data.name, data.email, data.password, data.phone);
      router.push('/dashboard');
    } catch (error) {
      console.error('Signup failed:', error);
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
            <h2 className="text-xl font-semibold text-foreground mb-2">Create Account</h2>
            <p className="text-sm text-muted-foreground">
              Join MediSafe AI to start analyzing your prescriptions
            </p>
          </div>

          <AuthForm type="signup" onSubmit={handleSignup} isLoading={isLoading} />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-center text-foreground font-semibold mb-3">Features:</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span>AI-powered prescription analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span>Medication reminders</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span>Interaction warnings</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

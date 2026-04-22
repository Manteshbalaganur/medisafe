'use client';

import { useAuth } from '@/lib/auth-context';
import { PrescriptionCard } from '@/components/prescription-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { mockPrescriptions } from '@/lib/mockData';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const recentPrescriptions = mockPrescriptions.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Your health dashboard is up to date. You have {mockPrescriptions.length} active prescriptions currently being monitored.
          </p>
        </div>
        <Button asChild size="lg" className="shadow-lg shadow-primary/20 rounded-full">
          <Link href="/prescriptions/upload">Upload New</Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Prescriptions', value: mockPrescriptions.length, sub: `${mockPrescriptions.filter(p => p.riskLevel === 'high').length} high-risk`, color: 'text-foreground' },
          { label: 'Active Medicines', value: mockPrescriptions.reduce((acc, p) => acc + p.medicines.length, 0), sub: 'Across all files', color: 'text-foreground' },
          { label: 'Health Score', value: '92%', sub: 'All checks passed', color: 'text-green-500' },
        ].map((stat, i) => (
          <Card key={i} className="glass-card p-6 border-white/10 hover:bg-white/20 transition-all cursor-default">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">{stat.label}</p>
              <p className={cn("text-5xl font-black", stat.color)}>{stat.value}</p>
              <div className="flex items-center gap-2 pt-2">
                <div className="w-1 h-1 rounded-full bg-primary" />
                <p className="text-xs font-semibold text-muted-foreground">{stat.sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Prescriptions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold tracking-tight">Recent Analysis</h2>
          <Link href="/prescriptions/history" className="text-sm font-bold text-primary hover:underline transition-all">
            Browse All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentPrescriptions.map((prescription) => (
            <PrescriptionCard
              key={prescription.id}
              prescription={prescription}
              href={`/prescriptions/${prescription.id}`}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-8 bg-primary/5 border-primary/10">
        <h2 className="text-xl font-bold mb-6">Health Shortcuts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Upload Prescription', icon: '📤', href: '/prescriptions/upload' },
            { label: 'Manage Reminders', icon: '🔔', href: '/reminders' },
            { label: 'Chat with AI', icon: '💬', href: '/ask-ai' },
            { label: 'Update Profile', icon: '👤', href: '/profile' },
          ].map((action, i) => (
            <Button key={i} asChild variant="outline" className="h-auto py-6 glass flex flex-col gap-3 hover:bg-primary hover:text-white transition-all">
              <Link href={action.href}>
                <span className="text-2xl">{action.icon}</span>
                <span className="font-bold">{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

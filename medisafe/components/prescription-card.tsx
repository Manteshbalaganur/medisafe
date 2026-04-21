'use client';

import Link from 'next/link';
import { Prescription } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RiskBadge } from './risk-badge';

import { cn } from '@/lib/utils';

interface PrescriptionCardProps {
  prescription: Prescription;
  href?: string;
}

export function PrescriptionCard({ prescription, href }: PrescriptionCardProps) {
  const formattedDate = new Date(prescription.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const content = (
    <Card className="glass-card p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:bg-white/20 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            Dr. {prescription.doctorName}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">{prescription.hospitalName}</p>
        </div>
        <RiskBadge level={prescription.riskLevel} />
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 font-medium">
        <span className="flex items-center gap-1.5">📅 {formattedDate}</span>
        <span className="flex items-center gap-1.5">💊 {prescription.medicines.length} medicine(s)</span>
      </div>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-3">Medicines</p>
        <div className="space-y-2">
          {prescription.medicines.slice(0, 3).map((medicine, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-foreground/80">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              <span className="font-medium">{medicine.name}</span>
              <span className="text-xs opacity-60">({medicine.dosage})</span>
            </div>
          ))}
          {prescription.medicines.length > 3 && (
            <p className="text-sm text-primary font-bold mt-2">
              +{prescription.medicines.length - 3} more
            </p>
          )}
        </div>
      </div>

      {href && (
        <Button asChild className="w-full glass hover:bg-primary hover:text-white transition-all shadow-md group-hover:shadow-primary/20" variant="outline">
          <Link href={href}>View Details</Link>
        </Button>
      )}
    </Card>
  );

  return content;
}

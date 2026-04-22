'use client';

import { useStore } from '@/store/useStore';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Calendar, User, Shield, AlertTriangle, CheckCircle2, 
  Info, Pill, Clock, Sparkles, Utensils, Search, Loader2, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function PrescriptionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { prescriptions } = useStore();
  const prescription = prescriptions.find(p => p.id === id);

  // Meal Interaction State
  const [mealDescription, setMealDescription] = useState('');
  const [isCheckingMeal, setIsCheckingMeal] = useState(false);
  const [mealResult, setMealResult] = useState<any>(null);

  // Pill Verification State
  const [pillMedName, setPillMedName] = useState('');
  const [pillFile, setPillFile] = useState<File | null>(null);
  const [isVerifyingPill, setIsVerifyingPill] = useState(false);
  const [pillResult, setPillResult] = useState<any>(null);

  if (!prescription) {
    return (
      <div className="container mx-auto p-8 mt-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Prescription not found</h2>
        <Button onClick={() => router.push('/')} className="mt-4">Go to Dashboard</Button>
      </div>
    );
  }

  const handleCheckMeal = async () => {
    if (!mealDescription) return;
    setIsCheckingMeal(true);
    try {
      const response = await fetch('http://localhost:8000/check-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescription_id: id,
          meal_description: mealDescription
        })
      });
      const data = await response.json();
      setMealResult(data);
    } catch (error) {
      toast.error("Failed to check meal interaction. Ensure backend is running.");
    } finally {
      setIsCheckingMeal(false);
    }
  };

  const handleVerifyPill = async () => {
    if (!pillMedName || !pillFile) return;
    setIsVerifyingPill(true);
    try {
      const formData = new FormData();
      formData.append('file', pillFile);
      formData.append('expected_name', pillMedName);

      const response = await fetch('http://localhost:8000/verify-pill', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setPillResult(data);
    } catch (error) {
      toast.error("Failed to verify pill visually. Ensure backend is running.");
    } finally {
      setIsVerifyingPill(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 mt-16 max-w-6xl space-y-8 pb-24">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/')} 
        className="group text-slate-500 hover:text-slate-900 -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Report Column */}
        <div className="lg:col-span-2 space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Prescription Report</h1>
                  <Badge className={
                    prescription.overallScore === 'Safe' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    prescription.overallScore === 'Caution' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    'bg-rose-50 text-rose-700 border-rose-100'
                  }>
                    {prescription.overallScore}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(prescription.dateAdded).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><User className="w-4 h-4" /> Dr. AI System</span>
                </div>
              </div>
            </div>
          </header>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Info className="w-5 h-5 text-teal-600" /> AI Summary & Explanation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {prescription.fullExplanation}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Medications</h3>
            {prescription.medicines.map((med, i) => (
              <motion.div key={med.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-slate-100 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-800 transition-colors bg-white dark:bg-slate-900">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Pill className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">{med.name} <span className="text-teal-600 dark:text-teal-400 ml-1">{med.dosage}</span></h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Purpose: {med.purpose}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm font-semibold">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                        <Clock className="w-4 h-4" /> {med.frequency}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                        <Calendar className="w-4 h-4" /> {med.duration}
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 flex items-center justify-center text-[10px] font-bold shrink-0 italic">AI</div>
                    <p className="text-[12px] font-semibold text-slate-600 dark:text-slate-400 italic">
                      "{med.instructions}"
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar Interactions & Tools */}
        <div className="space-y-6">
          <Card className="border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-950/20 shadow-sm overflow-hidden">
            <CardHeader className="bg-rose-50 dark:bg-rose-900/20 border-b border-rose-100 dark:border-rose-900/30">
              <CardTitle className="text-base font-bold text-rose-800 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Safety & Interactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {prescription.interactions.map((interaction, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-rose-200 text-rose-700 bg-white">
                      {interaction.severity} Severity
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-rose-900/80 dark:text-rose-300 leading-relaxed">
                    {interaction.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* CHECK MEAL INTERACTION CARD */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Utensils className="w-5 h-5 text-indigo-500" /> Check Meal Interaction
              </CardTitle>
              <CardDescription className="text-xs">
                Planning a meal? Check if it's safe to eat with these medications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="e.g., Grapefruit juice and toast" 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all dark:text-white"
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                />
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-sm transition-all active:scale-[0.98]"
                onClick={handleCheckMeal}
                disabled={isCheckingMeal || !mealDescription}
              >
                {isCheckingMeal ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Safety"}
              </Button>

              <AnimatePresence>
                {mealResult && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2 space-y-2">
                    <div className={`p-3 rounded-xl border flex items-start gap-2 ${mealResult.safe_to_eat ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                      {mealResult.safe_to_eat ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                      <div className="text-[12px]">
                        <p className="font-bold">{mealResult.safe_to_eat ? "Safe to eat" : "Caution Required"}</p>
                        <p className="font-medium mt-1">{mealResult.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* VERIFY PILL VISUALLY CARD */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-500" /> Verify Pill Visually
              </CardTitle>
              <CardDescription className="text-xs">
                Not sure about a pill? Upload a photo to verify it against the prescription.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Expected Medicine Name" 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all dark:text-white font-medium"
                  value={pillMedName}
                  onChange={(e) => setPillMedName(e.target.value)}
                />
                <div className="relative">
                  <input 
                    type="file" 
                    className="hidden" 
                    id="pill-file-input" 
                    accept="image/*"
                    onChange={(e) => setPillFile(e.target.files?.[0] || null)}
                  />
                  <label 
                    htmlFor="pill-file-input"
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <span className="text-slate-500 truncate max-w-[150px]">{pillFile ? pillFile.name : "No file chosen"}</span>
                    <Upload className="w-4 h-4 text-slate-400" />
                  </label>
                </div>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-sm transition-all active:scale-[0.98]"
                onClick={handleVerifyPill}
                disabled={isVerifyingPill || !pillMedName || !pillFile}
              >
                {isVerifyingPill ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze Pill Image"}
              </Button>

              <AnimatePresence>
                {pillResult && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2 space-y-2">
                    <div className={`p-3 rounded-xl border flex items-start gap-2 ${pillResult.match ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                      {pillResult.match ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                      <div className="text-[12px]">
                        <p className="font-bold">{pillResult.match ? `Match Found (${pillResult.confidence})` : "Match Not Found"}</p>
                        <p className="font-medium mt-1">{pillResult.conclusion}</p>
                        <p className="text-[10px] mt-1 opacity-80">{pillResult.observations}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

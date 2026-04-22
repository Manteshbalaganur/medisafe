'use client';

import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pill, Activity, FileText, UploadCloud, Bell, MessageSquare, User, Clock, ArrowRight, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function DashboardPage() {
  const { profile, prescriptions } = useStore();

  const totalPrescriptions = prescriptions.length;
  const activeMedicines = prescriptions.reduce((acc, curr) => acc + curr.medicines.length, 0);
  
  // Calculate health score mock (base 100, minus risks)
  const risks = prescriptions.filter(p => p.overallScore === 'Risk').length * 10;
  const cautions = prescriptions.filter(p => p.overallScore === 'Caution').length * 5;
  const healthScore = Math.max(0, 100 - risks - cautions);

  // Mock adherence data for chart
  const adherenceData = [
    { name: 'Mon', score: 85 },
    { name: 'Tue', score: 88 },
    { name: 'Wed', score: 92 },
    { name: 'Thu', score: 90 },
    { name: 'Fri', score: healthScore },
    { name: 'Sat', score: healthScore + 2 },
    { name: 'Sun', score: healthScore },
  ];

  const ScoreBadge = ({ score }: { score: "Safe" | "Caution" | "Risk" }) => {
    switch (score) {
      case "Safe":
        return <Badge variant="outline" className="bg-teal-50/50 text-teal-700 border-teal-200/50 font-medium tracking-tight">Safe</Badge>;
      case "Caution":
        return <Badge variant="outline" className="bg-amber-50/50 text-amber-700 border-amber-200/50 font-medium tracking-tight">Caution</Badge>;
      case "Risk":
        return <Badge variant="outline" className="bg-rose-50/50 text-rose-700 border-rose-200/50 font-medium tracking-tight">Risk</Badge>;
      default:
        return null;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 mt-16 max-w-6xl space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Welcome back, {profile.name.split(' ')[0]}
          </h1>
          <p className="text-slate-500 mt-2 text-base">Here is your AI-powered health overview.</p>
        </div>
        <Link href="/upload">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 shadow-sm transition-all hover:shadow-md h-10 font-medium">
            <UploadCloud className="w-4 h-4 mr-2" /> Upload New
          </Button>
        </Link>
      </motion.div>

      {/* Stats Row */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 tracking-tight">Health Score</p>
                  <p className="text-4xl font-bold tracking-tighter text-slate-900">{healthScore}%</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+2.5% from last week</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 tracking-tight">Active Medications</p>
                  <p className="text-4xl font-bold tracking-tighter text-slate-900">{activeMedicines}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Pill className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-slate-500 font-medium">
                <span>Across {totalPrescriptions} prescriptions</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-teal-500 to-teal-600 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <CardContent className="p-6 relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-teal-50 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-200" /> AI Insight
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium leading-relaxed text-teal-50">
                {prescriptions.length > 0 
                  ? "Your adherence is excellent. Consider checking interactions for your new Amoxicillin prescription."
                  : "Upload your first prescription to get personalized AI health insights and reminders."}
              </p>
              <Button variant="link" className="text-teal-100 hover:text-white p-0 h-auto mt-3 font-semibold group">
                Read full analysis <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Adherence Chart & Recent */}
        <div className="md:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900 tracking-tight">Adherence Trend</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={adherenceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Recent Prescriptions</h2>
            </div>
            
            <div className="space-y-3">
              {prescriptions.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-slate-900">No prescriptions yet</h3>
                  <p className="text-xs text-slate-500 mt-1">Upload to start analyzing.</p>
                </div>
              ) : (
                prescriptions.slice(0, 3).map((p, i) => (
                  <Link href={`/prescription/${p.id}`} key={p.id} className="block group">
                    <Card className="border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all duration-200">
                      <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm text-slate-900">{p.doctorName || "Unknown Doctor"}</h3>
                              <ScoreBadge score={p.overallScore} />
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                              {format(new Date(p.dateAdded), 'MMM dd, yyyy')} • {p.medicines.length} medicines
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-colors" />
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Shortcuts & Suggestions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight px-1">Quick Actions</h2>
            <div className="grid gap-2">
              <Link href="/ask-ai">
                <Button variant="outline" className="w-full justify-start h-12 text-sm border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700 transition-all group font-medium rounded-xl">
                  <MessageSquare className="w-4 h-4 mr-3 text-blue-500" />
                  Chat with AI
                </Button>
              </Link>
              <Link href="/reminder">
                <Button variant="outline" className="w-full justify-start h-12 text-sm border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700 transition-all group font-medium rounded-xl">
                  <Bell className="w-4 h-4 mr-3 text-indigo-500" />
                  Manage Reminders
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full justify-start h-12 text-sm border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group font-medium rounded-xl">
                  <User className="w-4 h-4 mr-3 text-slate-500" />
                  Update Profile
                </Button>
              </Link>
            </div>
          </div>

          <Card className="border border-amber-100 bg-amber-50/50 shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="text-sm font-semibold text-amber-900 tracking-tight">AI Health Suggestion</h3>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed">
                Based on your Amoxicillin prescription, remember to take it with food to avoid stomach upset. Consider taking a probiotic 2 hours after your dose.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

'use client';
import React from 'react';

import { useStore } from '@/store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, Clock, Calendar as CalendarIcon, Info, CheckCircle2, TrendingUp, Sparkles, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReminderPage() {
  const { reminders, updateReminder, profile } = useStore();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const activeRemindersCount = reminders.filter(r => r.enabled).length;

  const toggleReminder = (id: string, currentEnabled: boolean) => {
    updateReminder(id, { enabled: !currentEnabled });
  };

  const takePhoto = (id: string) => {
    // In a real app, this would open the camera
    updateReminder(id, { photoVerified: true });
    alert("Photo successfully verified! Excellent job.");
  };

  React.useEffect(() => {
    // Sync to Python backend for SMS alerts cron job
    const syncBackend = async () => {
      try {
        await fetch('http://localhost:8000/sync-reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 'user_123',
            phone_number: profile?.phone || '+15550000000',
            reminders: reminders.map(r => ({
              id: r.id,
              time: r.time,
              photoVerified: r.photoVerified || false,
              medicineName: r.medicineName
            }))
          })
        });
      } catch (err) {
        console.error("Backend not running or failed to sync:", err);
      }
    };
    if (reminders.length > 0) syncBackend();
  }, [reminders, profile?.phone]);

  // Sort reminders by time mock (assuming format HH:MM)
  const sortedReminders = [...reminders].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="container mx-auto p-4 md:p-8 mt-16 max-w-5xl space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Your Schedule</h1>
          <p className="text-slate-500 mt-2 font-medium">Timeline of your medication routine.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
          <div className="relative">
            <Bell className="w-5 h-5 text-teal-600" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
          </div>
          <span className="font-semibold text-slate-700 text-sm">{activeRemindersCount} Active Alerts</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Timeline Column */}
        <div className="md:col-span-2 space-y-8">
          {sortedReminders.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-white/50">
              <BellOff className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Your timeline is clear</h3>
              <p className="text-slate-500 mb-4 text-sm mt-1">Upload a prescription and we'll automatically generate your schedule.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-8 py-4">
              <AnimatePresence>
                {sortedReminders.map((reminder, i) => (
                  <motion.div 
                    key={reminder.id} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: 0.1 * i, type: 'spring', stiffness: 200 }}
                    className="relative"
                  >
                    {/* Timeline dot */}
                    <div className={`absolute -left-[35px] top-4 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-colors duration-300 ${reminder.enabled ? 'bg-teal-500' : 'bg-slate-300'}`} />
                    
                    <Card className={`border transition-all duration-300 ${reminder.enabled ? 'border-transparent shadow-md hover:shadow-lg bg-white ring-1 ring-slate-100' : 'border-slate-200 bg-slate-50/50 opacity-70 hover:opacity-100'}`}>
                      <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${reminder.enabled ? 'bg-gradient-to-br from-teal-400 to-teal-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-lg font-bold tracking-tight ${reminder.enabled ? 'text-slate-900' : 'text-slate-600'}`}>{reminder.time}</span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${reminder.enabled ? 'bg-teal-50 text-teal-700' : 'bg-slate-200 text-slate-600'}`}>
                                {reminder.frequency}
                              </span>
                            </div>
                            <h3 className={`font-semibold ${reminder.enabled ? 'text-slate-700' : 'text-slate-500'}`}>{reminder.medicineName}</h3>
                            <p className="text-xs font-medium text-slate-500 mt-1">
                              Validation: <span className={reminder.photoVerified ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>{reminder.photoVerified ? "Verified" : "Awaiting Photo"}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`gap-2 ${reminder.photoVerified ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}
                            onClick={() => takePhoto(reminder.id)}
                            disabled={reminder.photoVerified}
                          >
                            <Camera className="w-4 h-4" />
                            {reminder.photoVerified ? "Verified" : "Verify Dose with Photo"}
                          </Button>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-400 sm:hidden">Active</span>
                            <Switch 
                              checked={reminder.enabled} 
                              onCheckedChange={() => toggleReminder(reminder.id, reminder.enabled)}
                              className="data-[state=checked]:bg-teal-500"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Adherence & AI Insights Column */}
        <div className="space-y-6">
          <Card className="border-transparent ring-1 ring-slate-100 shadow-md bg-white">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-4xl font-bold tracking-tighter text-slate-900">92%</h3>
                  <div className="flex flex-col gap-1">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      SMS Alerts: Active
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      Verified: 88%
                    </span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-1">Adherence Rate</p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
                <div className="bg-emerald-500 h-2 rounded-full w-[92%] transition-all duration-1000" />
              </div>
              <p className="text-xs font-medium text-slate-500">You're on a 14-day streak! 🔥</p>
            </CardContent>
          </Card>

          <Card className="border-teal-100 bg-teal-50/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24 text-teal-600" />
            </div>
            <CardContent className="p-6 relative z-10 space-y-4">
              <div className="flex items-center gap-2 text-teal-800">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-semibold text-base">AI Optimization</h3>
              </div>
              <p className="text-sm text-teal-900/80 leading-relaxed font-medium">
                Based on your Amoxicillin prescription, we've scheduled your doses 8 hours apart to maintain consistent levels in your body. Remember to take it with meals to prevent stomach upset.
              </p>
              <Button variant="link" className="text-teal-700 hover:text-teal-800 p-0 h-auto font-bold">Ask AI about scheduling &rarr;</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

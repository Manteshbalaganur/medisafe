'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockReminders } from '@/lib/mockData';
import { Reminder } from '@/lib/types';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <>
      <Navbar title="Medication Reminders" />
      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Reminders</h1>
            <p className="text-muted-foreground mt-2">
              {reminders.filter((r) => r.enabled).length} active reminder(s)
            </p>
          </div>

          {/* Info Box */}
          <Card className="p-4 bg-secondary/20 border-secondary/30">
            <p className="text-sm text-foreground">
              <span className="font-semibold">🔔 Heads up:</span> Enable reminders to receive notifications for your medications. You&apos;ll get alerts at the scheduled times.
            </p>
          </Card>

          {/* Reminders List */}
          {reminders.length > 0 ? (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <Card
                  key={reminder.id}
                  className={`p-6 transition-colors ${
                    reminder.enabled ? 'bg-card' : 'bg-muted/20 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {reminder.medicineName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            reminder.enabled
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {reminder.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground font-medium">Time</p>
                          <p className="text-foreground text-lg font-semibold">
                            {formatTime(reminder.time)}
                          </p>
                        </div>

                        <div>
                          <p className="text-muted-foreground font-medium">Frequency</p>
                          <p className="text-foreground">
                            {reminder.days.length === 7 ? 'Every day' : reminder.days.length + ' days/week'}
                          </p>
                        </div>
                      </div>

                      {reminder.days.length < 7 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Days</p>
                          <div className="flex flex-wrap gap-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                              <span
                                key={day}
                                className={`text-xs px-2 py-1 rounded ${
                                  reminder.days.includes(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx])
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {day}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant={reminder.enabled ? 'default' : 'outline'}
                        onClick={() => toggleReminder(reminder.id)}
                      >
                        {reminder.enabled ? 'On' : 'Off'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteReminder(reminder.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-3xl mb-4">🔔</p>
              <p className="text-lg font-semibold text-foreground">No reminders set</p>
              <p className="text-muted-foreground mt-2">
                Upload a prescription to automatically create reminders for your medications
              </p>
            </Card>
          )}

          {/* Tips */}
          <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200/30">
            <h3 className="text-lg font-semibold text-foreground mb-4">💡 Best Practices</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-0.5">•</span>
                <span className="text-foreground">Set reminders for the same time each day</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-0.5">•</span>
                <span className="text-foreground">Take medication as soon as you get the reminder</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-0.5">•</span>
                <span className="text-foreground">Never skip doses to maintain effectiveness</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}

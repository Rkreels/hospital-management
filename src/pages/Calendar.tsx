import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
const days = ['Mon 23', 'Tue 24', 'Wed 25', 'Thu 26', 'Fri 27'];

const events = [
  { id: 1, title: 'Product Sync', day: 1, startHour: 10, duration: 1, type: 'meeting' },
  { id: 2, title: 'Design Review', day: 2, startHour: 13, duration: 1.5, type: 'review' },
  { id: 3, title: 'Client Pitch', day: 3, startHour: 11, duration: 1, type: 'external' },
  { id: 4, title: '1:1 with Sarah', day: 4, startHour: 15, duration: 0.5, type: 'meeting' },
];

export default function Calendar() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Schedule</h1>
          <p className="text-muted-foreground mt-1">October 23 - 27, 2023</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <button className="p-2 hover:bg-muted transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <span className="px-4 py-2 font-medium border-x border-border">Today</span>
            <button className="p-2 hover:bg-muted transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
            New Event
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-soft flex-1 overflow-x-auto"
      >
        <div className="min-w-[800px]">
          {/* Header row */}
          <div className="grid grid-cols-6 border-b border-border bg-muted/20">
            <div className="p-4 border-r border-border"></div>
            {days.map(day => (
              <div key={day} className="p-4 text-center border-r border-border last:border-0">
                <span className="text-sm font-medium text-foreground">{day}</span>
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="relative">
            {timeSlots.map((time, index) => (
              <div key={time} className="grid grid-cols-6 border-b border-border/50 last:border-0 h-20">
                <div className="p-4 border-r border-border text-xs text-muted-foreground font-medium text-right relative">
                  <span className="-mt-2 block">{time}</span>
                </div>
                {days.map((_, i) => (
                  <div key={i} className="border-r border-border/50 last:border-0 p-1 relative">
                    {/* Render events based on mock data logic */}
                    {events.map(event => {
                      if (event.day === i && event.startHour === index + 9) {
                        return (
                          <div 
                            key={event.id}
                            className={`absolute left-1 right-1 rounded-md p-2 text-xs font-medium border overflow-hidden
                              ${event.type === 'meeting' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 
                                event.type === 'review' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' : 
                                'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'}
                            `}
                            style={{ 
                              top: '4px', 
                              height: `calc(${event.duration * 100}% - 8px)`,
                              zIndex: 10
                            }}
                          >
                            <span className="block truncate">{event.title}</span>
                          </div>
                        )
                      }
                      return null;
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
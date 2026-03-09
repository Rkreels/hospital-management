import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, MoreHorizontal } from 'lucide-react';
import StatCard from '../components/StatCard';

const recentActivity = [
  { id: 1, title: 'Updated Q3 Marketing Deck', type: 'document', time: '2 hours ago', user: 'Sarah Jenkins' },
  { id: 2, title: 'Client Onboarding Flow', type: 'task', time: '4 hours ago', user: 'Alex Morgan' },
  { id: 3, title: 'Weekly Sync Notes', type: 'meeting', time: 'Yesterday', user: 'David Kim' },
  { id: 4, title: 'Q4 Budget Review', type: 'document', time: 'Yesterday', user: 'Sarah Jenkins' },
];

const upcomingTasks = [
  { id: 1, title: 'Review Q3 Performance Metrics', due: 'Today, 5:00 PM', priority: 'High' },
  { id: 2, title: 'Prepare slides for All-Hands', due: 'Tomorrow', priority: 'Medium' },
  { id: 3, title: 'Approve vendor invoices', due: 'Oct 24', priority: 'Low' },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Good morning, Alex.</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your workspace today.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg inline-flex w-fit">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Tasks Completed" 
          value="24" 
          trend="+12%" 
          trendUp={true} 
          icon={CheckCircle2} 
          delay={0.1}
        />
        <StatCard 
          title="Hours Logged" 
          value="38.5" 
          trend="-2%" 
          trendUp={false} 
          icon={Clock} 
          delay={0.2}
        />
        <StatCard 
          title="Needs Attention" 
          value="3" 
          icon={AlertCircle} 
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold">Priority Tasks</h2>
            <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">View all</button>
          </div>
          <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
            <div className="divide-y divide-border">
              {upcomingTasks.map((task, index) => (
                <div key={task.id} className="p-5 flex items-start sm:items-center justify-between hover:bg-muted/30 transition-colors group">
                  <div className="flex items-start sm:items-center gap-4">
                    <button className="mt-1 sm:mt-0 w-5 h-5 rounded-md border-2 border-muted-foreground/30 flex-shrink-0 group-hover:border-primary transition-colors"></button>
                    <div>
                      <h4 className="font-medium text-foreground">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">{task.due}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full hidden sm:inline-block
                    ${task.priority === 'High' ? 'bg-destructive/10 text-destructive' : 
                      task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600' : 
                      'bg-green-500/10 text-green-600'}`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-heading font-semibold">Recent Activity</h2>
          <div className="bg-card border border-border rounded-2xl shadow-soft p-6">
            <div className="space-y-6">
              {recentActivity.map((activity, i) => (
                <div key={activity.id} className="flex gap-4 relative">
                  {i !== recentActivity.length - 1 && (
                    <div className="absolute left-2.5 top-8 bottom-[-24px] w-px bg-border"></div>
                  )}
                  <div className="w-5 h-5 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center flex-shrink-0 mt-0.5 z-10">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
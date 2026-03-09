import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, MoreVertical, Calendar } from 'lucide-react';

const mockTasks = [
  { id: 1, title: 'Finalize Q3 Product Roadmap', status: 'In Progress', priority: 'High', due: 'Oct 25', project: 'Strategy' },
  { id: 2, title: 'Update internal design system', status: 'To Do', priority: 'Medium', due: 'Oct 28', project: 'Design' },
  { id: 3, title: 'Client presentation review', status: 'In Progress', priority: 'High', due: 'Today', project: 'Client Work' },
  { id: 4, title: 'Weekly sync agenda', status: 'Done', priority: 'Low', due: 'Yesterday', project: 'Management' },
  { id: 5, title: 'Research competitor pricing', status: 'To Do', priority: 'Medium', due: 'Nov 02', project: 'Marketing' },
];

const tabs = ['All Tasks', 'To Do', 'In Progress', 'Done'];

export default function Tasks() {
  const [activeTab, setActiveTab] = useState('All Tasks');

  const filteredTasks = mockTasks.filter(task => {
    if (activeTab === 'All Tasks') return true;
    return task.status === activeTab;
  });

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage and track your projects.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-soft flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border p-4 gap-4 bg-muted/20">
          <div className="flex space-x-1 overflow-x-auto max-w-full pb-2 sm:pb-0 hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab 
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg bg-background shadow-sm hover:bg-muted/50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Task List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/30 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium w-full">Task Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Project</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTasks.map((task, index) => (
                <motion.tr 
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                        ${task.status === 'Done' ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 group-hover:border-primary'}
                      `}>
                        {task.status === 'Done' && <Plus className="w-3 h-3 rotate-45" />}
                      </button>
                      <span className={`font-medium ${task.status === 'Done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {task.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                      ${task.status === 'Done' ? 'bg-green-500/10 text-green-700 border-green-200/50 dark:border-green-900/50' : 
                        task.status === 'In Progress' ? 'bg-blue-500/10 text-blue-700 border-blue-200/50 dark:border-blue-900/50' : 
                        'bg-slate-500/10 text-slate-700 border-slate-200/50 dark:border-slate-800/50'}
                    `}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-muted-foreground bg-muted px-2.5 py-1 rounded-md text-xs">
                      {task.project}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className={task.due === 'Today' ? 'text-destructive font-medium' : ''}>{task.due}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md opacity-0 group-hover:opacity-100 transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredTasks.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              No tasks found for this view.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
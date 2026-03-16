"use client";

import React, { useState, useEffect } from "react";
import { db } from '../lib/store';
import { motion } from "framer-motion";
import { Plus, Filter, MoreVertical, Calendar, CheckCircle, Trash2, Edit } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "react-toastify";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "To Do" | "In Progress" | "Done";
  priority: "High" | "Medium" | "Low";
  due: string;
  assignedTo: string;
  category: string;
}

const initialFormData = {
  title: "",
  description: "",
  status: "To Do" as "To Do" | "In Progress" | "Done",
  priority: "Medium" as "High" | "Medium" | "Low",
  due: "",
  assignedTo: "",
  category: "",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState("All Tasks");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = db.getTasks() || [];
      setTasks(data);
    } catch {
      toast.error("Failed to fetch tasks");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const updated = db.updateTask(editingTask.id, formData);
        if (updated) {
          toast.success("Task updated successfully");
          fetchTasks();
          resetForm();
        }
      } else {
        const newTask = db.addTask(formData);
        if (newTask) {
          toast.success("Task added successfully");
          fetchTasks();
          resetForm();
        }
      }
    } catch {
      toast.error("Failed to save task");
    }
  };

  const handleStatusToggle = async (task: Task) => {
    const newStatus = task.status === "Done" ? "To Do" : "Done";
    try {
      const updated = db.updateTask(task.id, { status: newStatus });
      if (updated) {
        fetchTasks();
      }
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const deleted = db.deleteTask(id);
        if (deleted) {
          toast.success("Task deleted successfully");
          fetchTasks();
        }
      } catch {
        toast.error("Failed to delete task");
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      due: task.due,
      assignedTo: task.assignedTo,
      category: task.category,
    });
    setIsDialogOpen(true);
  };

  const tabs = ["All Tasks", "To Do", "In Progress", "Done"];

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "All Tasks") return true;
    return task.status === activeTab;
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Medium":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Tasks
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your tasks.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-5 h-5 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? "Edit Task" : "Add New Task"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: "High" | "Medium" | "Low") =>
                          setFormData({ ...formData, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "To Do" | "In Progress" | "Done") =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="To Do">To Do</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="due">Due Date</Label>
                      <Input
                        id="due"
                        value={formData.due}
                        onChange={(e) =>
                          setFormData({ ...formData, due: e.target.value })
                        }
                        placeholder="e.g., Today, Tomorrow, Jan 25"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">Assigned To</Label>
                      <Input
                        id="assignedTo"
                        value={formData.assignedTo}
                        onChange={(e) =>
                          setFormData({ ...formData, assignedTo: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTask ? "Update" : "Add"} Task
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border p-4 gap-4 bg-muted/20">
            <div className="flex space-x-1 overflow-x-auto max-w-full pb-2 sm:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium w-full">Task Name</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Category</th>
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
                        <button
                          onClick={() => handleStatusToggle(task)}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            task.status === "Done"
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/30 group-hover:border-primary"
                          }`}
                        >
                          {task.status === "Done" && (
                            <CheckCircle className="w-3 h-3" />
                          )}
                        </button>
                        <span
                          className={`font-medium ${
                            task.status === "Done"
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          task.status === "Done"
                            ? "success"
                            : task.status === "In Progress"
                            ? "info"
                            : "secondary"
                        }
                      >
                        {task.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-muted-foreground bg-muted px-2.5 py-1 rounded-md text-xs">
                        {task.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span
                          className={
                            task.due === "Today" ? "text-destructive font-medium" : ""
                          }
                        >
                          {task.due}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(task)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(task.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        </Card>
      </div>
    );
  }

"use client";

import React, { useState, useEffect } from "react";
import { db } from '../lib/store';
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "react-toastify";

interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "meeting" | "surgery" | "appointment" | "other";
  description?: string;
}

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const initialFormData = {
  title: "",
  date: "",
  startTime: "09:00",
  endTime: "10:00",
  type: "meeting" as "meeting" | "surgery" | "appointment" | "other",
  description: "",
};

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = db.getEvent();
      setEvents(data);
    } catch {
      toast.error("Failed to fetch events");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Event added successfully");
        fetchEvents();
        resetForm();
      }
    } catch {
      toast.error("Failed to add event");
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsDialogOpen(false);
  };

  const getDaysOfWeek = () => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(
        day.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    }
    return days;
  };

  const getWeekRange = () => {
    const start = currentWeekStart.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    const end = new Date(currentWeekStart);
    end.setDate(currentWeekStart.getDate() + 4);
    return `${start} - ${end.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + direction * 7);
    setCurrentWeekStart(newDate);
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "surgery":
        return "bg-red-50 text-red-700 border-red-200";
      case "appointment":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getEventsForDay = (dayIndex: number) => {
    return events.filter((event, i) => event.date || i % 5 === dayIndex);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Schedule
            </h1>
            <p className="text-muted-foreground mt-1">{getWeekRange()}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateWeek(-1)}
                className="rounded-none"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const dayOfWeek = today.getDay();
                  const diff =
                    today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                  setCurrentWeekStart(new Date(today.setDate(diff)));
                }}
                className="rounded-none border-x border-border"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateWeek(1)}
                className="rounded-none"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-5 h-5 mr-2" />
                  New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
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
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={(e) =>
                            setFormData({ ...formData, startTime: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={formData.endTime}
                          onChange={(e) =>
                            setFormData({ ...formData, endTime: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(
                          value: "meeting" | "surgery" | "appointment" | "other"
                        ) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="surgery">Surgery</SelectItem>
                          <SelectItem value="appointment">Appointment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
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
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Event</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-hidden"
        >
          <Card className="h-full">
            <CardContent className="p-0 h-full overflow-x-auto">
              <div className="min-w-[800px] h-full">
                {/* Header row */}
                <div className="grid grid-cols-6 border-b border-border bg-muted/20">
                  <div className="p-4 border-r border-border"></div>
                  {getDaysOfWeek().map((day) => (
                    <div
                      key={day}
                      className="p-4 text-center border-r border-border last:border-0"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {day}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Time grid */}
                <div className="relative" style={{ height: "calc(100% - 57px)" }}>
                  {timeSlots.map((time, index) => (
                    <div
                      key={time}
                      className="grid grid-cols-6 border-b border-border/50 last:border-0 h-20"
                    >
                      <div className="p-4 border-r border-border text-xs text-muted-foreground font-medium text-right relative">
                        <span className="-mt-2 block">{time}</span>
                      </div>
                      {getDaysOfWeek().map((_, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="border-r border-border/50 last:border-0 p-1 relative"
                        >
                          {events.map((event, eventIndex) => {
                            const eventHour = parseInt(event.startTime.split(":")[0]);
                            const eventDay = eventIndex % 5;
                            if (eventDay === dayIndex && eventHour === index + 9) {
                              return (
                                <div
                                  key={event.id}
                                  className={`absolute left-1 right-1 rounded-md p-2 text-xs font-medium border overflow-hidden ${getEventColor(
                                    event.type
                                  )}`}
                                  style={{
                                    top: "4px",
                                    height: "60px",
                                    zIndex: 10,
                                  }}
                                >
                                  <span className="block truncate">
                                    {event.title}
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

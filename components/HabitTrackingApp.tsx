"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Edit2, Check, Plus, Trash2 } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, addDays, addMonths, addYears, startOfYear, eachDayOfInterval } from 'date-fns';

interface Task {
  id: number;
  name: string;
}

interface DailyTasks {
  [date: string]: {
    [taskId: number]: boolean;
  };
}

function DateSelector({ currentDate, onChange, formatString }: { currentDate: Date, onChange: (amount: number) => void, formatString: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <Button variant="outline" size="icon" onClick={() => onChange(-1)} aria-label="Previous">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium">{format(currentDate, formatString)}</span>
      <Button variant="outline" size="icon" onClick={() => onChange(1)} aria-label="Next">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function TaskTracker({ currentDate, tasks, dailyTasks, updateTask, updateTaskName, moveTaskToDate, addTask, removeTask, changeDate }: {
  currentDate: Date;
  tasks: Task[];
  dailyTasks: DailyTasks;
  updateTask: (date: string, taskId: number, completed: boolean) => void;
  updateTaskName: (taskId: number, newName: string) => void;
  moveTaskToDate: (taskId: number, newDate: Date, currentDate: Date) => void;
  addTask: (name: string, date: Date) => void;
  removeTask: (id: number, date: Date) => void;
  changeDate: (amount: number) => void;
}) {
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [editDate, setEditDate] = useState<Date | null>(null);

  const dateKey = format(currentDate, 'yyyy-MM-dd');
  const tasksForCurrentDate = dailyTasks[dateKey] || {};

  const getTaskName = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.name : "";
  };

  const handleEditClick = (taskId: number) => {
    const taskName = getTaskName(taskId);
    setEditingTask(taskId);
    setEditName(taskName);
    setEditDate(currentDate);
  };

  const handleSaveEdit = (taskId: number) => {
    if (editName.trim()) {
      updateTaskName(taskId, editName.trim());
    }
    if (editDate && editDate !== currentDate) {
      moveTaskToDate(taskId, editDate, currentDate);
    }
    setEditingTask(null);
  };

  const handleAddTask = () => {
    if (newTaskName.trim()) {
      addTask(newTaskName.trim(), currentDate);
      setNewTaskName("");
    }
  };

  return (
    <div className="space-y-6">
      <DateSelector currentDate={currentDate} onChange={changeDate} formatString="EEEE, d MMMM, yyyy" />
      <ul className="space-y-4">
        {Object.entries(tasksForCurrentDate).map(([taskId, completed]) => (
          <li key={taskId} className="flex items-center space-x-2">
            <div className="w-full flex items-center space-x-3 p-3 bg-gray-100 rounded-lg h-16">
              <Checkbox
                id={`task-${taskId}`}
                checked={completed}
                onCheckedChange={(checked) => updateTask(dateKey, Number(taskId), checked as boolean)}
              />
              <div className="flex-grow flex items-center h-full">
                {editingTask === Number(taskId) ? (
                  <div className="flex flex-grow items-center space-x-2 w-full">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(Number(taskId));
                        }
                        e.stopPropagation();
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-grow text-base"
                      autoFocus
                    />
                    <DatePicker
                      selected={editDate}
                      onChange={(date: Date | null) => {
                        if (date) {
                          setEditDate(date);
                        }
                      }}
                      dateFormat="EEE, d MMM yyyy"
                      className="flex-grow text-base border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full"
                      popperPlacement="bottom-end"
                    />
                  </div>
                ) : (
                  <span className="text-base font-medium flex-grow text-left cursor-pointer truncate" onClick={() => handleEditClick(Number(taskId))}>
                    {getTaskName(Number(taskId))}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {editingTask === Number(taskId) ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleSaveEdit(Number(taskId))}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEditClick(Number(taskId))}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeTask(Number(taskId), currentDate)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Add new task"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddTask();
            }
          }}
        />
        <Button onClick={handleAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
    </div>
  );
}

function MonthlyOverview({ currentDate, changeMonth, dailyTasks, onDateSelect }: {
  currentDate: Date;
  changeMonth: (amount: number) => void;
  dailyTasks: DailyTasks;
  onDateSelect: (date: Date) => void;
}) {
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const today = new Date();

    const days = Array.from({ length: daysInMonth + firstDayOfMonth }, (_, i) => {
      const dayNumber = i - firstDayOfMonth + 1;
      if (dayNumber < 1 || dayNumber > daysInMonth) {
        return { day: null, date: null, status: 'outside' };
      }

      const date = new Date(year, month, dayNumber);
      const dateKey = format(date, 'yyyy-MM-dd');

      if (date > today) {
        return { day: dayNumber, date, status: 'future' };
      }

      const dayTasks = dailyTasks[dateKey] || {};
      const completedTasks = Object.values(dayTasks).filter(Boolean).length;
      const totalTasks = Object.keys(dayTasks).length;

      if (completedTasks === totalTasks && totalTasks > 0) {
        return { day: dayNumber, date, status: 'completed' };
      } else if (completedTasks > 0) {
        return { day: dayNumber, date, status: 'partial' };
      } else {
        return { day: dayNumber, date, status: 'missed' };
      }
    });

    return days;
  };

  const monthData = getMonthData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'partial':
        return 'bg-green-500/50 text-white hover:bg-green-600/50';
      case 'missed':
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
      case 'future':
        return 'bg-gray-100 text-gray-400 hover:bg-gray-200';
      case 'outside':
        return 'bg-white text-gray-400';
      default:
        return 'bg-white text-gray-900 hover:bg-gray-100';
    }
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <DateSelector currentDate={currentDate} onChange={changeMonth} formatString="MMMM yyyy" />
      <div className="grid grid-cols-7 gap-2">
        {weekdays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
        {monthData.map(({ day, date, status }, index) => (
          <Button
            key={index}
            variant="ghost"
            className={`p-0 h-auto aspect-square flex items-center justify-center text-sm font-medium ${getStatusColor(status)}`}
            onClick={() => date && onDateSelect(date)}
            disabled={status === 'outside'}
          >
            {day !== null && (
              <span className="w-full h-full flex items-center justify-center">
                {day}
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}

function YearlyOverview({ currentYear, changeYear, dailyTasks, onDateSelect }: {
  currentYear: number;
  changeYear: (amount: number) => void;
  dailyTasks: DailyTasks;
  onDateSelect: (date: Date) => void;
}) {
  const getYearData = () => {
    const startDate = startOfYear(new Date(currentYear, 0, 1));
    const endDate = new Date(currentYear, 11, 31);
    const today = new Date();

    return eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
      const dateKey = format(date, 'yyyy-MM-dd');

      if (date > today) {
        return { date, status: 'future' };
      }

      const dayTasks = dailyTasks[dateKey] || {};
      const completedTasks = Object.values(dayTasks).filter(Boolean).length;
      const totalTasks = Object.keys(dayTasks).length;

      if (completedTasks === totalTasks && totalTasks > 0) {
        return { date, status: 'completed' };
      } else if (completedTasks > 0) {
        return { date, status: 'partial' };
      } else {
        return { date, status: 'missed' };
      }
    });
  };

  const yearData = getYearData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'partial':
        return 'bg-green-500/50';
      case 'missed':
        return 'bg-gray-200';
      case 'future':
        return 'bg-gray-100';
      default:
        return 'bg-gray-100';
    }
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={() => changeYear(-1)} aria-label="Previous Year">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{currentYear}</span>
        <Button variant="outline" size="icon" onClick={() => changeYear(1)} aria-label="Next Year">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="w-full">
        <div className="grid grid-cols-12 gap-1 mb-2">
          {months.map((month) => (
            <div key={month} className="text-center text-xs font-medium text-gray-500">
              {month}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-53 gap-[1px]">
          {yearData.map(({ date, status }, index) => (
            <div
              key={index}
              className={`w-full h-full aspect-square ${getStatusColor(status)} cursor-pointer`}
              style={{ gridRow: date.getDay() === 0 ? 7 : date.getDay() }}
              onClick={() => onDateSelect(date)}
              title={`${format(date, 'MMM d, yyyy')}: ${status}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TaskTrackingApp() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTasks>({});
  const [activeTab, setActiveTab] = useState("daily");

  useEffect(() => {
    const savedTasks = localStorage.getItem('dailyTasks');
    if (savedTasks) {
      setDailyTasks(JSON.parse(savedTasks));
    }
    const savedTaskList = localStorage.getItem('taskList');
    if (savedTaskList) {
      setTasks(JSON.parse(savedTaskList));
    }
  }, []);

  const updateTask = (date: string, taskId: number, completed: boolean) => {
    setDailyTasks((prevDailyTasks) => {
      const newDailyTasks = {
        ...prevDailyTasks,
        [date]: {
          ...(prevDailyTasks[date] || {}),
          [taskId]: completed,
        },
      };
      localStorage.setItem('dailyTasks', JSON.stringify(newDailyTasks));
      return newDailyTasks;
    });
  };

  const updateTaskName = (taskId: number, newName: string) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.id === taskId ? { ...task, name: newName } : task
      );
      localStorage.setItem('taskList', JSON.stringify(updatedTasks));
      return updatedTasks;
    });
  };

  const moveTaskToDate = (taskId: number, newDate: Date, currentDate: Date) => {
    const newDateKey = format(newDate, 'yyyy-MM-dd');
    const currentDateKey = format(currentDate, 'yyyy-MM-dd');

    setDailyTasks((prevDailyTasks) => {
      const { [taskId]: _, ...remainingTasks } = prevDailyTasks[currentDateKey] || {};

      const updatedTasksForNewDate = {
        ...prevDailyTasks[newDateKey],
        [taskId]: prevDailyTasks[currentDateKey][taskId] || false,
      };

      const newDailyTasks = {
        ...prevDailyTasks,
        [currentDateKey]: remainingTasks,
        [newDateKey]: updatedTasksForNewDate,
      };

      localStorage.setItem('dailyTasks', JSON.stringify(newDailyTasks));
      return newDailyTasks;
    });
  };

  const addTask = (name: string, date: Date) => {
    const newTask = { id: Date.now(), name };
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, newTask];
      localStorage.setItem('taskList', JSON.stringify(updatedTasks));
      return updatedTasks;
    });

    setDailyTasks((prevDailyTasks) => {
      const newDailyTasks = { ...prevDailyTasks };
      const dateKey = format(date, 'yyyy-MM-dd');
      newDailyTasks[dateKey] = {
        ...(newDailyTasks[dateKey] || {}),
        [newTask.id]: false,
      };
      localStorage.setItem('dailyTasks', JSON.stringify(newDailyTasks));
      return newDailyTasks;
    });
  };

  const removeTask = (id: number, date: Date) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter((task) => task.id !== id);
      localStorage.setItem('taskList', JSON.stringify(updatedTasks));
      return updatedTasks;
    });

    setDailyTasks((prevDailyTasks) => {
      const newDailyTasks = { ...prevDailyTasks };
      const dateKey = format(date, 'yyyy-MM-dd');
      if (newDailyTasks[dateKey]) {
        const { [id]: _, ...rest } = newDailyTasks[dateKey];
        newDailyTasks[dateKey] = rest;
      }
      localStorage.setItem('dailyTasks', JSON.stringify(newDailyTasks));
      return newDailyTasks;
    });
  };

  const changeDate = (amount: number) => {
    setCurrentDate((prevDate) => addDays(prevDate, amount));
  };

  const changeMonth = (amount: number) => {
    setCurrentDate((prevDate) => addMonths(prevDate, amount));
  };

  const changeYear = (amount: number) => {
    setCurrentDate((prevDate) => addYears(prevDate, amount));
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    setActiveTab("daily");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Track Tasks</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Overview</TabsTrigger>
            <TabsTrigger value="yearly">Yearly Overview</TabsTrigger>
          </TabsList>
          <TabsContent value="daily">
            <TaskTracker
              currentDate={currentDate}
              tasks={tasks}
              dailyTasks={dailyTasks}
              updateTask={updateTask}
              updateTaskName={updateTaskName}
              moveTaskToDate={moveTaskToDate}
              addTask={addTask}
              removeTask={removeTask}
              changeDate={changeDate}
            />
          </TabsContent>
          <TabsContent value="monthly">
            <MonthlyOverview
              currentDate={currentDate}
              changeMonth={changeMonth}
              dailyTasks={dailyTasks}
              onDateSelect={handleDateSelect}
            />
          </TabsContent>
          <TabsContent value="yearly">
            <YearlyOverview
              currentYear={currentDate.getFullYear()}
              changeYear={changeYear}
              dailyTasks={dailyTasks}
              onDateSelect={handleDateSelect}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
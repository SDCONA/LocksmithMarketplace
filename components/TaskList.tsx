import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  assignee: {
    name: string;
    avatar?: string;
  };
  dueDate: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onTaskToggle?: (taskId: string) => void;
}

export function TaskList({ tasks, onTaskToggle }: TaskListProps) {
  const [localTasks, setLocalTasks] = useState(tasks);

  const handleTaskToggle = (taskId: string) => {
    setLocalTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    onTaskToggle?.(taskId);
  };

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {localTasks.map((task) => (
          <div key={task.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <Checkbox 
              checked={task.completed}
              onCheckedChange={() => handleTaskToggle(task.id)}
            />
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </span>
                <Badge className={priorityColors[task.priority]} variant="secondary">
                  {task.priority}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{task.dueDate}</span>
                {isOverdue(task.dueDate) && !task.completed && (
                  <>
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">Overdue</span>
                  </>
                )}
              </div>
            </div>
            
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
              <AvatarFallback className="text-xs">
                {task.assignee.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
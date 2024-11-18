import React from 'react';
import { Task } from '../../types';
import { Clock, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  projectId: string;
}

export function TaskList({ tasks, onTaskClick }: TaskListProps) {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending-review':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          onClick={() => onTaskClick(task)}
          className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-900">{task.name}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
              {task.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-4">{task.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{format(new Date(task.startDate), 'MMM d, yyyy')}</span>
            </div>

            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>{task.assignedTo?.name || 'Unassigned'}</span>
            </div>

            {task.isRecurring && (
              <div className="flex items-center col-span-2">
                <Clock className="h-4 w-4 mr-2" />
                <span>Recurring {task.recurringInterval}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
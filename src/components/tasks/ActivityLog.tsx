import React from 'react';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';

interface ActivityLogEntry {
  id: string;
  taskId: string;
  type: 'status_change' | 'comment' | 'file_upload' | 'assignment';
  description: string;
  createdAt: string;
  userId: string;
  userName: string;
}

interface ActivityLogProps {
  taskId: string;
}

// Mock data - will be replaced with Supabase data
const mockActivities: ActivityLogEntry[] = [
  {
    id: '1',
    taskId: '1',
    type: 'status_change',
    description: 'Changed status from Pending to In Progress',
    createdAt: '2024-03-01T10:00:00Z',
    userId: '1',
    userName: 'John Doe'
  },
  {
    id: '2',
    taskId: '1',
    type: 'comment',
    description: 'Added a comment',
    createdAt: '2024-03-02T14:30:00Z',
    userId: '2',
    userName: 'Jane Smith'
  }
];

export function ActivityLog({ taskId }: ActivityLogProps) {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {mockActivities.map((activity, index) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {index < mockActivities.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                    <Activity className="h-5 w-5 text-gray-500" />
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {activity.description}{' '}
                      <span className="font-medium text-gray-900">
                        by {activity.userName}
                      </span>
                    </p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
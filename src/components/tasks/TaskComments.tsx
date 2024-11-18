import React from 'react';
import { format } from 'date-fns';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

interface TaskCommentsProps {
  taskId: string;
}

// Mock data - will be replaced with Supabase data
const mockComments: Comment[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Doe',
    content: 'Initial requirements gathered',
    createdAt: '2024-03-01T10:00:00Z'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Jane Smith',
    content: 'Started working on the design',
    createdAt: '2024-03-02T14:30:00Z'
  }
];

export function TaskComments({ taskId }: TaskCommentsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-500">Comments</h3>
      <div className="space-y-4">
        {mockComments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                {comment.userName}
              </span>
              <span className="text-xs text-gray-500">
                {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            <p className="text-sm text-gray-600">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
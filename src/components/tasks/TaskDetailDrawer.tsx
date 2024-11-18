import React, { useState } from 'react';
import { X, Upload, MessageSquare, Activity, Clock } from 'lucide-react';
import { Task } from '../../types';
import { supabase } from '../../lib/supabase';
import { useNotificationStore } from '../../stores/notificationStore';
import { TaskComments } from './TaskComments';
import { ActivityLog } from './ActivityLog';
import { TaskTimer } from './TaskTimer';

interface TaskDetailDrawerProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  isOperationsManager: boolean;
}

export function TaskDetailDrawer({
  task,
  isOpen,
  onClose,
  onStatusChange,
  isOperationsManager,
}: TaskDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (newStatus === 'completed' && !isOperationsManager) {
      alert('Only Operations Managers can mark tasks as completed');
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (error) throw error;

      if (newStatus === 'pending-review' && task.assignedTo) {
        addNotification({
          id: crypto.randomUUID(),
          userId: task.assignedTo.id,
          title: 'Task Status Update',
          message: `Task "${task.name}" has been marked for review`,
          type: 'status_change',
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      onStatusChange(task.id, newStatus);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { error } = await supabase.storage
        .from('task-attachments')
        .upload(`${task.id}/${file.name}`, file);

      if (error) throw error;

      // Add file reference to task activity log
      await supabase.from('task_activities').insert({
        task_id: task.id,
        type: 'file_upload',
        description: `Uploaded file: ${file.name}`,
        user_id: task.assignedTo?.id
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      // Add comment to task comments
      const { error: commentError } = await supabase
        .from('task_comments')
        .insert({
          task_id: task.id,
          content: comment,
          user_id: task.assignedTo?.id
        });

      if (commentError) throw commentError;

      // Add comment to activity log
      const { error: activityError } = await supabase
        .from('task_activities')
        .insert({
          task_id: task.id,
          type: 'comment',
          description: 'Added a comment',
          user_id: task.assignedTo?.id
        });

      if (activityError) throw activityError;

      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="relative w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              <div className="flex-1 h-0 overflow-y-auto">
                <div className="py-6 px-4 bg-indigo-700 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-white">{task.name}</h2>
                    <button
                      type="button"
                      className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                      onClick={onClose}
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="flex border-b border-gray-200">
                  <button
                    className={`flex-1 py-4 px-4 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'details'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('details')}
                  >
                    Details
                  </button>
                  <button
                    className={`flex-1 py-4 px-4 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'activity'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('activity')}
                  >
                    Activity
                  </button>
                </div>

                <div className="px-4 py-4 sm:px-6">
                  {activeTab === 'details' ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <div className="mt-2 space-x-2">
                          {['pending', 'in-progress', 'pending-review', 'completed'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(status as Task['status'])}
                              disabled={status === 'completed' && !isOperationsManager}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                task.status === status
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              } ${status === 'completed' && !isOperationsManager ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {status.replace('-', ' ').toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {task.isRecurring && (
                        <TaskTimer
                          interval={task.recurringInterval || 'weekly'}
                          startDate={task.startDate}
                        />
                      )}

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Description</h3>
                        <p className="mt-2 text-sm text-gray-900">{task.description}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Attachments</h3>
                        <div className="mt-2">
                          <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <Upload className="h-5 w-5 mr-2" />
                            Upload File
                            <input
                              type="file"
                              className="hidden"
                              onChange={handleFileUpload}
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Comments</h3>
                        <form onSubmit={handleCommentSubmit} className="mt-2">
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                            placeholder="Add a comment..."
                          />
                          <div className="mt-2 flex justify-end">
                            <button
                              type="submit"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Comment
                            </button>
                          </div>
                        </form>
                        <TaskComments taskId={task.id} />
                      </div>
                    </div>
                  ) : (
                    <ActivityLog taskId={task.id} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
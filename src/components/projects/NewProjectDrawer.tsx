import React, { useState } from 'react';
import { X, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { generateProjectTasks } from '../../lib/templates';
import { supabase } from '../../lib/supabase';
import { useNotificationStore } from '../../stores/notificationStore';

interface NewProjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: any) => void;
}

export function NewProjectDrawer({ isOpen, onClose, onSubmit }: NewProjectDrawerProps) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    projectManager: '',
  });

  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create project in Supabase
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            name: formData.name,
            start_date: formData.startDate,
            end_date: formData.endDate,
            project_manager: formData.projectManager,
            status: 'active',
            progress: 0
          }
        ])
        .select()
        .single();

      if (projectError) throw projectError;

      // Generate tasks from templates
      const tasks = generateProjectTasks(
        project.id,
        formData.startDate,
        formData.endDate
      );

      // Insert tasks into Supabase
      const { error: tasksError } = await supabase
        .from('tasks')
        .insert(tasks);

      if (tasksError) throw tasksError;

      // Create notification
      addNotification({
        id: crypto.randomUUID(),
        userId: formData.projectManager,
        title: 'New Project Assigned',
        message: `You have been assigned as the Project Manager for ${formData.name}`,
        type: 'task_update',
        read: false,
        createdAt: new Date().toISOString()
      });

      onSubmit(project);
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      // Handle error (show error message to user)
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
                    <h2 className="text-lg font-medium text-white">New Project</h2>
                    <button
                      type="button"
                      className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                      onClick={onClose}
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
                  <div className="px-4 sm:px-6">
                    <div className="space-y-6 pt-6 pb-5">
                      <div>
                        <label htmlFor="project-name" className="block text-sm font-medium text-gray-900">
                          Project Name
                        </label>
                        <input
                          type="text"
                          id="project-name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-900">
                          Start Date
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="start-date"
                            required
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="pl-10 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-900">
                          End Date
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="end-date"
                            required
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="pl-10 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="project-manager" className="block text-sm font-medium text-gray-900">
                          Project Manager
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Users className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            id="project-manager"
                            required
                            value={formData.projectManager}
                            onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                            className="pl-10 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="">Select a Project Manager</option>
                            <option value="1">John Doe</option>
                            <option value="2">Jane Smith</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 px-4 py-4 flex justify-end space-x-2 border-t bg-gray-50">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 border border-gray-300 rounded-md"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 border border-transparent rounded-md"
                    >
                      Create Project
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
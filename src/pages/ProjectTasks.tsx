import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';
import { TaskList } from '../components/tasks/TaskList';
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer';
import { Task, Project } from '../types';
import { useAuthStore } from '../stores/authStore';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

export function ProjectTasks() {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { roles } = useAuthStore();

  const isOperationsManager = roles.includes('Operations_Manager');

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*, project_manager:users(*)')
          .eq('id', projectId)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);

        // Fetch project tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*, assigned_to:users(*)')
          .eq('project_id', projectId)
          .order('start_date', { ascending: true });

        if (tasksError) throw tasksError;
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectAndTasks();
  }, [projectId]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    if (newStatus === 'completed' && !isOperationsManager) {
      alert('Only Operations Managers can mark tasks as completed');
      return;
    }
    handleTaskUpdate(taskId, { status: newStatus });
  };

  if (!project) return null;

  return (
    <div>
      <div className="bg-white shadow rounded-lg mb-6 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>
                  {format(new Date(project.startDate), 'MMM d, yyyy')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span>{project.projectManager.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="mr-4">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 rounded-full h-2"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              project.status === 'active' ? 'bg-green-100 text-green-800' :
              project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {project.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <TaskList
        tasks={tasks}
        onTaskClick={handleTaskClick}
        projectId={projectId}
      />
      
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={handleStatusChange}
          isOperationsManager={isOperationsManager}
        />
      )}
    </div>
  );
}
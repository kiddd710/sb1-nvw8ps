import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ProjectGrid } from '../components/dashboard/ProjectGrid';
import { ProjectFilters } from '../components/dashboard/ProjectFilters';
import { NewProjectDrawer } from '../components/projects/NewProjectDrawer';
import { useAuthStore } from '../stores/authStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Project } from '../types';

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isNewProjectDrawerOpen, setIsNewProjectDrawerOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { roles } = useAuthStore();

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchProjects();
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_manager:users(*)');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const canCreateProject = roles.includes('Project_Workflow_Project_Managers');

  const handleCreateProject = async (projectData: any) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;
      setProjects([...projects, data]);
      setIsNewProjectDrawerOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        {canCreateProject && (
          <button
            onClick={() => setIsNewProjectDrawerOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Project
          </button>
        )}
      </div>

      <ProjectFilters
        onSearch={setSearchQuery}
        onStatusFilter={setStatusFilter}
      />

      <ProjectGrid projects={filteredProjects} />

      <NewProjectDrawer
        isOpen={isNewProjectDrawerOpen}
        onClose={() => setIsNewProjectDrawerOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
import { Task } from '../types';

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  duration: number; // in days
  phase: string;
  order: number;
  isRecurring: boolean;
  recurringInterval?: string;
}

export interface PhaseTemplate {
  id: string;
  name: string;
  order: number;
  tasks: TaskTemplate[];
}

// Mock data - will be replaced with Supabase data
export const projectPhaseTemplates: PhaseTemplate[] = [
  {
    id: '1',
    name: 'Planning',
    order: 1,
    tasks: [
      {
        id: '1',
        name: 'Project Kickoff',
        description: 'Initial project meeting with stakeholders',
        duration: 1,
        phase: 'Planning',
        order: 1,
        isRecurring: false
      },
      {
        id: '2',
        name: 'Requirements Gathering',
        description: 'Document project requirements',
        duration: 5,
        phase: 'Planning',
        order: 2,
        isRecurring: false
      }
    ]
  },
  {
    id: '2',
    name: 'Execution',
    order: 2,
    tasks: [
      {
        id: '3',
        name: 'Weekly Status Meeting',
        description: 'Team status update',
        duration: 1,
        phase: 'Execution',
        order: 1,
        isRecurring: true,
        recurringInterval: 'weekly'
      }
    ]
  }
];

export function generateProjectTasks(
  projectId: string,
  startDate: string,
  endDate: string
): Task[] {
  const tasks: Task[] = [];
  let currentDate = new Date(startDate);

  projectPhaseTemplates.forEach(phase => {
    phase.tasks.forEach(template => {
      const taskEndDate = new Date(currentDate);
      taskEndDate.setDate(taskEndDate.getDate() + template.duration);

      tasks.push({
        id: crypto.randomUUID(),
        projectId,
        name: template.name,
        description: template.description,
        assignedTo: null,
        status: 'pending',
        startDate: currentDate.toISOString().split('T')[0],
        endDate: taskEndDate.toISOString().split('T')[0],
        isRecurring: template.isRecurring,
        recurringInterval: template.recurringInterval
      });

      currentDate = new Date(taskEndDate);
      currentDate.setDate(currentDate.getDate() + 1);
    });
  });

  return tasks;
}
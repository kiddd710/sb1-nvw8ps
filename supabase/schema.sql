-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- Users table (mirrors Azure AD users)
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text not null,
  azure_id text unique not null,
  role text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Projects table
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  start_date date not null,
  end_date date not null,
  project_manager_id uuid references public.users(id) not null,
  status text not null check (status in ('active', 'completed', 'on-hold')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tasks table
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) not null,
  name text not null,
  description text,
  assigned_to_id uuid references public.users(id),
  status text not null check (status in ('pending', 'in-progress', 'pending-review', 'completed')),
  start_date date not null,
  end_date date not null,
  is_recurring boolean not null default false,
  recurring_interval text check (recurring_interval in ('daily', 'weekly', 'monthly')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Task Comments
create table public.task_comments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references public.tasks(id) not null,
  user_id uuid references public.users(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Task Activities (for audit log)
create table public.task_activities (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references public.tasks(id) not null,
  user_id uuid references public.users(id) not null,
  type text not null check (type in ('status_change', 'comment', 'file_upload', 'assignment')),
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notifications
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) not null,
  title text not null,
  message text not null,
  type text not null check (type in ('task_update', 'mention', 'status_change')),
  read boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Task Templates
create table public.task_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  duration integer not null, -- in days
  phase text not null,
  order_number integer not null,
  is_recurring boolean not null default false,
  recurring_interval text check (recurring_interval in ('daily', 'weekly', 'monthly')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Phase Templates
create table public.phase_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  order_number integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

-- Users can read all users
create policy "Users can read all users"
  on public.users for select
  to authenticated
  using (true);

-- Project policies
create policy "Users can read projects they have access to"
  on public.projects for select
  to authenticated
  using (
    auth.uid() = project_manager_id or
    exists (
      select 1 from public.tasks
      where tasks.project_id = projects.id
      and tasks.assigned_to_id = auth.uid()
    )
  );

create policy "Project managers can create projects"
  on public.projects for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'Project_Workflow_Project_Managers'
    )
  );

-- Task policies
create policy "Users can read tasks they have access to"
  on public.tasks for select
  to authenticated
  using (
    exists (
      select 1 from public.projects
      where projects.id = tasks.project_id
      and (
        projects.project_manager_id = auth.uid() or
        tasks.assigned_to_id = auth.uid()
      )
    )
  );

create policy "Project managers can create tasks"
  on public.tasks for insert
  to authenticated
  with check (
    exists (
      select 1 from public.projects
      where projects.id = tasks.project_id
      and projects.project_manager_id = auth.uid()
    )
  );

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_activities enable row level security;
alter table public.notifications enable row level security;
alter table public.task_templates enable row level security;
alter table public.phase_templates enable row level security;

-- Create indexes
create index idx_tasks_project_id on public.tasks(project_id);
create index idx_tasks_assigned_to_id on public.tasks(assigned_to_id);
create index idx_task_comments_task_id on public.task_comments(task_id);
create index idx_task_activities_task_id on public.task_activities(task_id);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_unread on public.notifications(user_id) where not read;

-- Functions
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers
create trigger projects_updated_at
  before update on public.projects
  for each row
  execute function public.update_updated_at();

create trigger tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.update_updated_at();
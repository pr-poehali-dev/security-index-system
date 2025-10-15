// src/types/tasks.ts
// Описание: Типы данных для задач - статусы, приоритеты и комментарии
export type TaskStatus = 'new' | 'assigned' | 'in_progress' | 'under_review' | 'completed' | 'cancelled';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskSource = 'manual' | 'incident' | 'checklist' | 'certification' | 'examination' | 'automated';
export type TaskType = 'inspection' | 'corrective_action' | 'preventive_action' | 'certification' | 'training' | 'audit' | 'other';

export interface Task {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  type: TaskType;
  source: TaskSource;
  sourceId?: string;
  createdBy: string;
  createdByName: string;
  assignedTo?: string;
  assignedToName?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  objectId?: string;
  objectName?: string;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  timeline?: TaskTimelineEvent[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
}

export interface TaskTimelineEvent {
  id: string;
  taskId: string;
  eventType: 'created' | 'assigned' | 'status_changed' | 'commented' | 'completed' | 'reopened';
  description: string;
  userId: string;
  userName: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
  completedThisMonth: number;
  avgCompletionTime: number;
}
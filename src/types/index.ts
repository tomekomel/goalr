export type GoalPeriod = 'weekly' | 'monthly' | 'yearly';
export type GoalStatus = 'planned' | 'to-do' | 'in-progress' | 'done' | 'archived';

export interface Goal {
  id: string;
  title: string;
  description: string;
  period: GoalPeriod;
  status: GoalStatus;
  progress: number; // 0-100
  createdAt: number;
}
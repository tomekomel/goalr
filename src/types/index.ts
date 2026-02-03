export type GoalPeriod = 'weekly' | 'monthly' | 'yearly';
export type GoalStatus = 'planned' | 'to-do' | 'in-progress' | 'done' | 'archived';

export interface Goal {
  id: string;
  title: string;
  description: string;
  period: GoalPeriod;
  status: GoalStatus;
  createdAt: number;
}

export interface Column {
  id: GoalPeriod;
  title: string;
}

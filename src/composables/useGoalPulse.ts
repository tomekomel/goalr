import { ref } from 'vue';
import { supabase } from '../supabase';
import type { Goal } from '../types';
import { useI18n } from './useI18n';

export interface PulseResponse {
  message: string;
  riskLevel: 'none' | 'low' | 'high';
}

export function useGoalPulse() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const { locale } = useI18n();

  async function getGoalPulse(goal: Goal, siblingGoals: Goal[]): Promise<PulseResponse | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const now = Date.now();
      const daysSinceCreated = Math.floor((now - goal.createdAt) / (1000 * 60 * 60 * 24));

      let daysUntilDeadline: number | null = null;
      if (goal.targetDate) {
        const deadline = new Date(goal.targetDate).getTime();
        daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      }

      const siblingGoalsSummary = {
        total: siblingGoals.length,
        inProgress: siblingGoals.filter(g => g.status === 'in-progress').length,
        done: siblingGoals.filter(g => g.status === 'done').length,
      };

      const { data, error: fnError } = await supabase.functions.invoke('goal-pulse', {
        body: {
          goal: {
            title: goal.title,
            description: goal.description,
            status: goal.status,
            progress: goal.progress,
            targetDate: goal.targetDate,
            period: goal.period,
            weekNumber: goal.weekNumber,
          },
          daysSinceCreated,
          daysUntilDeadline,
          siblingGoalsSummary,
          locale: locale.value,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to get coaching');
      }

      return data as PulseResponse;
    } catch (e: any) {
      error.value = e.message || 'Failed to get coaching';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  return { getGoalPulse, isLoading, error };
}

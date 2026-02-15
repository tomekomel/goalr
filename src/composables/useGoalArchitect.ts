import { ref } from 'vue';
import { supabase } from '../supabase';
import type { GoalPeriod } from '../types';
import { useI18n } from './useI18n';

export interface GeneratedGoal {
  title: string;
  description: string;
  period: GoalPeriod;
  weekNumber?: number;
  targetDate: string;
}

export function useGoalArchitect() {
  const isGenerating = ref(false);
  const error = ref<string | null>(null);
  const { locale } = useI18n();

  async function generateGoals(description: string): Promise<GeneratedGoal[]> {
    isGenerating.value = true;
    error.value = null;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-goals', {
        body: { description, locale: locale.value },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to generate goals');
      }

      return data.goals as GeneratedGoal[];
    } catch (e: any) {
      error.value = e.message || 'Failed to generate goals';
      return [];
    } finally {
      isGenerating.value = false;
    }
  }

  return { generateGoals, isGenerating, error };
}

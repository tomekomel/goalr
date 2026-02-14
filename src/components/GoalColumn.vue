<script setup lang="ts">
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';
import { Target, Inbox } from 'lucide-vue-next';
import type { Goal, GoalPeriod } from '../types';
import GoalCard from './GoalCard.vue';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();

const props = withDefaults(defineProps<{
  title: string;
  period: GoalPeriod;
  goals: Goal[];
  variant?: 'default' | 'highlight' | 'compact';
  emptyMessage?: string;
  isCurrentWeek?: boolean;
}>(), {
  variant: 'default',
  emptyMessage: 'No goals here yet.',
  isCurrentWeek: false,
});

const emit = defineEmits<{
  (e: 'update:goals', value: Goal[]): void;
  (e: 'delete-goal', id: string): void;
  (e: 'edit-goal', goal: Goal): void;
}>();

// Local copy for draggable to mutate
const localGoals = ref<Goal[]>([...props.goals]);

// Sync local copy when props change (e.g. from parent re-fetch/filter)
watch(() => props.goals, (newGoals) => {
  localGoals.value = [...newGoals];
}, { deep: true });

const onDragChange = () => {
  emit('update:goals', [...localGoals.value]);
};

const containerClasses = {
  'default': 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 p-3',
  'highlight': 'bg-transparent border-transparent py-3 px-0',
  'compact': 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 p-4',
};

const headerClasses = {
  'default': 'text-slate-700 dark:text-slate-300',
  'highlight': 'text-slate-900 dark:text-slate-100',
  'compact': 'text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wide',
};

const gridClasses = {
  'default': 'grid-cols-1',
  'highlight': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  'compact': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};
</script>

<template>
  <div 
    class="flex flex-col w-full rounded-xl border transition-colors duration-300"
    :class="[
      containerClasses[variant],
      variant === 'default' ? 'h-full min-h-[300px]' : 'h-auto min-h-[80px]',
      isCurrentWeek ? 'border-l-3 border-l-emerald-500' : '',
      variant === 'compact' && !isCurrentWeek ? 'opacity-80' : ''
    ]"
  >
    <div class="flex items-center justify-between mb-2.5 px-1">
      <h2 class="font-semibold text-sm flex items-center gap-1.5" :class="headerClasses[variant]">
        <Target v-if="variant === 'highlight'" :size="16" class="text-emerald-600" />
        {{ title }}
        <span v-if="isCurrentWeek" class="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full">{{ t('column.current') }}</span>
      </h2>
      <span class="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-400 border border-slate-200 dark:border-slate-700">
        {{ localGoals.length }}
      </span>
    </div>

    <draggable
      v-model="localGoals"
      group="goals"
      item-key="id"
      class="flex-1 grid content-start gap-4 min-h-[60px]"
      :class="gridClasses[variant]"
      ghost-class="ghost-card"
      @change="onDragChange"
    >
      <template #item="{ element }">
        <GoalCard
          :goal="element"
          @delete="$emit('delete-goal', $event)"
          @edit="$emit('edit-goal', $event)"
        />
      </template>
      <template #footer>
        <div v-if="localGoals.length === 0" class="col-span-full flex flex-col items-center justify-center py-5 text-center">
          <Inbox :size="22" class="text-slate-300 dark:text-slate-600 mb-1.5" />
          <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">{{ emptyMessage }}</p>
        </div>
      </template>
    </draggable>
  </div>
</template>

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
  (e: 'pulse-goal', goal: Goal): void;
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
  'default': 'bg-stone-100/50 dark:bg-[#1a1818]/50 border-stone-200/50 dark:border-[rgba(255,255,255,0.065)] p-3',
  'highlight': 'bg-transparent border-transparent py-3 px-0',
  'compact': 'bg-white dark:bg-[#222020] border-stone-100 dark:border-[rgba(255,255,255,0.065)] p-4',
};

const headerClasses = {
  'default': 'text-[#383434] dark:text-[#a09690]',
  'highlight': 'text-[#222020] dark:text-[#f3ede8]',
  'compact': 'text-[#a09690] text-sm uppercase tracking-wide',
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
      isCurrentWeek ? 'border-l-3 border-l-green-500' : '',
      variant === 'compact' && !isCurrentWeek ? 'opacity-80' : ''
    ]"
  >
    <div class="flex items-center justify-between mb-2.5 px-1">
      <h2 class="font-semibold text-sm flex items-center gap-1.5" :class="headerClasses[variant]">
        <Target v-if="variant === 'highlight'" :size="16" class="text-[#5bbf80]" />
        {{ title }}
        <span v-if="isCurrentWeek" class="text-[10px] font-semibold text-[#5bbf80] bg-[#5bbf80]/10 px-1.5 py-0.5 rounded-full">{{ t('column.current') }}</span>
      </h2>
      <span class="bg-white dark:bg-[#222020] px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#a09690] border border-stone-200 dark:border-[rgba(255,255,255,0.065)]">
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
          @pulse="$emit('pulse-goal', $event)"
        />
      </template>
      <template #footer>
        <div v-if="localGoals.length === 0" class="col-span-full flex flex-col items-center justify-center py-5 text-center">
          <Inbox :size="22" class="text-stone-300 dark:text-[#635d58] mb-1.5" />
          <p class="text-xs text-[#a09690] dark:text-[#635d58] font-medium">{{ emptyMessage }}</p>
        </div>
      </template>
    </draggable>
  </div>
</template>

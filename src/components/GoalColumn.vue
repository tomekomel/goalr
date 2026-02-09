<script setup lang="ts">
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';
import { Target } from 'lucide-vue-next';
import type { Goal, GoalPeriod } from '../types';
import GoalCard from './GoalCard.vue';

const props = withDefaults(defineProps<{
  title: string;
  period: GoalPeriod;
  goals: Goal[];
  variant?: 'default' | 'highlight' | 'compact';
}>(), {
  variant: 'default'
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
  'default': 'bg-slate-100/50 border-slate-200/50 p-4',
  'highlight': 'bg-transparent border-transparent py-4 px-0', // Clean style for Monthly
  'compact': 'bg-white border-slate-100 p-4', // Cleaner style for Weekly rows
};

const headerClasses = {
  'default': 'text-slate-700',
  'highlight': 'text-slate-900',
  'compact': 'text-slate-500 text-sm uppercase tracking-wide',
};

const gridClasses = {
  'default': 'grid-cols-1',
  'highlight': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  'compact': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
};
</script>

<template>
  <div 
    class="flex flex-col w-full rounded-xl border transition-colors duration-300"
    :class="[
      containerClasses[variant], 
      variant === 'default' ? 'h-full min-h-[500px]' : 'h-auto min-h-[150px]'
    ]"
  >
    <div class="flex items-center justify-between mb-4 px-2">
      <h2 class="font-bold flex items-center gap-2" :class="headerClasses[variant]">
        <Target v-if="variant === 'highlight'" :size="20" class="text-emerald-600" />
        {{ title }}
      </h2>
      <span class="bg-white px-2.5 py-0.5 rounded-full text-xs font-semibold text-slate-400 border border-slate-200 shadow-sm">
        {{ localGoals.length }}
      </span>
    </div>

    <draggable
      v-model="localGoals"
      group="goals"
      item-key="id"
      class="flex-1 grid content-start gap-3 min-h-[100px]"
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
    </draggable>
  </div>
</template>

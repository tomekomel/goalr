<script setup lang="ts">
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';
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
  'default': 'bg-slate-100/50 border-slate-200/50',
  'highlight': 'bg-transparent border-transparent', // Clean style for Monthly
  'compact': 'bg-white border-slate-100', // Cleaner style for Weekly rows
};

const headerClasses = {
  'default': 'text-slate-700',
  'highlight': 'text-slate-900', // Darker text for emphasis without gradient
  'compact': 'text-slate-500 text-sm uppercase tracking-wide',
};
</script>

<template>
  <div 
    class="flex flex-col w-full rounded-xl p-4 border transition-colors duration-300"
    :class="[
      containerClasses[variant], 
      variant === 'default' ? 'h-full min-h-[500px]' : 'h-auto min-h-[150px]'
    ]"
  >
    <div class="flex items-center justify-between mb-4 px-2">
      <h2 class="font-bold flex items-center gap-2" :class="headerClasses[variant]">
        <span v-if="variant === 'highlight'" class="text-lg">🎯</span>
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
      class="flex-1 flex flex-wrap content-start gap-3 min-h-[100px]"
      ghost-class="ghost-card"
      @change="onDragChange"
    >
      <template #item="{ element }">
        <div class="w-full sm:w-[280px]"> <!-- Wrapper to control card width -->
          <GoalCard
            :goal="element"
            @delete="$emit('delete-goal', $event)"
            @edit="$emit('edit-goal', $event)"
          />
        </div>
      </template>
    </draggable>
  </div>
</template>

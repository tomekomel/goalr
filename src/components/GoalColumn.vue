<script setup lang="ts">
import draggable from 'vuedraggable';
import type { Goal, GoalPeriod } from '../types';
import GoalCard from './GoalCard.vue';

const props = defineProps<{
  title: string;
  period: GoalPeriod;
  goals: Goal[];
}>();

const emit = defineEmits<{
  (e: 'update:goals', value: Goal[]): void;
  (e: 'delete-goal', id: string): void;
  (e: 'edit-goal', goal: Goal): void;
}>();

const onDragChange = () => {
  // We emit the updated goals list back to parent
  // draggable automatically modifies the local copy of the list
  emit('update:goals', [...props.goals]);
};
</script>

<template>
  <div class="flex flex-col h-full min-h-[500px] w-full max-w-sm rounded-xl bg-slate-100/50 p-4 border border-slate-200/50">
    <div class="flex items-center justify-between mb-6 px-2">
      <h2 class="text-lg font-bold text-slate-700">{{ title }}</h2>
      <span class="bg-white px-2.5 py-0.5 rounded-full text-xs font-semibold text-slate-400 border border-slate-200 shadow-sm">
        {{ goals.length }}
      </span>
    </div>

    <draggable
      :list="goals"
      group="goals"
      item-key="id"
      class="flex-1 space-y-4 min-h-[150px]"
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

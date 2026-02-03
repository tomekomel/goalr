<script setup lang="ts">
import type { Goal, GoalStatus } from '../types';
import { Trash2, Pencil, Circle, CircleDashed, Timer, CheckCircle2, Archive } from 'lucide-vue-next';

const props = defineProps<{
  goal: Goal;
}>();

const emit = defineEmits<{
  (e: 'delete', id: string): void;
  (e: 'edit', goal: Goal): void;
}>();

const statusConfig: Record<GoalStatus, { icon: any, color: string }> = {
  'planned': { icon: Circle, color: 'text-slate-400' },
  'to-do': { icon: CircleDashed, color: 'text-blue-500' },
  'in-progress': { icon: Timer, color: 'text-amber-500' },
  'done': { icon: CheckCircle2, color: 'text-emerald-500' },
  'archived': { icon: Archive, color: 'text-stone-400' },
};
</script>

<template>
  <div class="bg-white p-5 rounded-lg card-shadow border border-slate-100 group relative hover:border-slate-200 transition-colors">
    <!-- Header: Title & Actions -->
    <div class="flex justify-between items-start mb-2 gap-3">
      <h3 class="font-semibold text-slate-800 leading-tight">{{ goal.title }}</h3>
      
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button 
          @click="$emit('edit', goal)"
          class="text-slate-300 hover:text-primary transition-colors p-1"
          title="Edit Goal"
        >
          <Pencil :size="14" />
        </button>
        <button 
          @click="$emit('delete', goal.id)"
          class="text-slate-300 hover:text-red-400 transition-colors p-1"
          title="Delete Goal"
        >
          <Trash2 :size="14" />
        </button>
      </div>
    </div>

    <!-- Description -->
    <p class="text-slate-500 text-sm leading-relaxed mb-4">{{ goal.description }}</p>
    
    <!-- Footer: Date & Status -->
    <div class="flex items-center justify-between pt-2 border-t border-slate-50">
      <!-- Date -->
      <div class="flex items-center gap-2">
        <div class="h-1.5 w-1.5 rounded-full bg-slate-200"></div>
        <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400">
          {{ new Date(goal.createdAt).toLocaleDateString() }}
        </span>
      </div>

      <!-- Minimalist Status Icon -->
      <div :class="['flex items-center justify-center p-1 rounded-full bg-slate-50', statusConfig[goal.status].color]" :title="goal.status">
        <component :is="statusConfig[goal.status].icon" :size="16" stroke-width="2.5" />
      </div>
    </div>
  </div>
</template>

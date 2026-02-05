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

const statusConfig: Record<GoalStatus, { icon: any, color: string, bg: string, barColor?: string }> = {
  'planned': { icon: Circle, color: 'text-slate-500', bg: 'bg-slate-100' },
  'to-do': { icon: CircleDashed, color: 'text-blue-600', bg: 'bg-blue-50' },
  'in-progress': { icon: Timer, color: 'text-amber-600', bg: 'bg-amber-50', barColor: 'bg-amber-500' },
  'done': { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', barColor: 'bg-emerald-500' },
  'archived': { icon: Archive, color: 'text-stone-500', bg: 'bg-stone-100' },
};

const formatStatus = (s: string) => s.split('-').join(' ');
</script>

<template>
  <div class="bg-white p-5 rounded-lg card-shadow border border-slate-100 group relative hover:border-slate-200 transition-colors flex flex-col">
    <!-- Header: Title & Meta -->
    <div class="flex justify-between items-start mb-3 gap-3">
      <h3 class="font-bold text-slate-800 leading-tight text-lg mt-0.5">{{ goal.title }}</h3>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Actions (Visible on Hover) -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-1">
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

        <!-- Status Badge -->
        <div 
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-transparent"
          :class="[statusConfig[goal.status].bg, statusConfig[goal.status].color]"
        >
          <component :is="statusConfig[goal.status].icon" :size="12" stroke-width="3" />
          <span class="text-[10px] font-bold uppercase tracking-wider">{{ formatStatus(goal.status) }}</span>
        </div>
      </div>
    </div>

    <!-- Description -->
    <p class="text-slate-500 text-sm leading-relaxed mb-6">{{ goal.description }}</p>

    <!-- Footer: Date (Status Icon removed as it is now in header) -->
    <div class="flex items-center gap-2 pt-3 border-t border-slate-50 mt-auto">
      <div class="h-1.5 w-1.5 rounded-full bg-slate-200"></div>
      <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400">
        {{ new Date(goal.createdAt).toLocaleDateString() }}
      </span>
    </div>

    <!-- Minimalist Progress Bar at the very bottom -->
    <div v-if="['in-progress', 'done'].includes(goal.status)" class="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-lg">
      <div 
        class="h-full transition-all duration-700 ease-out"
        :class="statusConfig[goal.status].barColor"
        :style="{ width: goal.status === 'done' ? '100%' : `${goal.progress}%` }"
      ></div>
    </div>
  </div>
</template>
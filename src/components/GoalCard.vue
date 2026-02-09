<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import type { Goal, GoalStatus } from '../types';
import { Trash2, Pencil, Circle, CircleDashed, Timer, CheckCircle2, Archive, GripVertical, X } from 'lucide-vue-next';

const props = defineProps<{
  goal: Goal;
}>();

const emit = defineEmits<{
  (e: 'delete', id: string): void;
  (e: 'edit', goal: Goal): void;
}>();

const confirmingDelete = ref(false);
let deleteTimeout: ReturnType<typeof setTimeout> | null = null;

const startDelete = () => {
  confirmingDelete.value = true;
  deleteTimeout = setTimeout(() => {
    confirmingDelete.value = false;
  }, 3000);
};

const confirmDelete = () => {
  if (deleteTimeout) clearTimeout(deleteTimeout);
  confirmingDelete.value = false;
  emit('delete', props.goal.id);
};

const cancelDelete = () => {
  if (deleteTimeout) clearTimeout(deleteTimeout);
  confirmingDelete.value = false;
};

onUnmounted(() => {
  if (deleteTimeout) clearTimeout(deleteTimeout);
});

const statusConfig: Record<GoalStatus, { icon: any, color: string, bg: string, barColor?: string }> = {
  'planned': { icon: Circle, color: 'text-slate-500', bg: 'bg-slate-100' },
  'to-do': { icon: CircleDashed, color: 'text-blue-600', bg: 'bg-blue-50' },
  'in-progress': { icon: Timer, color: 'text-violet-600', bg: 'bg-violet-50', barColor: 'bg-gradient-to-r from-emerald-500 to-emerald-400' },
  'done': { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', barColor: 'bg-gradient-to-r from-emerald-500 to-emerald-400' },
  'archived': { icon: Archive, color: 'text-stone-500', bg: 'bg-stone-100' },
};

const formatStatus = (s: string) => s.split('-').join(' ');
</script>

<template>
  <div class="bg-white p-5 rounded-lg card-shadow border border-slate-100 group relative hover:border-slate-200 transition-colors flex flex-col h-full cursor-grab active:cursor-grabbing">
    <!-- Header: Title + Drag Handle -->
    <div class="flex items-center gap-1.5 mb-1.5">
      <h3 class="font-bold text-slate-800 leading-tight text-lg">{{ goal.title }}</h3>
      <GripVertical :size="16" class="text-slate-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>

    <!-- Meta: Status & Actions -->
    <div class="flex items-center justify-between mb-3">
      <!-- Status Badge -->
      <div
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-transparent"
        :class="[statusConfig[goal.status].bg, statusConfig[goal.status].color]"
      >
        <component :is="statusConfig[goal.status].icon" :size="12" stroke-width="3" />
        <span class="text-xs font-medium uppercase tracking-wider">{{ formatStatus(goal.status) }}</span>
        <span v-if="goal.status === 'in-progress'" class="text-xs font-medium">&middot; {{ goal.progress }}%</span>
      </div>

      <!-- Actions (Visible on Hover) -->
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <template v-if="confirmingDelete">
          <button
            @click="confirmDelete"
            class="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-md transition-colors"
            aria-label="Confirm delete"
          >
            Delete?
          </button>
          <button
            @click="cancelDelete"
            class="text-slate-400 hover:text-slate-600 transition-colors p-1"
            aria-label="Cancel delete"
          >
            <X :size="14" />
          </button>
        </template>
        <template v-else>
          <button
            @click="$emit('edit', goal)"
            class="text-slate-300 hover:text-primary transition-colors p-1 focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-label="Edit goal"
          >
            <Pencil :size="14" />
          </button>
          <button
            @click="startDelete"
            class="text-slate-300 hover:text-red-400 transition-colors p-1 focus-visible:ring-2 focus-visible:ring-red-400 rounded"
            aria-label="Delete goal"
          >
            <Trash2 :size="14" />
          </button>
        </template>
      </div>
    </div>

    <!-- Description -->
    <p v-if="goal.description" class="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2" :title="goal.description">{{ goal.description }}</p>

    <!-- Footer: Date (Status Icon removed as it is now in header) -->
    <div class="flex items-center gap-2 pt-3 border-t border-slate-50 mt-auto">
      <div class="h-1.5 w-1.5 rounded-full bg-slate-200"></div>
      <span class="text-xs uppercase tracking-wider font-medium text-slate-500">
        {{ new Date(goal.createdAt).toLocaleDateString('en-GB') }}
      </span>
    </div>

    <!-- Minimalist Progress Bar at the very bottom -->
    <div v-if="['in-progress', 'done'].includes(goal.status)" class="absolute bottom-0 left-0 right-0 h-1.5 overflow-hidden rounded-b-lg">
      <div 
        class="h-full transition-all duration-700 ease-out"
        :class="statusConfig[goal.status].barColor"
        :style="{ width: goal.status === 'done' ? '100%' : `${goal.progress}%` }"
      ></div>
    </div>
  </div>
</template>
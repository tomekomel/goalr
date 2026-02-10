<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import type { Goal, GoalStatus } from '../types';
import { Trash2, Pencil, Circle, CircleDashed, Timer, CheckCircle2, GripVertical, X } from 'lucide-vue-next';

const props = defineProps<{
  goal: Goal;
}>();

const emit = defineEmits<{
  (e: 'delete', id: string): void;
  (e: 'edit', goal: Goal): void;
  (e: 'start', id: string): void;
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

const statusConfig: Record<string, { icon: any, color: string, bg: string, barColor?: string }> = {
  'planned': { icon: Circle, color: 'text-slate-500', bg: 'bg-slate-100' },
  'to-do': { icon: CircleDashed, color: 'text-blue-600', bg: 'bg-blue-50' },
  'in-progress': { icon: Timer, color: 'text-violet-600', bg: 'bg-violet-50', barColor: 'bg-gradient-to-r from-emerald-500 to-emerald-400' },
  'done': { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', barColor: 'bg-gradient-to-r from-emerald-500 to-emerald-400' },
};

const formatStatus = (s: string) => s.split('-').join(' ');
</script>

<template>
  <div class="bg-white px-3.5 py-3 rounded-lg card-shadow border border-slate-100 group relative hover:border-slate-200 transition-colors flex flex-col h-full cursor-grab active:cursor-grabbing">
    <!-- Header: Title + Drag Handle -->
    <div class="flex items-center gap-1.5 mb-1.5">
      <h3 class="font-semibold text-slate-800 leading-tight text-sm">{{ goal.title }}</h3>
      <GripVertical :size="14" class="text-slate-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>

    <!-- Meta: Status & Actions -->
    <div class="flex items-center justify-between mb-2">
      <!-- Status Badge -->
      <div
        class="flex items-center gap-1 px-2 py-0.5 rounded-full border border-transparent"
        :class="[statusConfig[goal.status].bg, statusConfig[goal.status].color]"
      >
        <component :is="statusConfig[goal.status].icon" :size="10" stroke-width="3" />
        <span class="text-[10px] font-medium uppercase tracking-wider">{{ formatStatus(goal.status) }}</span>
        <span v-if="goal.status === 'in-progress'" class="text-[10px] font-medium">&middot; {{ goal.progress }}%</span>
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
            <X :size="12" />
          </button>
        </template>
        <template v-else>
          <button
            v-if="goal.status === 'planned'"
            @click="$emit('start', goal.id)"
            class="text-[10px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded transition-colors"
            aria-label="Start goal"
          >
            Start
          </button>
          <button
            @click="$emit('edit', goal)"
            class="text-slate-300 hover:text-primary transition-colors p-0.5 focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-label="Edit goal"
          >
            <Pencil :size="12" />
          </button>
          <button
            @click="startDelete"
            class="text-slate-300 hover:text-red-400 transition-colors p-0.5 focus-visible:ring-2 focus-visible:ring-red-400 rounded"
            aria-label="Delete goal"
          >
            <Trash2 :size="12" />
          </button>
        </template>
      </div>
    </div>

    <!-- Description -->
    <p v-if="goal.description" class="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2" :title="goal.description">{{ goal.description }}</p>

    <!-- Footer: Date -->
    <div class="flex items-center gap-1.5 pt-2 border-t border-slate-50 mt-auto">
      <div class="h-1 w-1 rounded-full bg-slate-200"></div>
      <span class="text-[10px] uppercase tracking-wider font-medium text-slate-400">
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
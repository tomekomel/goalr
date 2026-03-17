<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import type { Goal } from '../types';
import { Trash2, Pencil, Circle, CircleDashed, Timer, CheckCircle2, GripVertical, X, Activity } from 'lucide-vue-next';
import { useI18n } from '../composables/useI18n';

const { t, localeCode } = useI18n();

const props = defineProps<{
  goal: Goal;
}>();

const emit = defineEmits<{
  (e: 'delete', id: string): void;
  (e: 'edit', goal: Goal): void;
  (e: 'start', id: string): void;
  (e: 'pulse', goal: Goal): void;
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
  'planned': { icon: Circle, color: 'text-[#a09690]', bg: 'bg-stone-100 dark:bg-[#2d2a2a]' },
  'to-do': { icon: CircleDashed, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
  'in-progress': { icon: Timer, color: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/40', barColor: 'bg-gradient-to-r from-[#5bbf80] to-green-400' },
  'done': { icon: CheckCircle2, color: 'text-[#5bbf80]', bg: 'bg-green-50 dark:bg-[#5bbf80]/10', barColor: 'bg-gradient-to-r from-[#5bbf80] to-green-400' },
};

const getStatusConfig = (status: string) => {
  return (statusConfig[status] || statusConfig['planned'])!;
};

const formatStatus = (s: string) => t(`card.status.${s}`);
</script>

<template>
  <div class="bg-white dark:bg-[#222020] px-3.5 py-3 rounded-lg card-shadow border border-stone-100 dark:border-[rgba(255,255,255,0.065)] group relative hover:border-stone-200 dark:hover:border-[rgba(255,255,255,0.11)] transition-colors flex flex-col h-full cursor-grab active:cursor-grabbing">
    <!-- Header: Title + Drag Handle -->
    <div class="flex items-center gap-1.5 mb-1.5">
      <h3 class="font-semibold text-[#222020] dark:text-[#f3ede8] leading-tight text-sm">{{ goal.title }}</h3>
      <GripVertical :size="14" class="text-stone-300 dark:text-[#635d58] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>

    <!-- Meta: Status & Actions -->
    <div class="flex items-center justify-between mb-2">
      <!-- Status Badge -->
      <div
        class="flex items-center gap-0.5 px-1.5 py-px rounded-full border border-transparent shrink-0 whitespace-nowrap"
        :class="[getStatusConfig(goal.status).bg, getStatusConfig(goal.status).color]"
      >
        <component :is="getStatusConfig(goal.status).icon" :size="8" stroke-width="3" />
        <span class="text-[9px] font-medium uppercase tracking-wider">{{ formatStatus(goal.status) }}</span>
        <span v-if="goal.status === 'in-progress'" class="text-[9px] font-medium">&middot; {{ goal.progress }}%</span>
      </div>

      <!-- Actions (Visible on Hover) -->
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <template v-if="confirmingDelete">
          <button
            @click="confirmDelete"
            class="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-md transition-colors"
            :aria-label="t('card.confirmDelete')"
          >
            {{ t('card.confirmDelete') }}
          </button>
          <button
            @click="cancelDelete"
            class="text-[#a09690] hover:text-[#635d58] dark:hover:text-[#a09690] transition-colors p-1"
            :aria-label="t('card.cancelDelete')"
          >
            <X :size="12" />
          </button>
        </template>
        <template v-else>
          <button
            v-if="goal.status === 'planned'"
            @click="$emit('start', goal.id)"
            class="text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-950/50 hover:bg-green-100 dark:hover:bg-green-950 px-1.5 py-0.5 rounded transition-colors"
            :aria-label="t('card.start')"
          >
            {{ t('card.start') }}
          </button>
          <button
            v-if="['to-do', 'in-progress'].includes(goal.status)"
            @click.stop="$emit('pulse', goal)"
            class="text-stone-300 dark:text-[#635d58] hover:text-green-500 transition-colors p-0.5 focus-visible:ring-2 focus-visible:ring-green-400 rounded"
            :aria-label="t('card.pulse')"
          >
            <Activity :size="12" />
          </button>
          <button
            @click="$emit('edit', goal)"
            class="text-stone-300 dark:text-[#635d58] hover:text-primary transition-colors p-0.5 focus-visible:ring-2 focus-visible:ring-primary rounded"
            :aria-label="t('card.editGoal')"
          >
            <Pencil :size="12" />
          </button>
          <button
            @click="startDelete"
            class="text-stone-300 dark:text-[#635d58] hover:text-red-400 transition-colors p-0.5 focus-visible:ring-2 focus-visible:ring-red-400 rounded"
            :aria-label="t('card.deleteGoal')"
          >
            <Trash2 :size="12" />
          </button>
        </template>
      </div>
    </div>

    <!-- Description -->
    <p v-if="goal.description" class="text-[#a09690] text-xs leading-relaxed mb-3 line-clamp-2" :title="goal.description">{{ goal.description }}</p>

    <!-- Footer: Date -->
    <div class="flex items-center gap-1.5 pt-2 mt-auto">
      <div class="h-1 w-1 rounded-full bg-stone-200 dark:bg-[#635d58]"></div>
      <span class="text-[10px] uppercase tracking-wider font-medium text-[#a09690] dark:text-[#635d58]">
        {{ new Date(goal.createdAt).toLocaleDateString(localeCode) }}
      </span>
    </div>

    <!-- Minimalist Progress Bar at the very bottom -->
    <div v-if="['in-progress', 'done'].includes(goal.status)" class="absolute bottom-0 left-0 right-0 h-1.5 overflow-hidden rounded-b-lg">
      <div 
        class="h-full transition-all duration-700 ease-out"
        :class="getStatusConfig(goal.status).barColor"
        :style="{ width: goal.status === 'done' ? '100%' : `${goal.progress}%` }"
      ></div>
    </div>
  </div>
</template>
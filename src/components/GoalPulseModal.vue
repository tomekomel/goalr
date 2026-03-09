<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { X, Loader2, Activity, AlertTriangle, Pencil, Play, CheckCircle2, Save } from 'lucide-vue-next';
import { useI18n } from '../composables/useI18n';
import { useGoalPulse, type PulseResponse } from '../composables/useGoalPulse';
import type { Goal } from '../types';

const { t } = useI18n();
const { getGoalPulse, isLoading, error } = useGoalPulse();

const props = defineProps<{
  goal: Goal;
  siblingGoals: Goal[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update-goal', payload: { id: string; status: string; progress: number }): void;
  (e: 'edit-goal', goal: Goal): void;
}>();

const pulse = ref<PulseResponse | null>(null);
const progressValue = ref(props.goal.progress);

const accentColors = {
  none: 'bg-emerald-500',
  low: 'bg-emerald-500',
  high: 'bg-red-500',
};

const fetchPulse = async () => {
  pulse.value = null;
  const result = await getGoalPulse(props.goal, props.siblingGoals);
  if (result) {
    pulse.value = result;
  }
};

onMounted(() => {
  fetchPulse();
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close');
};

const handleStartWorking = () => {
  emit('update-goal', { id: props.goal.id, status: 'in-progress', progress: Math.max(props.goal.progress, 10) });
};

const handleSaveProgress = () => {
  emit('update-goal', { id: props.goal.id, status: 'in-progress', progress: progressValue.value });
};

const handleMarkDone = () => {
  emit('update-goal', { id: props.goal.id, status: 'done', progress: 100 });
};

const handleEditGoal = () => {
  emit('edit-goal', props.goal);
};
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

    <div class="relative w-full max-w-sm bg-white dark:bg-[#382933] rounded-3xl shadow-2xl p-8 border border-stone-100 dark:border-[rgba(255,255,255,0.065)] animate-in fade-in zoom-in duration-200">
      <!-- Accent bar -->
      <div
        v-if="pulse"
        class="absolute top-0 left-6 right-6 h-1 rounded-b-full"
        :class="accentColors[pulse.riskLevel]"
      ></div>

      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-2">
          <Activity :size="20" class="text-emerald-500" />
          <h2 class="text-2xl font-bold text-[#382933] dark:text-[#e8ede6]">{{ t('pulse.title') }}</h2>
        </div>
        <button @click="$emit('close')" class="text-[#a4b494] hover:text-[#3b5249] dark:hover:text-[#e8ede6] transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded-lg" :aria-label="t('modal.closeModal')">
          <X :size="24" />
        </button>
      </div>

      <!-- State: Loading -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 :size="32" class="text-emerald-500 animate-spin" />
        <p class="text-sm font-medium text-[#a4b494]">{{ t('pulse.loading') }}</p>
      </div>

      <!-- State: Error -->
      <div v-else-if="error" class="space-y-4">
        <p class="text-sm text-red-500 font-medium text-center">{{ t('pulse.error') }}</p>
        <button
          @click="fetchPulse"
          class="w-full py-3 bg-stone-100 dark:bg-[#42313c] text-[#637562] dark:text-[#a4b494] rounded-2xl font-bold text-sm hover:bg-stone-200 dark:hover:bg-[#3b5249] transition-colors cursor-pointer"
        >
          {{ t('pulse.retry') }}
        </button>
      </div>

      <!-- State: Result -->
      <div v-else-if="pulse" class="space-y-5">
        <!-- Risk badge -->
        <div v-if="pulse.riskLevel !== 'none'" class="flex items-center gap-1.5">
          <AlertTriangle :size="14" :class="pulse.riskLevel === 'high' ? 'text-red-500' : 'text-emerald-500'" />
          <span
            class="text-xs font-bold uppercase tracking-wider"
            :class="pulse.riskLevel === 'high' ? 'text-red-500' : 'text-emerald-500'"
          >
            {{ pulse.riskLevel === 'high' ? t('pulse.riskHigh') : t('pulse.riskLow') }}
          </span>
        </div>

        <!-- Goal title -->
        <p class="text-xs font-semibold text-[#a4b494] dark:text-[#637562] uppercase tracking-wider">{{ goal.title }}</p>

        <!-- AI message -->
        <p class="text-sm text-[#3b5249] dark:text-[#a4b494] leading-relaxed">{{ pulse.message }}</p>

        <!-- Actions for to-do goals -->
        <div v-if="goal.status === 'to-do'" class="space-y-2 pt-2">
          <button
            @click="handleStartWorking"
            class="w-full py-3 bg-[#519872] text-white rounded-2xl font-bold text-sm hover:bg-[#3d7a5a] transition-colors shadow-lg shadow-[#519872]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play :size="14" />
            {{ t('pulse.startWorking') }}
          </button>
          <button
            @click="handleEditGoal"
            class="w-full py-3 bg-stone-100 dark:bg-[#42313c] text-[#637562] dark:text-[#a4b494] rounded-2xl font-bold text-sm hover:bg-stone-200 dark:hover:bg-[#3b5249] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Pencil :size="14" />
            {{ t('pulse.editGoal') }}
          </button>
        </div>

        <!-- Actions for in-progress goals -->
        <div v-else-if="goal.status === 'in-progress'" class="space-y-3 pt-2">
          <!-- Progress slider -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-semibold text-[#a4b494]">{{ t('pulse.progress') }}</label>
              <span class="text-xs font-bold text-[#519872]">{{ progressValue }}%</span>
            </div>
            <input
              v-model.number="progressValue"
              type="range"
              min="0"
              max="100"
              step="5"
              class="w-full h-2 bg-stone-200 dark:bg-[#42313c] rounded-full appearance-none cursor-pointer accent-[#519872]"
            />
          </div>

          <button
            @click="handleSaveProgress"
            class="w-full py-3 bg-[#519872] text-white rounded-2xl font-bold text-sm hover:bg-[#3d7a5a] transition-colors shadow-lg shadow-[#519872]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save :size="14" />
            {{ t('pulse.saveProgress') }}
          </button>
          <button
            @click="handleMarkDone"
            class="w-full py-3 bg-stone-100 dark:bg-[#42313c] text-[#637562] dark:text-[#a4b494] rounded-2xl font-bold text-sm hover:bg-stone-200 dark:hover:bg-[#3b5249] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 :size="14" />
            {{ t('pulse.markDone') }}
          </button>
          <button
            @click="handleEditGoal"
            class="w-full py-2 text-sm text-[#a4b494] hover:text-[#637562] dark:hover:text-[#a4b494] transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Pencil :size="14" />
            {{ t('pulse.editGoal') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { X } from 'lucide-vue-next';
import type { Goal, GoalPeriod, GoalStatus } from '../types';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();

const props = defineProps<{
  isOpen: boolean;
  goal?: Goal | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', goal: { 
    id?: string; 
    title: string; 
    description: string; 
    period: GoalPeriod; 
    status: GoalStatus; 
    progress: number;
    weekNumber?: number;
    targetDate?: string;
  }): void;
}>();

const getDefaultTargetDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};

const form = reactive({
  title: props.goal?.title ?? '',
  description: props.goal?.description ?? '',
  period: props.goal?.period ?? 'weekly',
  status: props.goal?.status ?? 'planned',
  progress: props.goal?.progress ?? 0,
  weekNumber: props.goal?.weekNumber ?? (new Date().getDate() <= 7 ? 1 : new Date().getDate() <= 14 ? 2 : new Date().getDate() <= 21 ? 3 : 4),
  targetDate: props.goal?.targetDate ?? getDefaultTargetDate(),
});

// Reset weekNumber if switching away from weekly
watch(() => form.period, (newPeriod) => {
  if (newPeriod === 'weekly' && !form.weekNumber) {
    form.weekNumber = 1;
  }
});

const months = computed(() =>
  Array.from({ length: 12 }, (_, i) => t(`modal.month.${i}`))
);

const currentMonthIndex = computed(() => parseInt(form.targetDate.substring(5, 7)) - 1);

const selectMonth = (index: number) => {
  const year = form.targetDate.substring(0, 4);
  const month = String(index + 1).padStart(2, '0');
  form.targetDate = `${year}-${month}-01`;
};

const changeYear = (delta: number) => {
  const year = parseInt(form.targetDate.substring(0, 4)) + delta;
  const month = form.targetDate.substring(5, 7);
  form.targetDate = `${year}-${month}-01`;
};

const handleSubmit = () => {
  if (!form.title.trim()) return;
  
  const payload: any = {
    id: props.goal?.id,
    title: form.title,
    description: form.description,
    period: form.period,
    status: form.status,
    progress: form.progress,
    targetDate: form.targetDate,
  };

  if (form.period === 'weekly') {
    payload.weekNumber = form.weekNumber;
  }

  emit('save', payload);
};

const periods: GoalPeriod[] = ['weekly', 'monthly', 'yearly'];
const statuses: GoalStatus[] = ['planned', 'to-do', 'in-progress', 'done'];

const statusColors: Record<string, string> = {
  'planned': 'bg-[#635d58] border-[#635d58] text-white shadow-[#635d58]/30',
  'to-do': 'bg-blue-500 border-blue-500 text-white shadow-blue-500/30',
  'in-progress': 'bg-sky-500 border-sky-500 text-white shadow-sky-500/30',
  'done': 'bg-[#5bbf80] border-[#5bbf80] text-white shadow-[#5bbf80]/30',
};

const formatStatus = (s: string) => t(`modal.status.${s}`);

const setStatus = (s: GoalStatus) => {
  form.status = s;
  if (s === 'done') {
    form.progress = 100;
  } else if (s === 'planned' || s === 'to-do') {
    form.progress = 0;
  }
  // For 'in-progress' we keep the current value, or default to 10 if it was 0
  if (s === 'in-progress' && form.progress === 0) {
    form.progress = 10;
  }
  if (s === 'in-progress' && form.progress === 100) {
    // If coming from done, maybe lower it slightly to indicate not done? Or keep it.
    // Let's keep it, user will adjust slider.
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close');
};

onMounted(() => document.addEventListener('keydown', handleKeydown));
onUnmounted(() => document.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

    <div class="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#222020] rounded-3xl shadow-2xl p-8 border border-stone-100 dark:border-[rgba(255,255,255,0.065)] animate-in fade-in zoom-in duration-200">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-[#222020] dark:text-[#f3ede8]">{{ goal ? t('modal.editGoal') : t('modal.newGoal') }}</h2>
        <button @click="$emit('close')" class="text-[#a09690] hover:text-[#383434] dark:hover:text-[#f3ede8] transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded-lg" :aria-label="t('modal.closeModal')">
          <X :size="24" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-semibold text-[#383434] dark:text-[#a09690] mb-2">{{ t('modal.goalTitle') }}</label>
          <input
            v-model="form.title"
            type="text"
            :placeholder="t('modal.titlePlaceholder')"
            class="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-[#1a1818] border border-stone-200 dark:border-[rgba(255,255,255,0.065)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-[#222020] dark:text-[#f3ede8] placeholder-[#a09690] dark:placeholder-[#635d58]"
            required
            autoFocus
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-semibold text-[#383434] dark:text-[#a09690] mb-2">{{ t('modal.description') }}</label>
          <textarea
            v-model="form.description"
            rows="3"
            :placeholder="t('modal.descPlaceholder')"
            class="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-[#1a1818] border border-stone-200 dark:border-[rgba(255,255,255,0.065)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-[#222020] dark:text-[#f3ede8] placeholder-[#a09690] dark:placeholder-[#635d58] resize-none"
          ></textarea>
        </div>

        <!-- Progress Slider (Only for In-Progress) -->
        <div v-if="form.status === 'in-progress'" class="animate-in slide-in-from-top-2 fade-in duration-300">
           <div class="flex justify-between items-center mb-3">
            <label class="block text-xs font-bold uppercase tracking-widest text-[#a09690] dark:text-[#635d58]">{{ t('modal.currentProgress') }}</label>
            <span class="text-xs font-black text-[#5bbf80]">{{ form.progress }}%</span>
           </div>
           <div class="relative flex items-center h-4">
             <input 
                type="range" 
                v-model.number="form.progress" 
                min="0" 
                max="100" 
                step="5"
                class="w-full h-1 bg-stone-100 dark:bg-[#2d2a2a] rounded-full appearance-none cursor-pointer accent-[#5bbf80] custom-slider"
             />
           </div>
        </div>

        <!-- Period & Status Grid -->
        <div class="grid grid-cols-1 gap-6">
          <!-- Period -->
          <div>
            <label class="block text-sm font-semibold text-[#383434] dark:text-[#a09690] mb-2">{{ t('modal.period') }}</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="p in periods"
                :key="p"
                type="button"
                @click="form.period = p"
                :class="[
                  'py-2 px-1 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border cursor-pointer',
                  form.period === p
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                    : 'bg-white dark:bg-[#2d2a2a] text-[#a09690] border-stone-200 dark:border-[rgba(255,255,255,0.065)] hover:border-stone-300 dark:hover:border-[rgba(255,255,255,0.11)]'
                ]"
              >
                {{ t(`modal.period.${p}`) }}
              </button>
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-semibold text-[#383434] dark:text-[#a09690] mb-2">{{ t('modal.status') }}</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="s in statuses"
                :key="s"
                type="button"
                @click="setStatus(s)"
                :class="[
                  'cursor-pointer py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border shadow-sm',
                  form.status === s
                    ? statusColors[s]
                    : 'bg-white dark:bg-[#2d2a2a] text-[#a09690] border-stone-200 dark:border-[rgba(255,255,255,0.065)] hover:border-stone-300 dark:hover:border-[rgba(255,255,255,0.11)]'
                ]"
              >
                {{ formatStatus(s) }}
              </button>
            </div>
          </div>
        </div>

        <!-- Date Context (Week / Month / Year) -->
        <div class="space-y-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div v-if="form.period === 'weekly'">
            <label class="block text-sm font-semibold text-[#383434] dark:text-[#a09690] mb-2">{{ t('modal.weekNumber') }}</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="w in 4"
                :key="w"
                type="button"
                @click="form.weekNumber = w"
                :class="[
                  'py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer',
                  form.weekNumber === w
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                    : 'bg-white dark:bg-[#2d2a2a] text-[#a09690] border-stone-200 dark:border-[rgba(255,255,255,0.065)] hover:border-stone-300 dark:hover:border-[rgba(255,255,255,0.11)]'
                ]"
              >
                {{ t('modal.week', w) }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-[#383434] dark:text-[#a09690] mb-2">
              {{ form.period === 'yearly' ? t('modal.selectYear') : t('modal.selectMonthYear') }}
            </label>

            <div class="bg-stone-50 dark:bg-[#1a1818] rounded-2xl p-4 border border-stone-200 dark:border-[rgba(255,255,255,0.065)]">
              <!-- Year Selector -->
              <div class="flex items-center justify-between mb-4 px-2">
                <button type="button" @click="changeYear(-1)" class="p-1 hover:bg-stone-200 dark:hover:bg-[#2d2a2a] rounded-lg transition-colors cursor-pointer text-[#a09690]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <span class="font-bold text-[#383434] dark:text-[#a09690] text-lg">{{ form.targetDate.substring(0, 4) }}</span>
                <button type="button" @click="changeYear(1)" class="p-1 hover:bg-stone-200 dark:hover:bg-[#2d2a2a] rounded-lg transition-colors cursor-pointer text-[#a09690]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>

              <!-- Month Grid -->
              <div v-if="form.period !== 'yearly'" class="grid grid-cols-4 gap-2">
                <button
                  v-for="(month, index) in months"
                  :key="month"
                  type="button"
                  @click="selectMonth(index)"
                  :class="[
                    'py-2 rounded-lg text-[11px] font-bold uppercase tracking-tighter transition-all border cursor-pointer',
                    currentMonthIndex === index
                      ? 'bg-[#5bbf80] text-white border-[#5bbf80] shadow-sm'
                      : 'bg-white dark:bg-[#222020] text-[#a09690] border-stone-100 dark:border-[rgba(255,255,255,0.065)] hover:border-stone-200 dark:hover:border-[rgba(255,255,255,0.11)] hover:text-[#383434] dark:hover:text-[#a09690]'
                  ]"
                >
                  {{ month }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="w-full py-4 bg-[#5bbf80] text-white rounded-2xl font-bold hover:bg-[#45a868] transition-colors shadow-xl shadow-[#5bbf80]/20 mt-2"
        >
          {{ goal ? t('modal.saveChanges') : t('modal.addGoal') }}
        </button>
      </form>
    </div>
  </div>
</template>
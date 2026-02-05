<script setup lang="ts">
import { reactive } from 'vue';
import { X } from 'lucide-vue-next';
import type { Goal, GoalPeriod, GoalStatus } from '../types';

const props = defineProps<{
  isOpen: boolean;
  goal?: Goal | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', goal: { id?: string; title: string; description: string; period: GoalPeriod; status: GoalStatus; progress: number }): void;
}>();

const form = reactive({
  title: props.goal?.title ?? '',
  description: props.goal?.description ?? '',
  period: props.goal?.period ?? 'weekly',
  status: props.goal?.status ?? 'planned',
  progress: props.goal?.progress ?? 0,
});

const handleSubmit = () => {
  if (!form.title.trim()) return;
  emit('save', {
    id: props.goal?.id,
    ...form
  });
  emit('close');
};

const periods: GoalPeriod[] = ['weekly', 'monthly', 'yearly'];
const statuses: GoalStatus[] = ['planned', 'to-do', 'in-progress', 'done', 'archived'];

const statusColors: Record<GoalStatus, string> = {
  'planned': 'bg-slate-500 border-slate-500 text-white shadow-slate-500/30',
  'to-do': 'bg-blue-500 border-blue-500 text-white shadow-blue-500/30',
  'in-progress': 'bg-violet-500 border-violet-500 text-white shadow-violet-500/30',
  'done': 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/30',
  'archived': 'bg-stone-500 border-stone-500 text-white shadow-stone-500/30',
};

const formatStatus = (s: string) => s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

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

// Also watch progress to auto-complete if dragged to 100?
// Optional UX: if user drags to 100, set status to done?
// Let's keep it simple for now.
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

    <div class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 animate-in fade-in zoom-in duration-200">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-slate-800">{{ goal ? 'Edit Goal' : 'New Goal' }}</h2>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 transition-colors">
          <X :size="24" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Goal Title</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="What do you want to achieve?"
            class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            required
            autoFocus
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Description (optional)</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Add more details..."
            class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
          ></textarea>
        </div>

        <!-- Progress Slider (Only for In-Progress) -->
        <div v-if="form.status === 'in-progress'" class="animate-in slide-in-from-top-2 fade-in duration-300">
           <div class="flex justify-between items-center mb-3">
            <label class="block text-xs font-bold uppercase tracking-widest text-slate-400">Current Progress</label>
            <span class="text-xs font-black text-emerald-600">{{ form.progress }}%</span>
           </div>
           <div class="relative flex items-center h-4">
             <input 
                type="range" 
                v-model.number="form.progress" 
                min="0" 
                max="100" 
                step="5"
                class="w-full h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-emerald-500 custom-slider"
             />
           </div>
        </div>

        <!-- Period & Status Grid -->
        <div class="grid grid-cols-1 gap-6">
          <!-- Period -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Period</label>
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
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                ]"
              >
                {{ p }}
              </button>
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Status</label>
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
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                ]"
              >
                {{ formatStatus(s) }}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-xl shadow-emerald-200 mt-2"
        >
          {{ goal ? 'Save Changes' : 'Add Goal' }}
        </button>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { X, Sparkles, RefreshCw, Check, Loader2 } from 'lucide-vue-next';
import { useI18n } from '../composables/useI18n';
import { useGoalArchitect, type GeneratedGoal } from '../composables/useGoalArchitect';

const { t } = useI18n();
const { generateGoals, error } = useGoalArchitect();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', goals: GeneratedGoal[]): void;
}>();

type ModalState = 'input' | 'loading' | 'preview';

const state = ref<ModalState>('input');
const description = ref('');
const generatedGoals = ref<(GeneratedGoal & { selected: boolean })[]>([]);

const examples = computed(() => [
  t('architect.example1'),
  t('architect.example2'),
  t('architect.example3'),
]);

const canGenerate = computed(() => description.value.trim().length > 0);

const selectedCount = computed(() => generatedGoals.value.filter(g => g.selected).length);

const groupedGoals = computed(() => {
  const yearly = generatedGoals.value.filter(g => g.period === 'yearly');
  const monthly = generatedGoals.value.filter(g => g.period === 'monthly');
  const weekly = generatedGoals.value.filter(g => g.period === 'weekly');
  return { yearly, monthly, weekly };
});

const useExample = (example: string) => {
  description.value = example;
};

const handleGenerate = async () => {
  if (state.value === 'loading') return;
  if (!canGenerate.value) return;
  state.value = 'loading';

  const goals = await generateGoals(description.value);

  if (error.value || goals.length === 0) {
    state.value = 'input';
    return;
  }

  generatedGoals.value = goals.map(g => ({ ...g, selected: true }));
  state.value = 'preview';
};

const handleRegenerate = () => {
  generatedGoals.value = [];
  handleGenerate();
};

const handleSave = () => {
  const selected = generatedGoals.value
    .filter(g => g.selected)
    .map(({ selected: _, ...goal }) => goal);

  if (selected.length === 0) return;
  emit('save', selected);
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close');
};

onMounted(() => document.addEventListener('keydown', handleKeydown));
onUnmounted(() => document.removeEventListener('keydown', handleKeydown));

const periodBadgeClass: Record<string, string> = {
  yearly: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  monthly: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  weekly: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
};
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

    <div class="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-[#222020] rounded-3xl shadow-2xl p-8 border border-stone-100 dark:border-[rgba(255,255,255,0.065)] animate-in fade-in zoom-in duration-200">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-2">
          <Sparkles :size="20" class="text-green-500" />
          <h2 class="text-2xl font-bold text-[#222020] dark:text-[#f3ede8]">{{ t('architect.title') }}</h2>
        </div>
        <button @click="$emit('close')" class="text-[#a09690] hover:text-[#383434] dark:hover:text-[#f3ede8] transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded-lg" :aria-label="t('modal.closeModal')">
          <X :size="24" />
        </button>
      </div>

      <!-- State: Input -->
      <div v-if="state === 'input'" class="space-y-5">
        <div>
          <textarea
            v-model="description"
            rows="4"
            :placeholder="t('architect.placeholder')"
            class="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-[#1a1818] border border-stone-200 dark:border-[rgba(255,255,255,0.065)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-[#222020] dark:text-[#f3ede8] placeholder-[#a09690] dark:placeholder-[#635d58] resize-none"
            @keydown.ctrl.enter="handleGenerate"
            @keydown.meta.enter="handleGenerate"
          ></textarea>
        </div>

        <!-- Examples -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="example in examples"
            :key="example"
            @click="useExample(example)"
            class="text-xs px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-[#2d2a2a] text-[#a09690] hover:bg-stone-200 dark:hover:bg-[#383434] transition-colors cursor-pointer"
          >
            {{ example }}
          </button>
        </div>

        <!-- Error -->
        <p v-if="error" class="text-sm text-red-500 font-medium">{{ t('architect.errorGenerate') }}</p>

        <button
          @click="handleGenerate"
          :disabled="!canGenerate"
          class="w-full py-4 bg-[#5bbf80] text-white rounded-2xl font-bold hover:bg-[#45a868] transition-colors shadow-sm shadow-[#5bbf80]/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Sparkles :size="16" />
          {{ t('architect.generate') }}
        </button>
      </div>

      <!-- State: Loading -->
      <div v-else-if="state === 'loading'" class="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 :size="32" class="text-green-500 animate-spin" />
        <p class="text-sm font-medium text-[#a09690]">{{ t('architect.generating') }}</p>
        <div class="w-full space-y-3 mt-4">
          <div v-for="i in 4" :key="i" class="h-10 bg-stone-100 dark:bg-[#2d2a2a] rounded-xl animate-pulse" :style="{ animationDelay: `${i * 150}ms` }"></div>
        </div>
      </div>

      <!-- State: Preview -->
      <div v-else-if="state === 'preview'" class="space-y-5">
        <!-- Goal groups -->
        <template v-for="(group, key) in groupedGoals" :key="key">
          <div v-if="group.length > 0">
            <h3 class="text-xs font-bold uppercase tracking-widest text-[#a09690] dark:text-[#635d58] mb-2">
              {{ t(`architect.${key}`) }}
            </h3>
            <div class="space-y-2">
              <div
                v-for="(goal, idx) in group"
                :key="`${key}-${idx}`"
                class="flex items-start gap-3 p-3 rounded-xl border transition-colors"
                :class="goal.selected
                  ? 'bg-white dark:bg-[#2d2a2a]/50 border-stone-200 dark:border-[rgba(255,255,255,0.065)]'
                  : 'bg-stone-50 dark:bg-[#222020] border-stone-100 dark:border-[rgba(255,255,255,0.065)] opacity-50'"
              >
                <button
                  @click="goal.selected = !goal.selected"
                  class="mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer"
                  :class="goal.selected
                    ? 'bg-[#5bbf80] border-[#5bbf80] text-white'
                    : 'border-stone-300 dark:border-[rgba(255,255,255,0.15)]'"
                >
                  <Check v-if="goal.selected" :size="12" />
                </button>
                <div class="flex-1 min-w-0">
                  <input
                    v-model="goal.title"
                    class="w-full text-sm font-semibold text-[#222020] dark:text-[#f3ede8] bg-transparent outline-none focus:ring-1 focus:ring-primary/30 rounded px-1 -ml-1"
                  />
                  <p class="text-xs text-[#a09690] dark:text-[#635d58] mt-0.5 px-1">{{ goal.description }}</p>
                </div>
                <span :class="periodBadgeClass[goal.period]" class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0">
                  {{ goal.period }}
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            @click="handleRegenerate"
            class="flex-1 py-3 rounded-2xl font-bold text-sm border border-stone-200 dark:border-[rgba(255,255,255,0.065)] text-[#635d58] dark:text-[#a09690] hover:bg-stone-50 dark:hover:bg-[#2d2a2a] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw :size="14" />
            {{ t('architect.regenerate') }}
          </button>
          <button
            @click="handleSave"
            :disabled="selectedCount === 0"
            class="flex-1 py-3 bg-[#5bbf80] text-white rounded-2xl font-bold text-sm hover:bg-[#45a868] transition-colors shadow-sm shadow-[#5bbf80]/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check :size="14" />
            {{ t('architect.addSelected') }} ({{ selectedCount }})
          </button>
        </div>

        <button
          @click="$emit('close')"
          class="w-full py-2 text-sm text-[#a09690] hover:text-[#635d58] dark:hover:text-[#a09690] transition-colors cursor-pointer"
        >
          {{ t('architect.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, LayoutDashboard, ListTodo, X, ChevronLeft, ChevronRight, ChevronsRight, Inbox, Moon, Sun, Sparkles, UserPlus } from 'lucide-vue-next';
import { useDarkMode } from '../composables/useDarkMode';
import { useI18n } from '../composables/useI18n';
import type { Goal, GoalPeriod, GoalStatus } from '../types';
import GoalCard from '../components/GoalCard.vue';
import GoalColumn from '../components/GoalColumn.vue';
import GoalModal from '../components/GoalModal.vue';
import { defaultGoals } from './mockGoals';

const { isDark, toggle: toggleDark } = useDarkMode();
const { t, locale, localeCode, toggleLocale } = useI18n();

// Toast notifications
const toasts = ref<{ id: number; message: string; type?: 'error' | 'info' }[]>([]);
let toastId = 0;

const showToast = (message: string, type: 'error' | 'info' = 'error') => {
  const id = ++toastId;
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 5000);
};

const dismissToast = (id: number) => {
  toasts.value = toasts.value.filter(t => t.id !== id);
};

const isModalOpen = ref(false);
const editingGoal = ref<Goal | null>(null);

type ViewType = 'dashboard' | 'backlog';
const currentView = ref<ViewType>('dashboard');

const views = computed(() => [
  { id: 'dashboard', label: t('app.dashboard'), icon: LayoutDashboard },
  { id: 'backlog', label: t('app.backlog'), icon: ListTodo },
]);

const showYearlyColumn = ref(localStorage.getItem('showYearlyColumn') !== 'false');
const toggleYearlyColumn = () => {
  showYearlyColumn.value = !showYearlyColumn.value;
  localStorage.setItem('showYearlyColumn', String(showYearlyColumn.value));
};

const goals = ref<Goal[]>([...defaultGoals]);
const currentDate = ref(new Date());

const currentMonthName = computed(() => currentDate.value.toLocaleString(localeCode.value, { month: 'long' }));
const currentYear = computed(() => currentDate.value.getFullYear());

const isCurrentMonth = computed(() => {
  const now = new Date();
  return currentDate.value.getMonth() === now.getMonth() && currentDate.value.getFullYear() === now.getFullYear();
});

const navigateMonth = (delta: number) => {
  const d = new Date(currentDate.value);
  d.setMonth(d.getMonth() + delta);
  currentDate.value = d;
};

const navigateYear = (delta: number) => {
  const d = new Date(currentDate.value);
  d.setFullYear(d.getFullYear() + delta);
  currentDate.value = d;
};

const isCurrentYear = computed(() => {
  return currentDate.value.getFullYear() === new Date().getFullYear();
});

const goToToday = () => {
  currentDate.value = new Date();
};

const currentWeekNumber = computed(() => Math.min(Math.ceil(new Date().getDate() / 7), 4));

const formatDateLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const currentMonthStr = computed(() => {
  const now = currentDate.value;
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
});
const currentYearStr = computed(() => `${currentDate.value.getFullYear()}`);

const filterByView = (list: Goal[]) => {
  if (currentView.value === 'dashboard') {
    return list.filter(g => ['to-do', 'in-progress', 'done'].includes(g.status));
  } else if (currentView.value === 'backlog') {
    return list.filter(g => g.status === 'planned');
  }
  return list;
};

const filterByDate = (list: Goal[], period: GoalPeriod) => {
  if (period === 'monthly' || period === 'weekly') {
    return list.filter(g => !g.targetDate || g.targetDate.startsWith(currentMonthStr.value));
  } else if (period === 'yearly') {
    return list.filter(g => !g.targetDate || g.targetDate.startsWith(currentYearStr.value));
  }
  return list;
};

const monthlyGoals = computed(() => {
  const byPeriod = goals.value.filter(g => g.period === 'monthly');
  return filterByDate(filterByView(byPeriod), 'monthly');
});

const weeklyGoals = computed(() => {
  const byPeriod = goals.value.filter(g => g.period === 'weekly');
  return filterByDate(filterByView(byPeriod), 'weekly');
});

const getWeekGoals = (weekNumber: number) =>
  weeklyGoals.value.filter(g => g.weekNumber === weekNumber);

const yearlyGoals = computed(() => {
  const byPeriod = goals.value.filter(g => g.period === 'yearly');
  return filterByDate(filterByView(byPeriod), 'yearly');
});

const emptyMessages = computed(() => ({
  monthly: t('app.emptyMonthly'),
  weekly: t('app.emptyWeekly'),
  yearly: t('app.emptyYearly'),
}));

const backlogGoals = computed(() => goals.value.filter(g => g.status === 'planned'));

const calcStats = (goalList: Goal[]) => {
  const total = goalList.length;
  const done = goalList.filter(g => g.status === 'done').length;
  const inProgress = goalList.filter(g => g.status === 'in-progress').length;
  const toDo = total - done - inProgress;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, inProgress, toDo, pct };
};

const monthStats = computed(() => calcStats([...monthlyGoals.value, ...weeklyGoals.value]));
const yearStats = computed(() => calcStats(yearlyGoals.value));

const donutBg = (stats: { total: number; done: number; inProgress: number }) => {
  const trackColor = isDark.value ? '#383434' : '#d8d8d3';
  if (stats.total === 0) return trackColor;
  const doneP = (stats.done / stats.total) * 100;
  const ipP = (stats.inProgress / stats.total) * 100;
  return `conic-gradient(#5bbf80 0% ${doneP}%, #0ea5e9 ${doneP}% ${doneP + ipP}%, ${trackColor} ${doneP + ipP}% 100%)`;
};

const updateGoals = (context: { period: GoalPeriod, weekNumber?: number }, newGoals: Goal[]) => {
  const goalsToUpdate = newGoals.filter(g => {
    if (g.period !== context.period) return true;
    if (context.period === 'weekly' && g.weekNumber !== context.weekNumber) return true;
    return false;
  });

  if (goalsToUpdate.length === 0) return;

  const now = new Date();
  const targetDateObj = new Date(now.getFullYear(), now.getMonth(), 1);
  const targetDate = formatDateLocal(targetDateObj);

  const updatedGoals = goalsToUpdate.map(g => ({
    ...g,
    period: context.period,
    weekNumber: context.weekNumber,
    targetDate: targetDate,
  }));

  goals.value = goals.value.map(g => {
    const updated = updatedGoals.find(u => u.id === g.id);
    return updated || g;
  });
};

const openAddModal = () => {
  editingGoal.value = null;
  isModalOpen.value = true;
};

const openEditModal = (goal: Goal) => {
  editingGoal.value = goal;
  isModalOpen.value = true;
};

const saveGoal = (goalData: {
  id?: string;
  title: string;
  description: string;
  period: GoalPeriod;
  status: GoalStatus;
  progress: number;
  weekNumber?: number;
  targetDate?: string;
}) => {
  if (goalData.id) {
    const index = goals.value.findIndex(g => g.id === goalData.id);
    if (index !== -1) {
      const existingGoal = goals.value[index];
      if (existingGoal) {
        goals.value[index] = {
          ...existingGoal,
          ...goalData,
          id: goalData.id!,
          createdAt: existingGoal.createdAt
        };
      }
    }
  } else {
    goals.value.unshift({
      id: crypto.randomUUID(),
      title: goalData.title,
      description: goalData.description,
      period: goalData.period,
      status: goalData.status,
      progress: goalData.progress,
      createdAt: Date.now(),
      weekNumber: goalData.weekNumber,
      targetDate: goalData.targetDate,
    });
  }
  isModalOpen.value = false;
  editingGoal.value = null;
};

const startGoal = (id: string) => {
  const goal = goals.value.find(g => g.id === id);
  if (goal) goal.status = 'to-do';
};

const deleteGoal = (id: string) => {
  goals.value = goals.value.filter(g => g.id !== id);
};

const handleAiArchitect = () => {
  showToast('Sign up to use AI Goal Architect', 'info');
};

const handleAiPulse = () => {
  showToast('Sign up to use Goal Pulse', 'info');
};
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f0] dark:bg-[#111010]">
    <!-- Demo Banner -->
    <div class="bg-[#5bbf80] text-white text-center py-2 px-4 text-sm font-medium">
      This is a demo &mdash;
      <a href="/app/" class="underline font-bold hover:text-green-100 transition-colors">Start for free</a>
    </div>

    <div class="pb-20">
      <!-- Header -->
      <header class="max-w-7xl mx-auto px-6 pt-6 sm:pt-8 pb-5">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-5">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <div class="bg-primary p-2 rounded-lg shadow-md shadow-primary/20 text-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-5 h-5">
                  <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="2" fill="none"/>
                  <circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
                  <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <h1 class="text-4xl font-black text-[#222020] dark:text-[#f3ede8] tracking-tighter">goalr.</h1>
            </div>
            <p class="text-[#a09690] font-medium text-sm">{{ t('app.tagline') }}</p>
          </div>

          <div class="flex items-center gap-3">
            <button
              @click="openAddModal"
              class="bg-[#5bbf80] hover:bg-[#45a868] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm shadow-[#5bbf80]/10 flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-none justify-center focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Plus :size="16" />
              {{ t('app.addGoal') }}
            </button>

            <button
              @click="handleAiArchitect"
              class="bg-white dark:bg-[#222020] hover:bg-green-50 dark:hover:bg-[#2d2a2a] text-green-600 dark:text-amber-400 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm border border-stone-200 dark:border-[rgba(255,255,255,0.065)] flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Sparkles :size="16" />
              AI
            </button>

            <button
              @click="toggleDark"
              class="bg-white dark:bg-[#222020] hover:bg-stone-50 dark:hover:bg-[#2d2a2a] text-[#a09690] px-3 py-2.5 rounded-xl font-semibold transition-all shadow-sm border border-stone-200 dark:border-[rgba(255,255,255,0.065)] cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary"
              :aria-label="isDark ? t('app.switchToLight') : t('app.switchToDark')"
            >
              <Sun v-if="isDark" :size="16" />
              <Moon v-else :size="16" />
            </button>

            <button
              @click="toggleLocale"
              class="bg-white dark:bg-[#222020] hover:bg-stone-50 dark:hover:bg-[#2d2a2a] text-[#a09690] px-3 py-2.5 rounded-xl font-semibold transition-all shadow-sm border border-stone-200 dark:border-[rgba(255,255,255,0.065)] cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Toggle language"
            >
              <span class="text-xs font-bold">{{ locale === 'en' ? 'EN' : 'PL' }}</span>
            </button>

            <a
              href="/app/"
              class="bg-[#5bbf80] hover:bg-[#45a868] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-primary"
            >
              <UserPlus :size="16" />
              Sign up
            </a>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1 pb-1 overflow-x-auto">
          <button
            v-for="view in views"
            :key="view.id"
            @click="currentView = view.id as ViewType"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary"
            :class="[
              currentView === view.id
                ? 'text-[#5bbf80] bg-[#5bbf80]/10'
                : 'text-[#a09690] hover:text-[#383434] dark:hover:text-[#f3ede8] hover:bg-stone-100/50 dark:hover:bg-[#222020]/50'
            ]"
          >
            <component :is="view.icon" :size="14" />
            {{ view.label }}
          </button>
        </div>
      </header>

      <!-- Backlog (flat grid) -->
      <main v-if="currentView === 'backlog'" class="max-w-7xl mx-auto px-6">
        <div class="mb-4">
          <h2 class="text-lg font-bold text-[#222020] dark:text-[#f3ede8]">{{ t('app.backlogTitle') }}</h2>
          <p class="text-xs text-[#a09690] mt-0.5">{{ t('app.backlogDesc') }}</p>
        </div>

        <div v-if="backlogGoals.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
          <Inbox :size="32" class="text-stone-300 dark:text-[#635d58] mb-2" />
          <p class="text-sm text-[#a09690] dark:text-[#635d58] font-medium">{{ t('app.backlogEmpty') }}</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <GoalCard
            v-for="goal in backlogGoals"
            :key="goal.id"
            :goal="goal"
            @delete="deleteGoal"
            @edit="openEditModal"
            @start="startGoal"
          />
        </div>
      </main>

      <!-- Dashboard Board -->
      <main v-else class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 gap-6" :class="showYearlyColumn ? 'xl:grid-cols-4' : 'xl:grid-cols-[1fr_auto]'">

          <!-- LEFT COLUMN: Current Month (3/4 width) -->
          <div class="space-y-3" :class="showYearlyColumn ? 'xl:col-span-3' : 'xl:col-span-1'">
             <div class="flex items-center gap-2 mb-3">
                <button @click="navigateMonth(-1)" class="p-1 hover:bg-stone-200 dark:hover:bg-[#2d2a2a] rounded-lg transition-colors text-[#a09690]" :aria-label="t('app.prevMonth')">
                  <ChevronLeft :size="18" />
                </button>
                <h2 class="text-lg font-bold text-[#222020] dark:text-[#f3ede8]">{{ currentMonthName }} <span class="text-[#5bbf80]">{{ currentYear }}</span></h2>
                <button @click="navigateMonth(1)" class="p-1 hover:bg-stone-200 dark:hover:bg-[#2d2a2a] rounded-lg transition-colors text-[#a09690]" :aria-label="t('app.nextMonth')">
                  <ChevronRight :size="18" />
                </button>
                <button
                  v-if="!isCurrentMonth"
                  @click="goToToday"
                  class="ml-1 text-[10px] font-bold text-[#5bbf80] bg-[#5bbf80]/10 px-2 py-1 rounded-md hover:bg-[#5bbf80]/20 transition-colors"
                >
                  {{ t('app.today') }}
                </button>
             </div>

             <div class="bg-stone-100/50 dark:bg-[#1a1818]/50 rounded-xl border border-stone-200/50 dark:border-[rgba(255,255,255,0.065)] flex flex-col gap-5">
               <!-- Month Stats Bar -->
               <div v-if="monthStats.total > 0" class="flex items-center gap-3 mx-4 mt-4 px-3 py-2 bg-white/60 dark:bg-[#222020]/60 rounded-lg border border-stone-100 dark:border-[rgba(255,255,255,0.065)]">
                 <div class="relative w-8 h-8 rounded-full shrink-0 transition-all duration-500" :style="{ background: donutBg(monthStats) }">
                   <div class="absolute inset-[5px] rounded-full bg-white/90 dark:bg-[#222020]/90"></div>
                   <span class="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-[#635d58] dark:text-[#a09690]">{{ monthStats.pct }}</span>
                 </div>
                 <div class="flex items-center gap-2 text-[11px] font-medium text-[#a09690] dark:text-[#635d58] flex-wrap">
                   <span>{{ monthStats.total }} {{ t('app.total') }}</span>
                   <span class="text-stone-200 dark:text-[#383434]">&middot;</span>
                   <span class="text-[#5bbf80]">{{ monthStats.done }} {{ t('app.done') }}</span>
                   <span class="text-stone-200 dark:text-[#383434]">&middot;</span>
                   <span class="text-sky-500 dark:text-sky-400">{{ monthStats.inProgress }} {{ t('app.inProgress') }}</span>
                   <span class="text-stone-200 dark:text-[#383434]">&middot;</span>
                   <span class="text-blue-500">{{ monthStats.toDo }} {{ t('app.toDo') }}</span>
                 </div>
                 <div class="ml-auto flex items-center gap-2 shrink-0">
                   <div class="w-20 h-1.5 bg-stone-100 dark:bg-[#2d2a2a] rounded-full overflow-hidden">
                     <div class="h-full bg-gradient-to-r from-[#5bbf80] to-green-400 rounded-full transition-all duration-700" :style="{ width: monthStats.pct + '%' }"></div>
                   </div>
                   <span class="text-[11px] font-semibold text-[#5bbf80]">{{ monthStats.pct }}%</span>
                 </div>
               </div>

               <!-- Row 1: Monthly Goals -->
               <GoalColumn
                  :title="t('app.monthlyFocus')"
                  period="monthly"
                  :goals="monthlyGoals"
                  variant="highlight"
                  :empty-message="emptyMessages.monthly"
                  class="px-4 pt-4"
                  @update:goals="updateGoals({ period: 'monthly' }, $event)"
                  @delete-goal="deleteGoal"
                  @edit-goal="openEditModal"
                  @pulse-goal="handleAiPulse"
               />

               <!-- Rows 2-5: Weekly Goals -->
               <div class="flex flex-col gap-5 px-4 pb-4">
                  <GoalColumn
                    v-for="week in 4"
                    :key="week"
                    :title="t('app.week', week)"
                    period="weekly"
                    variant="compact"
                    :goals="getWeekGoals(week)"
                    :empty-message="emptyMessages.weekly"
                    :is-current-week="isCurrentMonth && week === currentWeekNumber"
                    @update:goals="updateGoals({ period: 'weekly', weekNumber: week }, $event)"
                    @delete-goal="deleteGoal"
                    @edit-goal="openEditModal"
                    @pulse-goal="handleAiPulse"
                  />
               </div>
             </div>
          </div>

          <!-- RIGHT COLUMN: Current Year (1/4 width) -->
          <div v-if="showYearlyColumn" class="xl:col-span-1 space-y-3">
              <div class="flex items-center gap-2 mb-3">
                <button @click="navigateYear(-1)" class="p-1 hover:bg-stone-200 dark:hover:bg-[#2d2a2a] rounded-lg transition-colors text-[#a09690]" :aria-label="t('app.prevYear')">
                  <ChevronLeft :size="18" />
                </button>
                <h2 class="text-lg font-bold text-[#222020] dark:text-[#f3ede8]">{{ t('app.yearLabel') }} <span class="text-green-500">{{ currentYear }}</span></h2>
                <button @click="navigateYear(1)" class="p-1 hover:bg-stone-200 dark:hover:bg-[#2d2a2a] rounded-lg transition-colors text-[#a09690]" :aria-label="t('app.nextYear')">
                  <ChevronRight :size="18" />
                </button>
                <button
                  v-if="!isCurrentYear"
                  @click="goToToday"
                  class="ml-1 text-[10px] font-bold text-green-500 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-md hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
                >
                  {{ t('app.today') }}
                </button>
                <button
                  @click="toggleYearlyColumn"
                  class="ml-auto p-1 hover:bg-stone-200 dark:hover:bg-[#2d2a2a] rounded-lg transition-colors text-[#a09690] hover:text-[#635d58] dark:hover:text-[#a09690]"
                  :aria-label="t('app.collapseYearly')"
                >
                  <ChevronsRight :size="16" />
                </button>
              </div>

             <!-- Year Stats Bar -->
             <div v-if="yearStats.total > 0" class="flex items-center gap-2.5 px-3 py-2 bg-stone-100/50 dark:bg-[#1a1818]/50 rounded-lg border border-stone-200/50 dark:border-[rgba(255,255,255,0.065)] mb-1">
               <div class="relative w-7 h-7 rounded-full shrink-0 transition-all duration-500" :style="{ background: donutBg(yearStats) }">
                 <div class="absolute inset-[5px] rounded-full bg-white/90 dark:bg-[#222020]/90"></div>
                 <span class="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-[#635d58] dark:text-[#a09690]">{{ yearStats.pct }}</span>
               </div>
               <div class="flex flex-col gap-1 flex-1 min-w-0">
                 <div class="flex items-center gap-1.5 text-[10px] font-medium text-[#a09690] dark:text-[#635d58] flex-wrap">
                   <span class="text-[#5bbf80]">{{ yearStats.done }}<span class="text-stone-300 dark:text-[#383434]">/</span>{{ yearStats.total }}</span>
                   <span class="text-stone-200 dark:text-[#383434]">&middot;</span>
                   <span class="text-sky-500 dark:text-sky-400">{{ yearStats.inProgress }} {{ t('app.wip') }}</span>
                 </div>
                 <div class="w-full h-1 bg-stone-100 dark:bg-[#2d2a2a] rounded-full overflow-hidden">
                   <div class="h-full bg-gradient-to-r from-[#5bbf80] to-green-400 rounded-full transition-all duration-700" :style="{ width: yearStats.pct + '%' }"></div>
                 </div>
               </div>
             </div>

             <GoalColumn
                :title="t('app.yearlyGoals')"
                period="yearly"
                :goals="yearlyGoals"
                :empty-message="emptyMessages.yearly"
                @update:goals="updateGoals({ period: 'yearly' }, $event)"
                @delete-goal="deleteGoal"
                @edit-goal="openEditModal"
                @pulse-goal="handleAiPulse"
             />
          </div>

          <!-- COLLAPSED YEARLY COLUMN -->
          <div
            v-else
            @click="toggleYearlyColumn"
            class="hidden xl:flex flex-col items-center gap-3 pt-3 w-10 bg-stone-100/50 dark:bg-[#1a1818]/50 border border-stone-200/50 dark:border-[rgba(255,255,255,0.065)] rounded-xl cursor-pointer hover:bg-stone-200/50 dark:hover:bg-[#2d2a2a]/50 transition-colors"
          >
            <ChevronLeft :size="16" class="text-[#a09690] shrink-0" />
            <span class="text-xs font-semibold text-[#a09690] [writing-mode:vertical-lr]">{{ t('app.yearly') }}</span>
          </div>

        </div>
      </main>

      <GoalModal
        v-if="isModalOpen"
        :is-open="isModalOpen"
        :goal="editingGoal"
        @close="isModalOpen = false"
        @save="saveGoal"
      />
    </div>

    <!-- Toast Notifications -->
    <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm animate-in slide-in-from-right fade-in duration-300"
        :class="toast.type === 'info' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'"
      >
        <span class="flex-1">{{ toast.message }}</span>
        <button @click="dismissToast(toast.id)" class="text-white/70 hover:text-white transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-white rounded" :aria-label="t('app.dismissNotification')">
          <X :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

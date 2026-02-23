<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Plus, LogOut, LayoutDashboard, ListTodo, X, ChevronLeft, ChevronRight, ChevronsRight, Inbox, Moon, Sun, Sparkles } from 'lucide-vue-next';
import { useDarkMode } from './composables/useDarkMode';
import { useI18n } from './composables/useI18n';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';
import type { Goal, GoalPeriod, GoalStatus } from './types';
import GoalCard from './components/GoalCard.vue';
import GoalColumn from './components/GoalColumn.vue';
import GoalModal from './components/GoalModal.vue';
import AuthScreen from './components/AuthScreen.vue';
import GoalArchitectModal from './components/GoalArchitectModal.vue';
import GoalPulseModal from './components/GoalPulseModal.vue';
import type { GeneratedGoal } from './composables/useGoalArchitect';

const { isDark, toggle: toggleDark } = useDarkMode();
const { t, locale, localeCode, toggleLocale } = useI18n();
const session = ref<Session | null>(null);

// Toast notifications
const toasts = ref<{ id: number; message: string; type: 'error' | 'success' }[]>([]);
let toastId = 0;

const showError = (message: string) => {
  const id = ++toastId;
  toasts.value.push({ id, message, type: 'error' });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 5000);
};

const showSuccess = (message: string) => {
  const id = ++toastId;
  toasts.value.push({ id, message, type: 'success' });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 5000);
};

const dismissToast = (id: number) => {
  toasts.value = toasts.value.filter(t => t.id !== id);
};
const isModalOpen = ref(false);
const isArchitectOpen = ref(false);
const isPulseOpen = ref(false);
const pulseGoal = ref<Goal | null>(null);
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

const goals = ref<Goal[]>([]);
const isLoading = ref(true);
const currentDate = ref(new Date());
const currentYearForYearly = ref(new Date().getFullYear());

const currentMonthName = computed(() => currentDate.value.toLocaleString(localeCode.value, { month: 'long' }));
const currentYear = computed(() => currentDate.value.getFullYear());

const isCurrentMonth = computed(() => {
  const now = new Date();
  return currentDate.value.getMonth() === now.getMonth() && currentDate.value.getFullYear() === now.getFullYear();
});

const navigateMonth = (delta: number) => {
  const d = new Date(currentDate.value);
  d.setDate(1);
  d.setMonth(d.getMonth() + delta);
  currentDate.value = d;
};

const navigateYear = (delta: number) => {
  currentYearForYearly.value += delta;
};

const isCurrentYear = computed(() => {
  return currentYearForYearly.value === new Date().getFullYear();
});

const goToToday = () => {
  currentDate.value = new Date();
  currentYearForYearly.value = new Date().getFullYear();
};

const currentWeekNumber = computed(() => Math.min(Math.ceil(new Date().getDate() / 7), 4));

// Helper to format date as YYYY-MM-DD in LOCAL time
const formatDateLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fetchGoals = async () => {
  if (!session.value) return;

  isLoading.value = true;
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    showError(t('app.errorLoad'));
    isLoading.value = false;
    return;
  }

  if (data) {
    const now = new Date();
    const currentWeek = Math.min(Math.ceil(now.getDate() / 7), 4);

    goals.value = data.map((g: any) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      period: g.period as GoalPeriod,
      status: (g.status || 'planned') as GoalStatus,
      progress: g.progress || 0,
      createdAt: new Date(g.created_at).getTime(),
      weekNumber: g.week_number || (g.period === 'weekly' ? currentWeek : undefined),
      targetDate: g.target_date
    }));
  }
  isLoading.value = false;
};

let authSubscription: { unsubscribe: () => void } | null = null;

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session;
  });

  const { data } = supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session;
    if (_session) fetchGoals();
    else goals.value = [];
  });
  authSubscription = data.subscription;
});

onUnmounted(() => {
  authSubscription?.unsubscribe();
});

const handleSignOut = async () => {
  await supabase.auth.signOut();
};

const currentMonthStr = computed(() => {
  const now = currentDate.value;
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
});
const currentYearStr = computed(() => `${currentYearForYearly.value}`);

const filterByView = (list: Goal[]) => {
  if (currentView.value === 'dashboard') {
    return list.filter(g => ['to-do', 'in-progress', 'done', 'archived'].includes(g.status));
  } else if (currentView.value === 'backlog') {
    return list.filter(g => g.status === 'planned');
  }
  return list;
};

const filterByDate = (list: Goal[], period: GoalPeriod) => {
  const now = new Date();
  const realMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const realYearStr = `${now.getFullYear()}`;

  if (period === 'monthly' || period === 'weekly') {
    return list.filter(g => {
      if (!g.targetDate) return currentMonthStr.value === realMonthStr;
      return g.targetDate.startsWith(currentMonthStr.value);
    });
  } else if (period === 'yearly') {
    return list.filter(g => {
      if (!g.targetDate) return currentYearStr.value === realYearStr;
      return g.targetDate.startsWith(currentYearStr.value);
    });
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

// Stats for monthly (monthly + weekly combined) and yearly
const calcStats = (goalList: Goal[]) => {
  const total = goalList.length;
  const done = goalList.filter(g => g.status === 'done' || g.status === 'archived').length;
  const inProgress = goalList.filter(g => g.status === 'in-progress').length;
  const toDo = total - done - inProgress;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, inProgress, toDo, pct };
};

const monthStats = computed(() => calcStats([...monthlyGoals.value, ...weeklyGoals.value]));
const yearStats = computed(() => calcStats(yearlyGoals.value));

const donutBg = (stats: { total: number; done: number; inProgress: number }) => {
  const trackColor = isDark.value ? '#334155' : '#e2e8f0';
  if (stats.total === 0) return trackColor;
  const doneP = (stats.done / stats.total) * 100;
  const ipP = (stats.inProgress / stats.total) * 100;
  return `conic-gradient(#10b981 0% ${doneP}%, #8b5cf6 ${doneP}% ${doneP + ipP}%, ${trackColor} ${doneP + ipP}% 100%)`;
};

const updateGoals = async (context: { period: GoalPeriod, weekNumber?: number }, newGoals: Goal[]) => {
  // Find goals that don't match the new context
  const goalsToUpdate = newGoals.filter(g => {
    if (g.period !== context.period) return true;
    if (context.period === 'weekly' && g.weekNumber !== context.weekNumber) return true;
    return false;
  });

  if (goalsToUpdate.length === 0) return;

  // Calculate targetDate for the context (1st of viewed month/year, LOCAL time)
  const viewed = currentDate.value;
  const targetDateObj = context.period === 'yearly'
    ? new Date(currentYearForYearly.value, 0, 1)
    : new Date(viewed.getFullYear(), viewed.getMonth(), 1);
  const targetDate = formatDateLocal(targetDateObj);

  const updatedGoals = goalsToUpdate.map(g => ({
    ...g,
    period: context.period,
    weekNumber: context.weekNumber, // specific week or undefined
    targetDate: targetDate,
    updated_at: new Date().toISOString() // for local view
  }));

  // Save previous state for rollback
  const previousGoals = [...goals.value];

  // Update local state
  goals.value = goals.value.map(g => {
    const updated = updatedGoals.find(u => u.id === g.id);
    return updated || g;
  });

  // Persist to Supabase (parallel)
  const payload = {
    period: context.period,
    target_date: targetDate,
    week_number: context.weekNumber ?? null,
    updated_at: new Date().toISOString()
  };

  const results = await Promise.all(
    updatedGoals.map(goal =>
      supabase.from('goals').update(payload).eq('id', goal.id)
    )
  );

  const failed = results.filter(r => r.error);
  if (failed.length > 0) {
    goals.value = previousGoals;
    showError(t('app.errorUpdate', failed.length));
  }
};

const openAddModal = () => {
  editingGoal.value = null;
  isModalOpen.value = true;
};

const openEditModal = (goal: Goal) => {
  editingGoal.value = goal;
  isModalOpen.value = true;
};

const saveGoal = async (goalData: { 
  id?: string; 
  title: string; 
  description: string; 
  period: GoalPeriod; 
  status: GoalStatus; 
  progress: number; 
  weekNumber?: number;
  targetDate?: string;
}) => {
  if (!session.value) return;

  const payload: any = {
    title: goalData.title,
    description: goalData.description,
    period: goalData.period,
    status: goalData.status,
    progress: goalData.progress,
    updated_at: new Date().toISOString(),
    user_id: session.value.user.id,
    target_date: goalData.targetDate,
    week_number: goalData.period === 'weekly' ? goalData.weekNumber : null
  };

  if (goalData.id) {
    // Update
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
    
    const { error } = await supabase.from('goals').update(payload).eq('id', goalData.id);
    if (error) {
      showError(t('app.errorUpdateGoal'));
      await fetchGoals();
    }
  } else {
    // Insert
    const { data, error } = await supabase.from('goals').insert(payload).select().single();
    if (error) {
      showError(t('app.errorCreate'));
      return;
    }
    if (data) {
      goals.value.unshift({
        id: data.id,
        title: data.title,
        description: data.description,
        period: data.period,
        status: data.status,
        progress: data.progress,
        createdAt: new Date(data.created_at).getTime(),
        weekNumber: data.week_number,
        targetDate: data.target_date
      });
    }
  }
  isModalOpen.value = false;
  editingGoal.value = null;
};

const startGoal = async (id: string) => {
  const goal = goals.value.find(g => g.id === id);
  if (!goal) return;

  const prevStatus = goal.status;
  const prevTargetDate = goal.targetDate;

  // Set targetDate to 1st day of current viewed month
  const targetDateObj = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1);
  const targetDate = formatDateLocal(targetDateObj);

  // Optimistic update
  goal.status = 'to-do';
  goal.targetDate = targetDate;

  const { error } = await supabase.from('goals').update({ status: 'to-do', target_date: targetDate, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) {
    goal.status = prevStatus;
    goal.targetDate = prevTargetDate;
    showError(t('app.errorStart'));
  }
};

const deleteGoal = async (id: string) => {
  const previousGoals = [...goals.value];
  goals.value = goals.value.filter(g => g.id !== id);
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) {
    goals.value = previousGoals;
    showError(t('app.errorDelete'));
  }
};

const saveGeneratedGoals = async (generatedGoals: GeneratedGoal[]) => {
  if (!session.value) return;

  const payloads = generatedGoals.map(g => ({
    title: g.title,
    description: g.description,
    period: g.period,
    status: 'to-do' as GoalStatus,
    progress: 0,
    target_date: g.targetDate,
    week_number: g.weekNumber ?? null,
    user_id: session.value!.user.id,
  }));

  const { data, error } = await supabase.from('goals').insert(payloads).select();

  if (error) {
    showError(t('app.errorCreate'));
    return;
  }

  if (data) {
    const newGoals: Goal[] = data.map((g: any) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      period: g.period as GoalPeriod,
      status: g.status as GoalStatus,
      progress: g.progress || 0,
      createdAt: new Date(g.created_at).getTime(),
      weekNumber: g.week_number,
      targetDate: g.target_date,
    }));
    goals.value.unshift(...newGoals);

    showSuccess(t('architect.successAdd', newGoals.length));
  }

  isArchitectOpen.value = false;
};

const openPulseModal = (goal: Goal) => {
  pulseGoal.value = goal;
  isPulseOpen.value = true;
};

const pulseSiblingGoals = computed(() => {
  if (!pulseGoal.value) return [];
  const g = pulseGoal.value;
  return goals.value.filter(sg => {
    if (sg.id === g.id) return false;
    if (sg.period !== g.period) return false;
    if (g.period === 'yearly') return sg.targetDate?.startsWith(currentYearStr.value);
    return sg.targetDate?.startsWith(currentMonthStr.value);
  });
});

const handlePulseUpdate = async ({ id, status, progress }: { id: string; status: string; progress: number }) => {
  const goal = goals.value.find(g => g.id === id);
  if (!goal) return;

  const prevStatus = goal.status;
  const prevProgress = goal.progress;

  goal.status = status as GoalStatus;
  goal.progress = progress;
  isPulseOpen.value = false;
  pulseGoal.value = null;

  const { error } = await supabase.from('goals').update({
    status,
    progress,
    updated_at: new Date().toISOString(),
  }).eq('id', id);

  if (error) {
    goal.status = prevStatus;
    goal.progress = prevProgress;
    showError(t('app.errorUpdateGoal'));
  }
};

const handlePulseEdit = (goal: Goal) => {
  isPulseOpen.value = false;
  pulseGoal.value = null;
  editingGoal.value = goal;
  isModalOpen.value = true;
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <div v-if="session" class="pb-20">
      <!-- Header -->
      <header class="max-w-7xl mx-auto px-6 pt-6 sm:pt-8 pb-5">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-5">
          <div>
            <div class="flex items-center gap-2.5 mb-1">
              <div class="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/30 text-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-5 h-5">
                  <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="2" fill="none"/>
                  <circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
                  <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <h1 class="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">goalr.</h1>
            </div>
            <p class="text-slate-500 dark:text-slate-400 font-medium text-sm">{{ t('app.tagline') }}</p>
          </div>

          <div class="flex items-center gap-3">
            <button
              @click="openAddModal"
              class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-none justify-center focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Plus :size="16" />
              {{ t('app.addGoal') }}
            </button>

            <button
              @click="isArchitectOpen = true"
              class="bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Sparkles :size="16" />
              AI
            </button>

            <button
              @click="toggleDark"
              class="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2.5 rounded-xl font-semibold transition-all shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary"
              :aria-label="isDark ? t('app.switchToLight') : t('app.switchToDark')"
            >
              <Sun v-if="isDark" :size="16" />
              <Moon v-else :size="16" />
            </button>

            <button
              @click="toggleLocale"
              class="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2.5 rounded-xl font-semibold transition-all shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Toggle language"
            >
              <span class="text-xs font-bold">{{ locale === 'en' ? 'EN' : 'PL' }}</span>
            </button>

            <button
              @click="handleSignOut"
              class="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2.5 rounded-xl font-semibold transition-all shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary"
              :aria-label="t('app.signOut')"
            >
              <LogOut :size="16" />
            </button>
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
                ? 'text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/50'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
            ]"
          >
            <component :is="view.icon" :size="14" />
            {{ view.label }}
          </button>
        </div>
      </header>

      <!-- Loading Skeleton -->
      <main v-if="isLoading" class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div class="xl:col-span-3 space-y-3">
            <div class="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3"></div>
            <div class="bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-4 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <div v-for="i in 3" :key="i" class="bg-white dark:bg-slate-800 rounded-lg p-3.5 space-y-2">
                  <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
                  <div class="h-3 bg-slate-100 dark:bg-slate-700/50 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
              <div v-for="w in 2" :key="w" class="bg-white dark:bg-slate-800 rounded-lg p-3">
                <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-16 mb-2"></div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div v-for="j in 2" :key="j" class="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3.5 space-y-2">
                    <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3"></div>
                    <div class="h-3 bg-slate-100 dark:bg-slate-700/50 rounded animate-pulse w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="xl:col-span-1">
            <div class="h-6 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3"></div>
            <div class="bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-3 space-y-2">
              <div v-for="i in 2" :key="i" class="bg-white dark:bg-slate-800 rounded-lg p-3.5 space-y-2">
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
                <div class="h-3 bg-slate-100 dark:bg-slate-700/50 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Backlog (flat grid) -->
      <main v-else-if="currentView === 'backlog'" class="max-w-7xl mx-auto px-6">
        <div class="mb-4">
          <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200">{{ t('app.backlogTitle') }}</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ t('app.backlogDesc') }}</p>
        </div>

        <div v-if="backlogGoals.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
          <Inbox :size="32" class="text-slate-300 dark:text-slate-600 mb-2" />
          <p class="text-sm text-slate-400 dark:text-slate-500 font-medium">{{ t('app.backlogEmpty') }}</p>
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
                <button @click="navigateMonth(-1)" class="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400" :aria-label="t('app.prevMonth')">
                  <ChevronLeft :size="18" />
                </button>
                <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200">{{ currentMonthName }} <span class="text-emerald-600">{{ currentYear }}</span></h2>
                <button @click="navigateMonth(1)" class="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400" :aria-label="t('app.nextMonth')">
                  <ChevronRight :size="18" />
                </button>
                <button
                  v-if="!isCurrentMonth"
                  @click="goToToday"
                  class="ml-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors"
                >
                  {{ t('app.today') }}
                </button>
             </div>

             <div class="bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-5">
               <!-- Month Stats Bar -->
               <div v-if="monthStats.total > 0" class="flex items-center gap-3 mx-4 mt-4 px-3 py-2 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-700">
                 <div class="relative w-8 h-8 rounded-full shrink-0 transition-all duration-500" :style="{ background: donutBg(monthStats) }">
                   <div class="absolute inset-[5px] rounded-full bg-white/90 dark:bg-slate-800/90"></div>
                   <span class="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-300">{{ monthStats.pct }}</span>
                 </div>
                 <div class="flex items-center gap-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 flex-wrap">
                   <span>{{ monthStats.total }} {{ t('app.total') }}</span>
                   <span class="text-slate-200 dark:text-slate-600">&middot;</span>
                   <span class="text-emerald-600">{{ monthStats.done }} {{ t('app.done') }}</span>
                   <span class="text-slate-200 dark:text-slate-600">&middot;</span>
                   <span class="text-violet-600 dark:text-violet-400">{{ monthStats.inProgress }} {{ t('app.inProgress') }}</span>
                   <span class="text-slate-200 dark:text-slate-600">&middot;</span>
                   <span class="text-blue-600">{{ monthStats.toDo }} {{ t('app.toDo') }}</span>
                 </div>
                 <div class="ml-auto flex items-center gap-2 shrink-0">
                   <div class="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                     <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700" :style="{ width: monthStats.pct + '%' }"></div>
                   </div>
                   <span class="text-[11px] font-semibold text-emerald-600">{{ monthStats.pct }}%</span>
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
                  @pulse-goal="openPulseModal"
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
                    @pulse-goal="openPulseModal"
                  />
               </div>
             </div>
          </div>

          <!-- RIGHT COLUMN: Current Year (1/4 width) -->
          <div v-if="showYearlyColumn" class="xl:col-span-1 space-y-3">
              <div class="flex items-center gap-2 mb-3">
                <button @click="navigateYear(-1)" class="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400" :aria-label="t('app.prevYear')">
                  <ChevronLeft :size="18" />
                </button>
                <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200">{{ t('app.yearLabel') }} <span class="text-indigo-600">{{ currentYearForYearly }}</span></h2>
                <button @click="navigateYear(1)" class="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400" :aria-label="t('app.nextYear')">
                  <ChevronRight :size="18" />
                </button>
                <button
                  v-if="!isCurrentYear"
                  @click="goToToday"
                  class="ml-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-950 transition-colors"
                >
                  {{ t('app.today') }}
                </button>
                <button
                  @click="toggleYearlyColumn"
                  class="ml-auto p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  :aria-label="t('app.collapseYearly')"
                >
                  <ChevronsRight :size="16" />
                </button>
              </div>

             <!-- Year Stats Bar -->
             <div v-if="yearStats.total > 0" class="flex items-center gap-2.5 px-3 py-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50 mb-1">
               <div class="relative w-7 h-7 rounded-full shrink-0 transition-all duration-500" :style="{ background: donutBg(yearStats) }">
                 <div class="absolute inset-[5px] rounded-full bg-white/90 dark:bg-slate-800/90"></div>
                 <span class="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-slate-600 dark:text-slate-300">{{ yearStats.pct }}</span>
               </div>
               <div class="flex flex-col gap-1 flex-1 min-w-0">
                 <div class="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 flex-wrap">
                   <span class="text-emerald-600">{{ yearStats.done }}<span class="text-slate-300 dark:text-slate-600">/</span>{{ yearStats.total }}</span>
                   <span class="text-slate-200 dark:text-slate-600">&middot;</span>
                   <span class="text-violet-500 dark:text-violet-400">{{ yearStats.inProgress }} {{ t('app.wip') }}</span>
                 </div>
                 <div class="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                   <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700" :style="{ width: yearStats.pct + '%' }"></div>
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
                @pulse-goal="openPulseModal"
             />
          </div>

          <!-- COLLAPSED YEARLY COLUMN -->
          <div
            v-else
            @click="toggleYearlyColumn"
            class="hidden xl:flex flex-col items-center gap-3 pt-3 w-10 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <ChevronLeft :size="16" class="text-slate-400 shrink-0" />
            <span class="text-xs font-semibold text-slate-400 [writing-mode:vertical-lr]">{{ t('app.yearly') }}</span>
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

      <GoalArchitectModal
        v-if="isArchitectOpen"
        @close="isArchitectOpen = false"
        @save="saveGeneratedGoals"
      />

      <GoalPulseModal
        v-if="isPulseOpen && pulseGoal"
        :goal="pulseGoal"
        :sibling-goals="pulseSiblingGoals"
        @close="isPulseOpen = false; pulseGoal = null"
        @update-goal="handlePulseUpdate"
        @edit-goal="handlePulseEdit"
      />
    </div>

    <AuthScreen v-else />

    <!-- Toast Notifications -->
    <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-center gap-3 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm animate-in slide-in-from-right fade-in duration-300"
        :class="toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'"
      >
        <span class="flex-1">{{ toast.message }}</span>
        <button @click="dismissToast(toast.id)" class="text-white/70 hover:text-white transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-white rounded" :aria-label="t('app.dismissNotification')">
          <X :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>
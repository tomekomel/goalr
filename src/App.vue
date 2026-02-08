<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Plus, Target, LogOut, LayoutDashboard, ListTodo, Archive, X } from 'lucide-vue-next';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';
import type { Goal, GoalPeriod, GoalStatus } from './types';
import GoalColumn from './components/GoalColumn.vue';
import GoalModal from './components/GoalModal.vue';
import AuthScreen from './components/AuthScreen.vue';

const session = ref<Session | null>(null);

// Toast notifications
const toasts = ref<{ id: number; message: string }[]>([]);
let toastId = 0;

const showError = (message: string) => {
  const id = ++toastId;
  toasts.value.push({ id, message });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 5000);
};

const dismissToast = (id: number) => {
  toasts.value = toasts.value.filter(t => t.id !== id);
};
const isModalOpen = ref(false);
const editingGoal = ref<Goal | null>(null);

type ViewType = 'dashboard' | 'backlog' | 'archive';
const currentView = ref<ViewType>('dashboard');

const views = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'backlog', label: 'Backlog', icon: ListTodo },
  { id: 'archive', label: 'Archive', icon: Archive },
];

const goals = ref<Goal[]>([]);
const currentDate = ref(new Date());

const currentMonthName = computed(() => currentDate.value.toLocaleString('default', { month: 'long' }));
const currentYear = computed(() => currentDate.value.getFullYear());

// Helper to format date as YYYY-MM-DD in LOCAL time
const formatDateLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fetchGoals = async () => {
  if (!session.value) return;

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    showError('Failed to load goals. Please try refreshing the page.');
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
      weekNumber: g.week_number || (g.period === 'weekly' ? currentWeek : undefined), // Default to current week if missing
      targetDate: g.target_date
    }));
  }
};

let authSubscription: { unsubscribe: () => void } | null = null;

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session;
    if (session.value) fetchGoals();
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
const currentYearStr = computed(() => `${currentDate.value.getFullYear()}`);

const filterByView = (list: Goal[]) => {
  if (currentView.value === 'dashboard') {
    return list.filter(g => ['to-do', 'in-progress', 'done'].includes(g.status));
  } else if (currentView.value === 'backlog') {
    return list.filter(g => g.status === 'planned');
  } else if (currentView.value === 'archive') {
    return list.filter(g => g.status === 'archived');
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

const updateGoals = async (context: { period: GoalPeriod, weekNumber?: number }, newGoals: Goal[]) => {
  // Find goals that don't match the new context
  const goalsToUpdate = newGoals.filter(g => {
    if (g.period !== context.period) return true;
    if (context.period === 'weekly' && g.weekNumber !== context.weekNumber) return true;
    return false;
  });

  if (goalsToUpdate.length === 0) return;

  // Calculate targetDate for the context (1st of current month, LOCAL time)
  const now = new Date();
  const targetDateObj = new Date(now.getFullYear(), now.getMonth(), 1);
  const targetDate = formatDateLocal(targetDateObj);

  const updatedGoals = goalsToUpdate.map(g => ({
    ...g,
    period: context.period,
    weekNumber: context.weekNumber, // specific week or undefined
    targetDate: targetDate,
    updated_at: new Date().toISOString() // for local view
  }));

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
    showError(`Failed to update ${failed.length} goal(s). Changes may not be saved.`);
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
      showError('Failed to update goal. Please try again.');
      await fetchGoals();
    }
  } else {
    // Insert
    const { data, error } = await supabase.from('goals').insert(payload).select().single();
    if (error) {
      showError('Failed to create goal. Please try again.');
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

const deleteGoal = async (id: string) => {
  const previousGoals = [...goals.value];
  goals.value = goals.value.filter(g => g.id !== id);
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) {
    goals.value = previousGoals;
    showError('Failed to delete goal. Please try again.');
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div v-if="session" class="pb-20">
      <!-- Header -->
      <header class="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div class="flex justify-between items-end mb-8">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <div class="bg-primary p-2 rounded-xl shadow-lg shadow-primary/30 text-white">
                <Target :size="24" />
              </div>
              <h1 class="text-4xl font-black text-slate-900 tracking-tighter">goalr.</h1>
            </div>
            <p class="text-slate-500 font-medium">Design your future, step by step.</p>
          </div>

          <div class="flex items-center gap-4">
             <button
              @click="handleSignOut"
              class="bg-white hover:bg-slate-50 text-slate-500 px-4 py-3.5 rounded-2xl font-bold transition-all shadow-sm border border-slate-200 cursor-pointer flex items-center gap-2"
              title="Sign Out"
            >
              <LogOut :size="20" />
            </button>
            
            <button
              @click="openAddModal"
              class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-200 flex items-center gap-2 cursor-pointer"
            >
              <Plus :size="20" />
              Add Goal
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-2 pb-1">
          <button
            v-for="view in views"
            :key="view.id"
            @click="currentView = view.id as ViewType"
            class="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all"
            :class="[
              currentView === view.id 
                ? 'text-emerald-600 bg-emerald-50/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            ]"
          >
            <component :is="view.icon" :size="16" />
            {{ view.label }}
          </button>
        </div>
      </header>

      <!-- Board -->
      <main class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          <!-- LEFT COLUMN: Current Month (3/4 width) -->
          <div class="xl:col-span-3 space-y-4">
             <div class="flex items-center gap-3 mb-2">
                <h2 class="text-2xl font-bold text-slate-800">Current Month: <span class="text-emerald-600">{{ currentMonthName }}</span></h2>
             </div>

             <div class="bg-slate-100/50 rounded-xl p-6 border border-slate-200/50 flex flex-col gap-8">
               <!-- Row 1: Monthly Goals -->
               <GoalColumn
                  title="Monthly Focus"
                  period="monthly"
                  :goals="monthlyGoals"
                  variant="highlight"
                  @update:goals="updateGoals({ period: 'monthly' }, $event)"
                  @delete-goal="deleteGoal"
                  @edit-goal="openEditModal"
               />

               <!-- Rows 2-5: Weekly Goals -->
               <div class="flex flex-col gap-4">
                  <GoalColumn
                    v-for="week in 4"
                    :key="week"
                    :title="`Week ${week}`"
                    period="weekly"
                    variant="compact"
                    :goals="getWeekGoals(week)"
                    @update:goals="updateGoals({ period: 'weekly', weekNumber: week }, $event)"
                    @delete-goal="deleteGoal"
                    @edit-goal="openEditModal"
                  />
               </div>
             </div>
          </div>

          <!-- RIGHT COLUMN: Current Year (1/4 width) -->
          <div class="xl:col-span-1 space-y-6">
              <div class="flex items-center gap-3 mb-2">
                <h2 class="text-2xl font-bold text-slate-800">Year: <span class="text-indigo-600">{{ currentYear }}</span></h2>
             </div>
             
             <GoalColumn
                title="Yearly Goals"
                period="yearly"
                :goals="yearlyGoals"
                @update:goals="updateGoals({ period: 'yearly' }, $event)"
                @delete-goal="deleteGoal"
                @edit-goal="openEditModal"
             />
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

    <AuthScreen v-else />

    <!-- Toast Notifications -->
    <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-center gap-3 bg-red-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm animate-in slide-in-from-right fade-in duration-300"
      >
        <span class="flex-1">{{ toast.message }}</span>
        <button @click="dismissToast(toast.id)" class="text-white/70 hover:text-white transition-colors shrink-0">
          <X :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>
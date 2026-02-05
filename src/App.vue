<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, Target, LogOut } from 'lucide-vue-next';
import { supabase } from './supabase';
import type { Goal, GoalPeriod, GoalStatus } from './types';
import GoalColumn from './components/GoalColumn.vue';
import GoalModal from './components/GoalModal.vue';
import AuthScreen from './components/AuthScreen.vue';

const session = ref<any>(null);
const isModalOpen = ref(false);
const editingGoal = ref<Goal | null>(null);

const goals = ref<Goal[]>([]);

const fetchGoals = async () => {
  if (!session.value) return;

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching goals:', error);
    return;
  }

  if (data) {
    goals.value = data.map((g: any) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      period: g.period as GoalPeriod,
      status: (g.status || 'planned') as GoalStatus,
      progress: g.progress || 0,
      createdAt: new Date(g.created_at).getTime()
    }));
  }
};

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session;
    if (session.value) fetchGoals();
  });

  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session;
    if (_session) fetchGoals();
    else goals.value = [];
  });
});

const handleSignOut = async () => {
  await supabase.auth.signOut();
};

const getGoalsByPeriod = (period: GoalPeriod) => {
  return goals.value.filter(g => g.period === period);
};

const updateGoalsForPeriod = async (period: GoalPeriod, newGoals: Goal[]) => {
  // Identify goals that actually changed period
  const goalsToUpdate = newGoals.filter(g => g.period !== period);

  // Optimistic Update
  const otherGoals = goals.value.filter(g => g.period !== period);
  const updatedPeriodGoals = newGoals.map(g => ({ ...g, period }));
  goals.value = [...otherGoals, ...updatedPeriodGoals];

  // Persist changes to Supabase
  for (const goal of goalsToUpdate) {
    const { error } = await supabase
      .from('goals')
      .update({
        period,
        updated_at: new Date().toISOString()
      })
      .eq('id', goal.id);

    if (error) {
      console.error(`Failed to update period for goal ${goal.id}:`, error);
      // Ideally rollback here, but for now we log error
    }
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

const saveGoal = async (goalData: { id?: string; title: string; description: string; period: GoalPeriod; status: GoalStatus; progress: number }) => {
  if (!session.value) return;

  const payload = {
    title: goalData.title,
    description: goalData.description,
    period: goalData.period,
    status: goalData.status,
    progress: goalData.progress,
    updated_at: new Date().toISOString(),
    user_id: session.value.user.id
  };

  if (goalData.id) {
    // Optimistic Update
    const index = goals.value.findIndex(g => g.id === goalData.id);
    if (index !== -1) {
      goals.value[index] = {
        ...goals.value[index],
        ...goalData,
        id: goalData.id
      } as Goal;
    }

    const { error } = await supabase
      .from('goals')
      .update(payload)
      .eq('id', goalData.id);

    if (error) {
      console.error('Error updating goal:', error);
      await fetchGoals(); // Revert/Refresh on error
    }
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('goals')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
    } else if (data) {
      const newGoal: Goal = {
        id: data.id,
        title: data.title,
        description: data.description,
        period: data.period as GoalPeriod,
        status: data.status as GoalStatus,
        progress: data.progress ?? 0,
        createdAt: new Date(data.created_at).getTime(),
      };
      goals.value.unshift(newGoal); // Add to top
    }
  }
  isModalOpen.value = false;
  editingGoal.value = null;
};

const deleteGoal = async (id: string) => {
  // Optimistic Delete
  const previousGoals = [...goals.value];
  goals.value = goals.value.filter(g => g.id !== id);

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting goal:', error);
    goals.value = previousGoals; // Revert
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Authenticated App -->
    <div v-if="session" class="pb-20">
      <!-- Header -->
      <header class="max-w-7xl mx-auto px-6 py-12 flex justify-between items-end">
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
      </header>

      <!-- Board -->
      <main class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GoalColumn
            title="Weekly"
            period="weekly"
            :goals="getGoalsByPeriod('weekly')"
            @update:goals="updateGoalsForPeriod('weekly', $event)"
            @delete-goal="deleteGoal"
            @edit-goal="openEditModal"
          />
          <GoalColumn
            title="Monthly"
            period="monthly"
            :goals="getGoalsByPeriod('monthly')"
            @update:goals="updateGoalsForPeriod('monthly', $event)"
            @delete-goal="deleteGoal"
            @edit-goal="openEditModal"
          />
          <GoalColumn
            title="Yearly"
            period="yearly"
            :goals="getGoalsByPeriod('yearly')"
            @update:goals="updateGoalsForPeriod('yearly', $event)"
            @delete-goal="deleteGoal"
            @edit-goal="openEditModal"
          />
        </div>
      </main>

      <!-- Modal -->
      <GoalModal
        v-if="isModalOpen"
        :is-open="isModalOpen"
        :goal="editingGoal"
        @close="isModalOpen = false"
        @save="saveGoal"
      />
    </div>

    <!-- Login Screen -->
    <AuthScreen v-else />
  </div>
</template>
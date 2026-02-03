<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Plus, Target } from 'lucide-vue-next';
import type { Goal, GoalPeriod, GoalStatus } from './types';
import GoalColumn from './components/GoalColumn.vue';
import GoalModal from './components/GoalModal.vue';

const isModalOpen = ref(false);
const editingGoal = ref<Goal | null>(null);

const goals = ref<Goal[]>([
  {
    id: '1',
    title: 'Morning Run',
    description: 'Run at least 5km every morning before work.',
    period: 'weekly',
    status: 'in-progress',
    createdAt: Date.now(),
  },
  {
    id: '2',
    title: 'Vue Advanced Course',
    description: 'Complete the module on Composition API and Performance.',
    period: 'monthly',
    status: 'to-do',
    createdAt: Date.now(),
  },
  {
    id: '3',
    title: 'Trip to Japan',
    description: 'Save funds and plan the route through Tokyo and Kyoto.',
    period: 'yearly',
    status: 'planned',
    createdAt: Date.now(),
  }
]);

// Persistence
onMounted(() => {
  const saved = localStorage.getItem('goalr-goals');
  if (saved) {
    try {
      const parsedGoals = JSON.parse(saved);
      if (Array.isArray(parsedGoals)) {
        goals.value = parsedGoals.map((g: any) => ({
          ...g,
          status: g.status || 'planned'
        }));
      }
    } catch (e) {
      console.error('Failed to parse goals from localStorage:', e);
    }
  }
});

watch(goals, (newGoals) => {
  localStorage.setItem('goalr-goals', JSON.stringify(newGoals));
}, { deep: true });

const getGoalsByPeriod = (period: GoalPeriod) => {
  return goals.value.filter(g => g.period === period);
};

const updateGoalsForPeriod = (period: GoalPeriod, newGoals: Goal[]) => {
  // We need to keep other periods intact
  const otherGoals = goals.value.filter(g => g.period !== period);
  // Update the period for dragged items (if they moved from another column)
  const updatedPeriodGoals = newGoals.map(g => ({ ...g, period }));
  goals.value = [...otherGoals, ...updatedPeriodGoals];
};

const openAddModal = () => {
  editingGoal.value = null;
  isModalOpen.value = true;
};

const openEditModal = (goal: Goal) => {
  editingGoal.value = goal;
  isModalOpen.value = true;
};

const saveGoal = (goalData: { id?: string; title: string; description: string; period: GoalPeriod; status: GoalStatus }) => {
  if (goalData.id) {
    // Update existing
    const index = goals.value.findIndex(g => g.id === goalData.id);
    if (index !== -1) {
      goals.value[index] = {
        ...goals.value[index],
        ...goalData,
        id: goalData.id!
      } as Goal;
    }
  } else {
    // Add new
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title: goalData.title,
      description: goalData.description,
      period: goalData.period,
      status: goalData.status,
      createdAt: Date.now(),
    };
    goals.value.push(newGoal);
  }
  isModalOpen.value = false;
  editingGoal.value = null;
};

const deleteGoal = (id: string) => {
  goals.value = goals.value.filter(g => g.id !== id);
};
</script>

<template>
  <div class="min-h-screen pb-20">
    <!-- Header -->
    <header class="max-w-7xl mx-auto px-6 py-12 flex justify-between items-end">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <div class="bg-primary p-2 rounded-xl shadow-lg shadow-primary/30 text-white">
            <Target :size="24" />
          </div>
          <h1 class="text-4xl font-black text-slate-900 tracking-tight italic">goalr.</h1>
        </div>
        <p class="text-slate-500 font-medium">Design your future, step by step.</p>
      </div>
      
      <button 
        @click="openAddModal"
        class="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
      >
        <Plus :size="20" />
        Add Goal
      </button>
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
</template>

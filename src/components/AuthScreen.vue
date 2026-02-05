<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '../supabase';
import { Target } from 'lucide-vue-next';

const isLoading = ref(false);

const handleLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
  try {
    isLoading.value = true;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  } catch (error) {
    console.error('Error logging in:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-8 md:p-10 border border-slate-100 animate-in fade-in zoom-in duration-300">
      
      <!-- Header -->
      <div class="text-center mb-10">
        <div class="flex items-center justify-center gap-3 mb-4">
          <div class="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/30 text-white">
            <Target :size="32" />
          </div>
        </div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tighter mb-2">goalr.</h1>
        <p class="text-slate-500 font-medium text-sm">Design your future, step by step.</p>
      </div>

      <!-- Actions -->
      <div class="flex flex-col items-center gap-6">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Sign in with</p>
        
        <div class="flex items-center justify-center gap-4 w-full">
          <!-- Google -->
          <button
            @click="handleLogin('google')"
            :disabled="isLoading"
            title="Continue with Google"
            class="group relative flex items-center justify-center w-16 h-16 bg-white border border-slate-200 rounded-2xl transition-all hover:scale-105 hover:shadow-xl hover:border-slate-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-6 h-6 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>

          <!-- Facebook -->
          <button
            @click="handleLogin('facebook')"
            :disabled="isLoading"
            title="Continue with Facebook"
            class="group relative flex items-center justify-center w-16 h-16 bg-[#1877F2] text-white rounded-2xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-7 h-7 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>

          <!-- Twitter / X -->
          <button
            @click="handleLogin('twitter')"
            :disabled="isLoading"
            title="Continue with X"
            class="group relative flex items-center justify-center w-16 h-16 bg-slate-900 text-white rounded-2xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-slate-900/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-10 text-center">
        <p class="text-[10px] text-slate-400 font-medium px-4 leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  </div>
</template>

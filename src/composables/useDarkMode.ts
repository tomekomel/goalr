import { ref, watch } from 'vue';

const isDark = ref(false);

function init() {
  const stored = localStorage.getItem('theme');
  if (stored) {
    isDark.value = stored === 'dark';
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  apply();

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      isDark.value = e.matches;
    }
  });
}

function apply() {
  document.documentElement.classList.toggle('dark', isDark.value);
}

watch(isDark, (val) => {
  localStorage.setItem('theme', val ? 'dark' : 'light');
  apply();
});

init();

export function useDarkMode() {
  const toggle = () => {
    isDark.value = !isDark.value;
  };

  return { isDark, toggle };
}

import { ref, watch, computed } from 'vue';

type Locale = 'en' | 'pl';

const locale = ref<Locale>((localStorage.getItem('locale') as Locale) || 'en');

watch(locale, (val) => {
  localStorage.setItem('locale', val);
});

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // App - Header & Nav
    'app.tagline': 'Design your future, step by step.',
    'app.addGoal': 'Add Goal',
    'app.switchToLight': 'Switch to light mode',
    'app.switchToDark': 'Switch to dark mode',
    'app.signOut': 'Sign out',
    'app.dashboard': 'Dashboard',
    'app.backlog': 'Backlog',

    // App - Backlog
    'app.backlogTitle': 'Backlog',
    'app.backlogDesc': 'Ideas and goals waiting to be started.',
    'app.backlogEmpty': 'Backlog is empty. Great job planning!',

    // App - Dashboard Month
    'app.prevMonth': 'Previous month',
    'app.nextMonth': 'Next month',
    'app.today': 'Today',
    'app.total': 'total',
    'app.done': 'done',
    'app.inProgress': 'in progress',
    'app.toDo': 'to-do',
    'app.monthlyFocus': 'Monthly Focus',
    'app.week': 'Week {0}',

    // App - Dashboard Year
    'app.prevYear': 'Previous year',
    'app.nextYear': 'Next year',
    'app.yearLabel': 'Year:',
    'app.wip': 'wip',
    'app.yearlyGoals': 'Yearly Goals',
    'app.collapseYearly': 'Collapse yearly column',
    'app.yearly': 'Yearly',

    // App - Empty messages
    'app.emptyMonthly': 'No monthly goals. Add one or move from Backlog.',
    'app.emptyWeekly': 'No goals this week.',
    'app.emptyYearly': 'No yearly goals yet.',

    // App - Error messages
    'app.errorLoad': 'Failed to load goals. Please try refreshing the page.',
    'app.errorUpdate': 'Failed to update {0} goal(s). Changes may not be saved.',
    'app.errorUpdateGoal': 'Failed to update goal. Please try again.',
    'app.errorCreate': 'Failed to create goal. Please try again.',
    'app.errorStart': 'Failed to start goal. Please try again.',
    'app.errorDelete': 'Failed to delete goal. Please try again.',
    'app.dismissNotification': 'Dismiss notification',

    // Auth
    'auth.tagline': 'Design your future, step by step.',
    'auth.signInWith': 'Sign in with',
    'auth.continueGoogle': 'Continue with Google',
    'auth.continueFacebook': 'Continue with Facebook',
    'auth.continueX': 'Continue with X',
    'auth.legal': 'By continuing, you agree to our Terms of Service and Privacy Policy.',

    // GoalCard
    'card.status.planned': 'planned',
    'card.status.to-do': 'to do',
    'card.status.in-progress': 'in progress',
    'card.status.done': 'done',
    'card.confirmDelete': 'Delete?',
    'card.cancelDelete': 'Cancel delete',
    'card.start': 'Start',
    'card.editGoal': 'Edit goal',
    'card.deleteGoal': 'Delete goal',

    // GoalColumn
    'column.current': 'Current',
    'column.empty': 'No goals here yet.',

    // GoalModal
    'modal.editGoal': 'Edit Goal',
    'modal.newGoal': 'New Goal',
    'modal.closeModal': 'Close modal',
    'modal.goalTitle': 'Goal Title',
    'modal.titlePlaceholder': 'What do you want to achieve?',
    'modal.description': 'Description (optional)',
    'modal.descPlaceholder': 'Add more details...',
    'modal.currentProgress': 'Current Progress',
    'modal.period': 'Period',
    'modal.status': 'Status',
    'modal.weekNumber': 'Week Number',
    'modal.week': 'Week {0}',
    'modal.selectYear': 'Select Year',
    'modal.selectMonthYear': 'Select Month & Year',
    'modal.saveChanges': 'Save Changes',
    'modal.addGoal': 'Add Goal',
    'modal.period.weekly': 'weekly',
    'modal.period.monthly': 'monthly',
    'modal.period.yearly': 'yearly',
    'modal.status.planned': 'Planned',
    'modal.status.to-do': 'To Do',
    'modal.status.in-progress': 'In Progress',
    'modal.status.done': 'Done',
    'modal.month.0': 'Jan',
    'modal.month.1': 'Feb',
    'modal.month.2': 'Mar',
    'modal.month.3': 'Apr',
    'modal.month.4': 'May',
    'modal.month.5': 'Jun',
    'modal.month.6': 'Jul',
    'modal.month.7': 'Aug',
    'modal.month.8': 'Sep',
    'modal.month.9': 'Oct',
    'modal.month.10': 'Nov',
    'modal.month.11': 'Dec',

    // Goal Architect
    'architect.title': 'Goal Architect',
    'architect.placeholder': 'Describe your goal in a few sentences...',
    'architect.generate': 'Generate plan',
    'architect.generating': 'AI is creating your plan...',
    'architect.regenerate': 'Regenerate',
    'architect.addSelected': 'Add selected',
    'architect.cancel': 'Cancel',
    'architect.yearly': 'Yearly Goals',
    'architect.monthly': 'Monthly Goals',
    'architect.weekly': 'Weekly Goals',
    'architect.example1': 'Learn Spanish to B1 level this year',
    'architect.example2': 'Run a half marathon in 6 months',
    'architect.example3': 'Read 24 books this year',
    'architect.errorGenerate': 'Failed to generate goals. Please try again.',
    'architect.successAdd': 'Added {0} goals!',
    'architect.noneSelected': 'Select at least one goal',
  },
  pl: {
    // App - Header & Nav
    'app.tagline': 'Projektuj swoją przyszłość, krok po kroku.',
    'app.addGoal': 'Dodaj cel',
    'app.switchToLight': 'Przełącz na jasny motyw',
    'app.switchToDark': 'Przełącz na ciemny motyw',
    'app.signOut': 'Wyloguj się',
    'app.dashboard': 'Tablica',
    'app.backlog': 'Backlog',

    // App - Backlog
    'app.backlogTitle': 'Backlog',
    'app.backlogDesc': 'Pomysły i cele czekające na rozpoczęcie.',
    'app.backlogEmpty': 'Backlog jest pusty. Świetna robota!',

    // App - Dashboard Month
    'app.prevMonth': 'Poprzedni miesiąc',
    'app.nextMonth': 'Następny miesiąc',
    'app.today': 'Dziś',
    'app.total': 'łącznie',
    'app.done': 'ukończone',
    'app.inProgress': 'w trakcie',
    'app.toDo': 'do zrobienia',
    'app.monthlyFocus': 'Cele miesięczne',
    'app.week': 'Tydzień {0}',

    // App - Dashboard Year
    'app.prevYear': 'Poprzedni rok',
    'app.nextYear': 'Następny rok',
    'app.yearLabel': 'Rok:',
    'app.wip': 'w trakcie',
    'app.yearlyGoals': 'Cele roczne',
    'app.collapseYearly': 'Zwiń kolumnę roczną',
    'app.yearly': 'Roczne',

    // App - Empty messages
    'app.emptyMonthly': 'Brak celów miesięcznych. Dodaj nowy lub przenieś z Backlogu.',
    'app.emptyWeekly': 'Brak celów w tym tygodniu.',
    'app.emptyYearly': 'Brak celów rocznych.',

    // App - Error messages
    'app.errorLoad': 'Nie udało się załadować celów. Spróbuj odświeżyć stronę.',
    'app.errorUpdate': 'Nie udało się zaktualizować {0} celu(-ów). Zmiany mogą nie zostać zapisane.',
    'app.errorUpdateGoal': 'Nie udało się zaktualizować celu. Spróbuj ponownie.',
    'app.errorCreate': 'Nie udało się utworzyć celu. Spróbuj ponownie.',
    'app.errorStart': 'Nie udało się rozpocząć celu. Spróbuj ponownie.',
    'app.errorDelete': 'Nie udało się usunąć celu. Spróbuj ponownie.',
    'app.dismissNotification': 'Zamknij powiadomienie',

    // Auth
    'auth.tagline': 'Projektuj swoją przyszłość, krok po kroku.',
    'auth.signInWith': 'Zaloguj się przez',
    'auth.continueGoogle': 'Kontynuuj z Google',
    'auth.continueFacebook': 'Kontynuuj z Facebook',
    'auth.continueX': 'Kontynuuj z X',
    'auth.legal': 'Kontynuując, akceptujesz Regulamin i Politykę Prywatności.',

    // GoalCard
    'card.status.planned': 'zaplanowane',
    'card.status.to-do': 'do zrobienia',
    'card.status.in-progress': 'w trakcie',
    'card.status.done': 'ukończone',
    'card.confirmDelete': 'Usunąć?',
    'card.cancelDelete': 'Anuluj usuwanie',
    'card.start': 'Rozpocznij',
    'card.editGoal': 'Edytuj cel',
    'card.deleteGoal': 'Usuń cel',

    // GoalColumn
    'column.current': 'Bieżący',
    'column.empty': 'Brak celów.',

    // GoalModal
    'modal.editGoal': 'Edytuj cel',
    'modal.newGoal': 'Nowy cel',
    'modal.closeModal': 'Zamknij okno',
    'modal.goalTitle': 'Tytuł celu',
    'modal.titlePlaceholder': 'Co chcesz osiągnąć?',
    'modal.description': 'Opis (opcjonalnie)',
    'modal.descPlaceholder': 'Dodaj więcej szczegółów...',
    'modal.currentProgress': 'Aktualny postęp',
    'modal.period': 'Okres',
    'modal.status': 'Status',
    'modal.weekNumber': 'Numer tygodnia',
    'modal.week': 'Tydzień {0}',
    'modal.selectYear': 'Wybierz rok',
    'modal.selectMonthYear': 'Wybierz miesiąc i rok',
    'modal.saveChanges': 'Zapisz zmiany',
    'modal.addGoal': 'Dodaj cel',
    'modal.period.weekly': 'tygodniowy',
    'modal.period.monthly': 'miesięczny',
    'modal.period.yearly': 'roczny',
    'modal.status.planned': 'Zaplanowane',
    'modal.status.to-do': 'Do zrobienia',
    'modal.status.in-progress': 'W trakcie',
    'modal.status.done': 'Ukończone',
    'modal.month.0': 'Sty',
    'modal.month.1': 'Lut',
    'modal.month.2': 'Mar',
    'modal.month.3': 'Kwi',
    'modal.month.4': 'Maj',
    'modal.month.5': 'Cze',
    'modal.month.6': 'Lip',
    'modal.month.7': 'Sie',
    'modal.month.8': 'Wrz',
    'modal.month.9': 'Paź',
    'modal.month.10': 'Lis',
    'modal.month.11': 'Gru',

    // Goal Architect
    'architect.title': 'Architekt celów',
    'architect.placeholder': 'Opisz swój cel w kilku zdaniach...',
    'architect.generate': 'Generuj plan',
    'architect.generating': 'AI tworzy plan...',
    'architect.regenerate': 'Generuj ponownie',
    'architect.addSelected': 'Dodaj wybrane',
    'architect.cancel': 'Anuluj',
    'architect.yearly': 'Cele roczne',
    'architect.monthly': 'Cele miesięczne',
    'architect.weekly': 'Cele tygodniowe',
    'architect.example1': 'Nauczyć się hiszpańskiego do poziomu B1 w tym roku',
    'architect.example2': 'Przebiec półmaraton w 6 miesięcy',
    'architect.example3': 'Przeczytać 24 książki w tym roku',
    'architect.errorGenerate': 'Nie udało się wygenerować celów. Spróbuj ponownie.',
    'architect.successAdd': 'Dodano {0} celów!',
    'architect.noneSelected': 'Wybierz co najmniej jeden cel',
  },
};

function t(key: string, ...args: (string | number)[]): string {
  let value = translations[locale.value][key] || translations['en'][key] || key;
  args.forEach((arg, i) => {
    value = value.replace(`{${i}}`, String(arg));
  });
  return value;
}

const localeCode = computed(() => locale.value === 'pl' ? 'pl-PL' : 'en-US');

function toggleLocale() {
  locale.value = locale.value === 'en' ? 'pl' : 'en';
}

export function useI18n() {
  return { t, locale, localeCode, toggleLocale };
}

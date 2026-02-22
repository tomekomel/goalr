import './style.css';

// --- i18n ---
const translations: Record<string, Record<string, string>> = {
  en: {
    'nav.signIn': 'Sign in',
    'hero.title': 'Design your future, one goal at a time.',
    'hero.subtitle': 'The free, AI-powered goal tracker that turns your ambitions into weekly, monthly, and yearly action plans.',
    'hero.cta': 'Start for free',
    'hero.tryDemo': 'Try demo',
    'hero.ctaSecondary': 'See how it works',
    'trust.join': 'Join goal-setters who plan smarter.',
    'trust.free': 'Free forever',
    'trust.noCard': 'No credit card',
    'trust.quick': '2-minute setup',
    'features.title': 'Everything you need to achieve more.',
    'features.f1.badge': 'Planning',
    'features.f1.title': 'Plan at every scale',
    'features.f1.desc': 'See the big picture and the details at the same time. One unified dashboard for all your goals — no switching between apps or views.',
    'features.f1.dragHint': 'drag & drop between horizons',
    'features.f1.h1': 'Weekly, monthly, and yearly goals side by side',
    'features.f1.h2': 'Drag & drop to restructure plans across time horizons',
    'features.f1.h3': 'Real-time progress bars and visual status indicators',
    'features.f1.h4': 'Navigate between months and years to review any period',
    'features.f2.badge': 'AI-powered',
    'features.f2.title': 'AI Goal Architect',
    'features.f2.desc': 'Turn a single sentence into a complete action plan. Just describe what you want to achieve — AI handles the rest.',
    'features.f2.prompt': 'I want to run a marathon this year',
    'features.f2.card1': 'Build base — run 3x/week, 5km',
    'features.f2.card2': 'Increase to 10km, join a running club',
    'features.f2.card3': 'Complete marathon under 4:30',
    'features.f2.regenerate': 'Regenerate',
    'features.f2.addSelected': 'Add 3 goals',
    'features.f2.h1': 'Works with any goal — from fitness to business',
    'features.f2.h2': 'Generates weekly, monthly, and yearly steps automatically',
    'features.f2.h3': 'Every step is structured, realistic, and ready to track',
    'features.f2.h4': 'Regenerate or fine-tune until the plan fits perfectly',
    'features.f3.badge': 'Coaching',
    'features.f3.title': 'Goal Pulse coaching',
    'features.f3.desc': 'AI coaching that knows where you stand. Get nudges based on your actual progress — not generic motivation.',
    'features.f3.coaching': 'You\'re 60% through "Launch MVP" with 10 days left. You\'re ahead of pace! Consider starting the marketing prep early to maintain momentum.',
    'features.f3.risk': 'Risk low',
    'features.f3.progressLabel': 'Progress',
    'features.f3.saveProgress': 'Save Progress',
    'features.f3.markDone': 'Mark as Done',
    'features.f3.h1': 'Personalized insights that adapt to your pace and style',
    'features.f3.h2': 'Risk assessment highlights goals that need attention',
    'features.f3.h3': 'Specific next steps you can act on right away',
    'features.f3.h4': 'Update progress and mark goals done in one click',
    'how.title': 'Get started in three steps.',
    'how.s1.title': 'Sign up in seconds',
    'how.s1.desc': 'One click with Google, Facebook, or X. No forms, no friction.',
    'how.s2.title': 'Set your goals',
    'how.s2.desc': 'Add goals manually or let AI structure them for you. Organize by week, month, or year.',
    'how.s3.title': 'Track, adapt, achieve',
    'how.s3.desc': 'Watch progress in real time, get AI coaching, and adjust as life happens.',
    'cta.title': 'Ready to design your future?',
    'cta.subtitle': 'No credit card. No time limit. No catch.',
    'cta.button': 'Get started — it\'s free',
    'blog.sectionTitle': 'The Goal-Setting Playbook',
    'blog.sectionSubtitle': 'Actionable insights to help you plan smarter and achieve more.',
    'blog.allPosts': 'View all posts',
    'blog.minRead': 'min read',
    'blog.readMore': 'Read more',
    'footer.tagline': 'Made with ambition.',
  },
  pl: {
    'nav.signIn': 'Zaloguj się',
    'hero.title': 'Projektuj swoją przyszłość, cel po celu.',
    'hero.subtitle': 'Darmowy tracker celów z AI, który zamienia Twoje ambicje w tygodniowe, miesięczne i roczne plany działania.',
    'hero.cta': 'Zacznij za darmo',
    'hero.tryDemo': 'Wypróbuj demo',
    'hero.ctaSecondary': 'Zobacz jak to działa',
    'trust.join': 'Dołącz do osób, które planują mądrzej.',
    'trust.free': 'Na zawsze za darmo',
    'trust.noCard': 'Bez karty kredytowej',
    'trust.quick': 'Konfiguracja w 2 minuty',
    'features.title': 'Wszystko czego potrzebujesz, by osiągnąć więcej.',
    'features.f1.badge': 'Planowanie',
    'features.f1.title': 'Planuj na każdą skalę',
    'features.f1.desc': 'Ogólny obraz i szczegóły jednocześnie. Jeden dashboard dla wszystkich celów — bez przełączania między aplikacjami.',
    'features.f1.dragHint': 'przeciągnij i upuść między horyzontami',
    'features.f1.h1': 'Cele tygodniowe, miesięczne i roczne obok siebie',
    'features.f1.h2': 'Przeciągnij i upuść, by przenieść cele między horyzontami',
    'features.f1.h3': 'Paski postępu i wizualne wskaźniki statusu w czasie rzeczywistym',
    'features.f1.h4': 'Nawiguj między miesiącami i latami, by przejrzeć dowolny okres',
    'features.f2.badge': 'Napędzane AI',
    'features.f2.title': 'AI Architekt celów',
    'features.f2.desc': 'Zamień jedno zdanie w kompletny plan działania. Opisz co chcesz osiągnąć — AI zajmie się resztą.',
    'features.f2.prompt': 'Chcę przebiec maraton w tym roku',
    'features.f2.card1': 'Buduj bazę — biegaj 3x/tydz., 5km',
    'features.f2.card2': 'Zwiększ do 10km, dołącz do klubu',
    'features.f2.card3': 'Ukończ maraton poniżej 4:30',
    'features.f2.regenerate': 'Regeneruj',
    'features.f2.addSelected': 'Dodaj 3 cele',
    'features.f2.h1': 'Działa z każdym celem — od fitnessu po biznes',
    'features.f2.h2': 'Generuje kroki tygodniowe, miesięczne i roczne automatycznie',
    'features.f2.h3': 'Każdy krok jest realistyczny i gotowy do śledzenia',
    'features.f2.h4': 'Regeneruj lub dostosuj, aż plan będzie idealny',
    'features.f3.badge': 'Coaching',
    'features.f3.title': 'Coaching Goal Pulse',
    'features.f3.desc': 'Coaching AI, który wie gdzie jesteś. Podpowiedzi oparte na Twoim faktycznym postępie — nie ogólnikowa motywacja.',
    'features.f3.coaching': 'Masz 60% „Launch MVP" z 10 dniami do końca. Jesteś przed tempem! Rozważ wcześniejsze rozpoczęcie przygotowań marketingowych.',
    'features.f3.risk': 'Ryzyko niskie',
    'features.f3.progressLabel': 'Postęp',
    'features.f3.saveProgress': 'Zapisz postęp',
    'features.f3.markDone': 'Oznacz jako ukończone',
    'features.f3.h1': 'Spersonalizowane wskazówki dopasowane do Twojego tempa',
    'features.f3.h2': 'Ocena ryzyka wskazuje cele wymagające uwagi',
    'features.f3.h3': 'Konkretne kolejne kroki, które możesz podjąć od razu',
    'features.f3.h4': 'Aktualizuj postęp i oznaczaj cele jednym kliknięciem',
    'how.title': 'Zacznij w trzech krokach.',
    'how.s1.title': 'Zarejestruj się w sekundy',
    'how.s1.desc': 'Jedno kliknięcie z Google, Facebook lub X. Bez formularzy, bez tarcia.',
    'how.s2.title': 'Ustal swoje cele',
    'how.s2.desc': 'Dodaj cele ręcznie lub pozwól AI je zorganizować. Porządkuj wg tygodni, miesięcy lub lat.',
    'how.s3.title': 'Śledź, adaptuj, osiągaj',
    'how.s3.desc': 'Obserwuj postęp w czasie rzeczywistym, korzystaj z coachingu AI i dostosowuj plany.',
    'cta.title': 'Gotowy zaprojektować swoją przyszłość?',
    'cta.subtitle': 'Bez karty kredytowej. Bez limitu czasu. Bez haczyków.',
    'cta.button': 'Zacznij — to darmowe',
    'blog.sectionTitle': 'Poradnik wyznaczania celów',
    'blog.sectionSubtitle': 'Praktyczne wskazówki, które pomogą Ci planować mądrzej.',
    'blog.allPosts': 'Wszystkie wpisy',
    'blog.minRead': 'min czytania',
    'blog.readMore': 'Czytaj więcej',
    'footer.tagline': 'Stworzone z ambicją.',
  },
};

let locale = localStorage.getItem('locale') || 'en';

function t(key: string): string {
  return translations[locale]?.[key] || translations['en']?.[key] || key;
}

function updateTexts() {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key) {
      el.textContent = t(key);
    }
  });
}

// Language toggle
document.getElementById('lang-toggle')?.addEventListener('click', () => {
  locale = locale === 'en' ? 'pl' : 'en';
  localStorage.setItem('locale', locale);
  updateTexts();
  const label = document.getElementById('lang-label');
  if (label) label.textContent = locale.toUpperCase();
});

// --- Navbar scroll blur ---
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav?.classList.toggle('navbar-scrolled', window.scrollY > 50);
});

// --- Intersection Observer for scroll animations ---
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.landing-animate').forEach(el => observer.observe(el));

// --- Smooth scroll ---
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const href = a.getAttribute('href');
    if (href) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// --- Init ---
const langLabel = document.getElementById('lang-label');
if (langLabel) langLabel.textContent = locale.toUpperCase();
updateTexts();

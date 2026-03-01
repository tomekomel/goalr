import './style.css';

// --- i18n ---
const translations: Record<string, Record<string, string>> = {
  en: {
    // Navbar
    'nav.signIn': 'Sign in',
    'nav.features': 'Features',
    'nav.howItWorks': 'How it works',

    // Hero
    'hero.eyebrow': 'AI-powered · Free forever',
    'hero.title1': 'Become who',
    'hero.title2': 'you planned to be.',
    'hero.subtitle': 'goalr maps your ambitions into weekly, monthly, and yearly action plans — with AI coaching that keeps you moving forward.',
    'hero.cta': 'Start for free',
    'hero.tryDemo': 'Try demo',
    'hero.ctaSecondary': 'See how it works',

    // Trust
    'trust.join': 'Join goal-setters who plan smarter.',
    'trust.free': 'Free forever',
    'trust.noCard': 'No credit card',
    'trust.quick': '2-minute setup',

    // Features
    'features.label': 'Features',
    'features.title': 'Everything you need to move forward.',
    'features.f1.badge': '01 — Planning',
    'features.f1.title': 'Plan at every scale',
    'features.f1.desc': 'See the big picture and the details at the same time. One dashboard for weekly sprints, monthly targets, and yearly ambitions — no switching between apps.',
    'features.f1.dragHint': 'drag & drop between horizons',
    'features.f1.h1': 'Weekly, monthly, and yearly goals in one view',
    'features.f1.h2': 'Drag & drop goals across time horizons instantly',
    'features.f1.h3': 'Real-time progress bars and visual status indicators',
    'features.f1.h4': 'Navigate between months and years to review any period',
    'features.f2.badge': '02 — AI',
    'features.f2.title': 'AI Goal Architect',
    'features.f2.desc': 'Describe your goal in plain words. AI structures it into a complete action plan — across weeks, months, and years — ready to track.',
    'features.f2.prompt': 'I want to run a marathon this year',
    'features.f2.card1': 'Build base — run 3x/week, 5km',
    'features.f2.card2': 'Increase to 10km, join a running club',
    'features.f2.card3': 'Complete marathon under 4:30',
    'features.f2.regenerate': 'Regenerate',
    'features.f2.addSelected': 'Add 3 goals',
    'features.f2.h1': 'Works with any goal — fitness, business, creative',
    'features.f2.h2': 'Generates weekly, monthly, and yearly steps automatically',
    'features.f2.h3': 'Every step is structured, realistic, and ready to track',
    'features.f2.h4': 'Regenerate or fine-tune until the plan fits',
    'features.f3.badge': '03 — Coaching',
    'features.f3.title': 'Goal Pulse coaching',
    'features.f3.desc': 'AI coaching that knows where you stand. Get nudges based on your actual progress — not generic pep talks.',
    'features.f3.coaching': 'You\'re 60% through "Launch MVP" with 10 days left. You\'re ahead of pace! Consider starting the marketing prep early to maintain momentum.',
    'features.f3.risk': 'Risk low',
    'features.f3.progressLabel': 'Progress',
    'features.f3.saveProgress': 'Save Progress',
    'features.f3.markDone': 'Mark as Done',
    'features.f3.h1': 'Coaching adapts to your actual pace and style',
    'features.f3.h2': 'Risk assessment highlights goals that need attention',
    'features.f3.h3': 'Actionable suggestions, not generic motivation',
    'features.f3.h4': 'Update progress and mark goals done in one click',

    // How it works
    'how.label': 'How it works',
    'how.title': 'Up and running in minutes.',
    'how.tab1': 'Sign up',
    'how.tab2': 'Set your goals',
    'how.tab3': 'Track & grow',
    'how.s1.title': 'One click to start',
    'how.s1.desc': 'Sign in with Google, Facebook, or X. No forms, no friction — your dashboard is ready immediately.',
    'how.s2.title': 'Add goals your way',
    'how.s2.desc': 'Type a goal manually or describe your ambition in plain language. AI structures it into actionable weekly, monthly, and yearly steps.',
    'how.s3.title': 'Progress that compounds',
    'how.s3.desc': 'Watch your goals move forward in real time. AI coaching adapts to your pace — nudging you when you\'re slipping, celebrating when you\'re ahead.',

    // Testimonials
    'testimonials.label': 'What people say',
    'testimonials.title': 'Built for people who mean it.',
    'testimonials.t1.quote': 'The AI Goal Architect saved me hours of planning. I described my business goal and it gave me a realistic 12-month roadmap. I\'ve actually stuck to it.',
    'testimonials.t1.name': 'Marcus T.',
    'testimonials.t1.role': 'Founder, early-stage startup',
    'testimonials.t2.quote': 'Having weekly, monthly, and yearly goals in one view changed how I think about time. goalr made long-term planning feel human again.',
    'testimonials.t2.name': 'Aiko S.',
    'testimonials.t2.role': 'Product designer',
    'testimonials.t3.quote': 'The coaching feature is what keeps me coming back. It\'s not generic — it references my actual goals and tells me exactly what to do next.',
    'testimonials.t3.name': 'Jonah R.',
    'testimonials.t3.role': 'Software engineer',

    // Blog
    'blog.label': 'The Playbook',
    'blog.sectionTitle': 'From the goal-setting playbook',
    'blog.sectionSubtitle': 'Practical insights on planning, habits, and execution.',
    'blog.allPosts': 'Read all posts',
    'blog.minRead': 'min read',
    'blog.readMore': 'Read more',

    // CTA
    'cta.label': 'Get started',
    'cta.title': 'Start building your future.',
    'cta.subtitle': 'No credit card. No time limit. Just your goals and a plan.',
    'cta.button': 'Get started — it\'s free',

    // Footer
    'footer.tagline': '© 2026 goalr',
    'footer.product': 'Product',
    'footer.blog': 'Blog',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
  },
  pl: {
    // Navbar
    'nav.signIn': 'Zaloguj się',
    'nav.features': 'Funkcje',
    'nav.howItWorks': 'Jak to działa',

    // Hero
    'hero.eyebrow': 'Napędzany przez AI · Zawsze darmowy',
    'hero.title1': 'Zostań tym,',
    'hero.title2': 'kim zaplanowałeś być.',
    'hero.subtitle': 'goalr zamienia Twoje ambicje w tygodniowe, miesięczne i roczne plany działania — z coachingiem AI, który trzyma Cię na kursie.',
    'hero.cta': 'Zacznij za darmo',
    'hero.tryDemo': 'Wypróbuj demo',
    'hero.ctaSecondary': 'Zobacz jak to działa',

    // Trust
    'trust.join': 'Dołącz do osób, które planują mądrzej.',
    'trust.free': 'Na zawsze za darmo',
    'trust.noCard': 'Bez karty kredytowej',
    'trust.quick': 'Konfiguracja w 2 minuty',

    // Features
    'features.label': 'Funkcje',
    'features.title': 'Wszystko, czego potrzebujesz, by działać.',
    'features.f1.badge': '01 — Planowanie',
    'features.f1.title': 'Planuj na każdą skalę',
    'features.f1.desc': 'Ogólny obraz i szczegóły jednocześnie. Jeden dashboard dla tygodniowych sprintów, miesięcznych celów i rocznych ambicji.',
    'features.f1.dragHint': 'przeciągnij i upuść między horyzontami',
    'features.f1.h1': 'Cele tygodniowe, miesięczne i roczne w jednym widoku',
    'features.f1.h2': 'Przeciągnij i upuść, by przenieść cele między horyzontami',
    'features.f1.h3': 'Paski postępu i wizualne wskaźniki statusu w czasie rzeczywistym',
    'features.f1.h4': 'Nawiguj między miesiącami i latami, by przejrzeć dowolny okres',
    'features.f2.badge': '02 — AI',
    'features.f2.title': 'AI Architekt celów',
    'features.f2.desc': 'Opisz cel w zwykłych słowach. AI rozkłada go na kompletny plan — tygodniowy, miesięczny i roczny — gotowy do śledzenia.',
    'features.f2.prompt': 'Chcę przebiec maraton w tym roku',
    'features.f2.card1': 'Buduj bazę — biegaj 3x/tydz., 5km',
    'features.f2.card2': 'Zwiększ do 10km, dołącz do klubu',
    'features.f2.card3': 'Ukończ maraton poniżej 4:30',
    'features.f2.regenerate': 'Regeneruj',
    'features.f2.addSelected': 'Dodaj 3 cele',
    'features.f2.h1': 'Działa z każdym celem — fitness, biznes, kreatywność',
    'features.f2.h2': 'Generuje kroki tygodniowe, miesięczne i roczne automatycznie',
    'features.f2.h3': 'Każdy krok jest realistyczny i gotowy do śledzenia',
    'features.f2.h4': 'Regeneruj lub dostosuj, aż plan będzie idealny',
    'features.f3.badge': '03 — Coaching',
    'features.f3.title': 'Coaching Goal Pulse',
    'features.f3.desc': 'Coaching AI, który wie gdzie jesteś. Podpowiedzi oparte na Twoim faktycznym postępie — nie ogólnikowa motywacja.',
    'features.f3.coaching': 'Masz 60% „Launch MVP" z 10 dniami do końca. Jesteś przed tempem! Rozważ wcześniejsze rozpoczęcie przygotowań marketingowych.',
    'features.f3.risk': 'Ryzyko niskie',
    'features.f3.progressLabel': 'Postęp',
    'features.f3.saveProgress': 'Zapisz postęp',
    'features.f3.markDone': 'Oznacz jako ukończone',
    'features.f3.h1': 'Coaching dopasowany do Twojego tempa i stylu',
    'features.f3.h2': 'Ocena ryzyka wskazuje cele wymagające uwagi',
    'features.f3.h3': 'Konkretne kolejne kroki, które możesz podjąć od razu',
    'features.f3.h4': 'Aktualizuj postęp i oznaczaj cele jednym kliknięciem',

    // How it works
    'how.label': 'Jak to działa',
    'how.title': 'Gotowy w kilka minut.',
    'how.tab1': 'Zarejestruj się',
    'how.tab2': 'Ustal cele',
    'how.tab3': 'Śledź i rosń',
    'how.s1.title': 'Jedno kliknięcie na start',
    'how.s1.desc': 'Zaloguj się przez Google, Facebook lub X. Bez formularzy, bez tarcia — dashboard gotowy od razu.',
    'how.s2.title': 'Dodaj cele po swojemu',
    'how.s2.desc': 'Wpisz cel ręcznie lub opisz ambicję w zwykłych słowach. AI rozkłada ją na konkretne tygodniowe, miesięczne i roczne kroki.',
    'how.s3.title': 'Postęp, który procentuje',
    'how.s3.desc': 'Obserwuj postęp w czasie rzeczywistym. Coaching AI dostosowuje się do Twojego tempa — mobilizuje gdy zwalniasz, gratuluje gdy jesteś przed planem.',

    // Testimonials
    'testimonials.label': 'Co mówią użytkownicy',
    'testimonials.title': 'Dla osób, które serio traktują cele.',
    'testimonials.t1.quote': 'AI Architekt celów zaoszczędził mi godziny planowania. Opisałem cel biznesowy i dostałem realistyczny plan na 12 miesięcy. Faktycznie go realizuję.',
    'testimonials.t1.name': 'Marcus T.',
    'testimonials.t1.role': 'Założyciel startupu',
    'testimonials.t2.quote': 'Tygodniowe, miesięczne i roczne cele w jednym widoku zmieniły moje podejście do czasu. goalr sprawił, że planowanie długoterminowe znów jest ludzkie.',
    'testimonials.t2.name': 'Aiko S.',
    'testimonials.t2.role': 'Product designer',
    'testimonials.t3.quote': 'Funkcja coachingu sprawia, że wracam. Nie jest ogólnikowa — odwołuje się do moich rzeczywistych celów i mówi dokładnie co robić dalej.',
    'testimonials.t3.name': 'Jonah R.',
    'testimonials.t3.role': 'Software engineer',

    // Blog
    'blog.label': 'Poradnik',
    'blog.sectionTitle': 'Z poradnika wyznaczania celów',
    'blog.sectionSubtitle': 'Praktyczne wskazówki o planowaniu, nawykach i realizacji.',
    'blog.allPosts': 'Wszystkie wpisy',
    'blog.minRead': 'min czytania',
    'blog.readMore': 'Czytaj więcej',

    // CTA
    'cta.label': 'Zacznij',
    'cta.title': 'Zacznij budować swoją przyszłość.',
    'cta.subtitle': 'Bez karty kredytowej. Bez limitu czasu. Tylko Twoje cele i plan.',
    'cta.button': 'Zacznij — to darmowe',

    // Footer
    'footer.tagline': '© 2026 goalr',
    'footer.product': 'Produkt',
    'footer.blog': 'Blog',
    'footer.privacy': 'Prywatność',
    'footer.terms': 'Warunki',
  },
};

let locale = localStorage.getItem('locale') || 'en';

function t(key: string): string {
  return translations[locale]?.[key] ?? translations['en']?.[key] ?? key;
}

function updateTexts() {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
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
}, { passive: true });

// --- Intersection Observer for scroll animations ---
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .landing-animate').forEach(el => {
  observer.observe(el);
});

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

// --- Tab system for "How it works" ---
function initTabs() {
  const tabBtns = document.querySelectorAll<HTMLElement>('.tab-btn');
  const tabPanels = document.querySelectorAll<HTMLElement>('.tab-panel');

  function activateTab(index: number) {
    tabBtns.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
      btn.setAttribute('aria-selected', String(i === index));
    });
    tabPanels.forEach((panel, i) => {
      panel.classList.toggle('active', i === index);
    });
  }

  tabBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => activateTab(i));
  });

  // Activate first tab by default
  if (tabBtns.length > 0) activateTab(0);
}

initTabs();

// --- Mobile menu toggle ---
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
mobileMenuBtn?.addEventListener('click', () => {
  mobileMenu?.classList.toggle('open');
  const isOpen = mobileMenu?.classList.contains('open');
  mobileMenuBtn.setAttribute('aria-expanded', String(isOpen ?? false));
});
// Close on link click
mobileMenu?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// --- WebGL Particle Background (lazy-loaded) ---
async function initWebGLBackground() {
  const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const {
    WebGLRenderer, Scene, PerspectiveCamera,
    BufferGeometry, Float32BufferAttribute,
    PointsMaterial, Points, AdditiveBlending,
  } = await import('three');

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  const camera = new PerspectiveCamera(75, 1, 0.1, 1000);
  camera.position.z = 150;

  const particlesCount = 280;
  const posArray = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 400;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(posArray, 3));

  const material = new PointsMaterial({
    size: 2.2,
    color: 0x22c55e,
    transparent: true,
    opacity: 0.7,
    blending: AdditiveBlending,
  });

  const points = new Points(geometry, material);
  scene.add(points);

  let mouseX = 0;
  let mouseY = 0;
  let isVisible = false;
  let animationFrameId: number | null = null;
  let lastTime: number | null = null;

  const onMouseMove = (e: MouseEvent) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  };

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function animate(time: number) {
    if (!isVisible) {
      animationFrameId = null;
      lastTime = null;
      return;
    }
    animationFrameId = requestAnimationFrame(animate);
    if (lastTime === null) { lastTime = time; return; }

    const dt = (time - lastTime) / 1000;
    lastTime = time;

    points.rotation.y += 0.04 * dt;
    points.rotation.x += 0.018 * dt;
    points.position.x += (mouseX * 18 - points.position.x) * 0.05;
    points.position.y += (-mouseY * 18 - points.position.y) * 0.05;

    renderer.render(scene, camera);
  }

  const canvasObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && !isVisible) {
        isVisible = true;
        document.addEventListener('mousemove', onMouseMove);
        animationFrameId = requestAnimationFrame(animate);
      } else if (!entry.isIntersecting && isVisible) {
        isVisible = false;
        document.removeEventListener('mousemove', onMouseMove);
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        lastTime = null;
      }
    }
  }, { threshold: 0 });

  canvasObserver.observe(canvas);
  resize();
  window.addEventListener('resize', resize, { passive: true });
}

// --- Init ---
const langLabel = document.getElementById('lang-label');
if (langLabel) langLabel.textContent = locale.toUpperCase();
updateTexts();
initWebGLBackground();

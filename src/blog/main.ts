import './style.css';

// --- i18n ---
const translations: Record<string, Record<string, string>> = {
  en: {
    'nav.signIn': 'Sign in',
    'blog.sectionTitle': 'The Goal-Setting Playbook',
    'blog.sectionSubtitle': 'Actionable insights to help you plan smarter and achieve more.',
    'blog.allPosts': 'View all posts',
    'blog.minRead': 'min read',
    'blog.readMore': 'Read more',
    'blog.cta.title': 'Ready to put this into practice?',
    'blog.cta.subtitle': 'Start tracking your goals for free. No credit card required.',
    'blog.cta.button': 'Start for free',
    'blog.backToAll': 'All posts',
    'footer.tagline': 'Made with ambition.',
  },
  pl: {
    'nav.signIn': 'Zaloguj się',
    'blog.sectionTitle': 'Poradnik wyznaczania celów',
    'blog.sectionSubtitle': 'Praktyczne wskazówki, które pomogą Ci planować mądrzej.',
    'blog.allPosts': 'Wszystkie wpisy',
    'blog.minRead': 'min czytania',
    'blog.readMore': 'Czytaj więcej',
    'blog.cta.title': 'Gotowy wprowadzić to w życie?',
    'blog.cta.subtitle': 'Zacznij śledzić swoje cele za darmo. Bez karty kredytowej.',
    'blog.cta.button': 'Zacznij za darmo',
    'blog.backToAll': 'Wszystkie wpisy',
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

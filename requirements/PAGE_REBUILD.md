# Prompt: Redesign landing page goalr — eliminacja "AI slop" i stworzenie wyróżniającego się designu

## Kontekst

Mam landing page aplikacji **goalr** (goal tracker z AI) zbudowany w Vue. Strona działa, ale wygląda jak typowy landing page wygenerowany przez AI — generyczny, bezpieczny, pozbawiony charakteru. Chcę ją przerobić tak, żeby wyglądała jak zaprojektowana przez doświadczonego designera, a nie wypluty przez LLM.

---

## Co dokładnie jest źle (problemy do naprawienia)

### 1. TYPOGRAFIA — generyczna i nudna
- Strona prawdopodobnie używa Inter, system-ui lub podobnego "bezpiecznego" fontu — to natychmiast sygnalizuje "AI-generated"
- Brak hierarchii typograficznej — headingi, body text i UI text wyglądają jakby pochodziły z jednej rodziny bez kontrastu
- Brak charakteru w nagłówkach — "Design your future, one goal at a time" jest wyświetlane w sposób kompletnie forgettable
- **Popraw**: Dobierz parę fontów z Google Fonts, która ma OSOBOWOŚĆ. Przykładowe kierunki (wybierz JEDEN):
  - Display font z charakterem (np. Instrument Serif, Fraunces, Clash Display, Satoshi, Cabinet Grotesk, General Sans) + czytelny body font
  - Nagłówki powinny mieć wyrazisty font-weight, letter-spacing i line-height — nie defaultowe wartości
  - Hero headline powinien być DUŻY, odważny, z niestandardowym formatowaniem (np. italic na jednym słowie, inny kolor na kluczowym fragmencie, line break w nieoczywistym miejscu)

### 2. KOLORYSTYKA — mdła i przewidywalna
- Prawdopodobnie biały/jasny background + jeden accent color (niebieski/fioletowy gradient?) — to klasyczny "AI landing page look"
- Brak odwagi w kolorach, brak kontrastu, brak zaskoczenia
- **Popraw**: Stwórz paletę, która ma POV (point of view). Kierunki do wyboru (wybierz JEDEN):
  - **Dark mode premium**: Ciemne tło (nie czarne — raczej bardzo ciemny grafit/navy) z ciepłym accentem (amber, coral, lime)
  - **Warm & confident**: Off-white/cream tło z mocnym, nasyconym accent colorem (deep orange, electric blue, rich green)
  - **Bold & editorial**: Śmiałe użycie jednego dominującego koloru jako tła sekcji, z kontrastującym tekstem
  - Zdefiniuj paletę jako CSS variables: `--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-muted`, `--accent`, `--accent-hover`, `--surface`, `--border`
  - Unikaj: czystego białego (#fff), czystego czarnego (#000), generycznych niebieskich gradientów

### 3. LAYOUT — przewidywalny szablon SaaS
- Sekcje idą jedna pod drugą w identycznym rytmie: hero → features → steps → blog → CTA → footer
- Każda sekcja jest wycentrowana, symetryczna, z identycznym paddingiem
- Feature cards są w gridzie 1x3 lub podobnym — zero zaskoczenia
- **Popraw**:
  - Hero: Zrób coś nieoczywistego — np. asymetryczny layout z dużym tekstem po lewej i UI mockupem po prawej (lub odwrotnie), albo full-width hero z tekstem overlay na subtelnym tle
  - Feature sekcja: NIE rób identycznych kart w gridzie. Zamiast tego:
    - Alternating layout (tekst lewo/prawo z obrazkiem)
    - Albo jedna duża feature z bento grid na mniejsze
    - Albo sticky sidebar z feature list + scrollujący się content area
  - Zróżnicuj rytm sekcji — niech niektóre mają więcej whitespace, inne są gęstsze
  - Dodaj elementy łamiące grid — np. element wystający poza kontener, overlapping sections, diagonal dividers

### 4. UI MOCKUPY/PREVIEW — wyglądają jak placeholder
- Dashboard preview w hero i feature sections wygląda jak statyczny screenshot lub prosty div z borderami
- Nie budzi zaufania ani zachwytu
- **Popraw**:
  - Mockupy powinny wyglądać jak prawdziwy, dopracowany UI — z cieniami, zaokrągleniami, głębią
  - Dodaj subtlelny efekt 3D (perspective transform + shadow) żeby wyglądały jak prawdziwe okno aplikacji
  - Rozważ użycie glassmorphism lub neumorphism na elementach UI preview
  - Mockupy powinny mieć delikatną animację przy scroll (parallax, fade-in z przesunięciem)
  - Dodaj "browser chrome" (pasek z kropkami) na górze mockupów żeby wyglądały jak prawdziwe okna

### 5. MIKROINTERAKCJE I ANIMACJE — brak lub generyczne
- Strona jest prawdopodobnie statyczna lub ma basic fade-in animacje
- Brak "delightu" — nic nie zaskakuje, nic nie cieszy
- **Popraw**:
  - Hero: Staggered reveal — elementy pojawiają się jeden po drugim z delikatnym opóźnieniem (heading → subheading → buttons → mockup)
  - Scroll animations: Elementy wjeżdżają przy scrollowaniu (użyj Intersection Observer lub framer-motion). NIE na każdym elemencie — na 2-3 kluczowych momentach
  - Hover states na przyciskach: Nie tylko zmiana koloru — dodaj scale, shadow shift, lub subtle background animation
  - Feature cards: Subtelny hover z podnoszeniem (translateY + shadow increase)
  - CTA button w hero: Powinien "żyć" — subtelna pulsacja, gradient shift, lub shimmer effect
  - Cursor effects: Rozważ custom cursor lub glow effect podążający za myszką (ale nie przesadzaj)

### 6. HERO SECTION — nudna i generyczna
- Struktura "heading + subheading + 2 buttony + badges" jest mega overused
- Badges "Free forever / No credit card / 2-minute setup" wyglądają jak skopiowane z szablonu
- **Popraw**:
  - Headline: Zrób go WIELKIM i odważnym. Użyj mixed formatting — np. jedno słowo w innym kolorze, kursywie, lub z podkreśleniem/highlight
  - Subheadline: Krótsza, bardziej ludzka, mniej "marketingowa" — strona powinna brzmieć autentycznie, nie AI-generated
  - Social proof badges przenieś niżej lub zintegruj naturalniej (np. jako część subteksty, nie osobne badge'e)
  - Dodaj jeden element wizualny, który wyróżnia hero: animated gradient background, floating shapes, particle effect, lub geometric pattern
  - CTA buttons: Główny button powinien być WYRAŹNIE dominujący (duży, kolorowy, z ikoną). Drugorzędny — ghost/outline style z wyraźnym kontrastem wobec głównego

### 7. SEKCJA "3 STEPS" — cliché
- "Sign up → Set goals → Track" to dokładnie to, co generuje każdy AI dla każdej SaaS aplikacji
- Numerowane kroki w kółkach/kwadratach — zero oryginalności
- **Popraw**:
  - Jeśli zostawiasz 3 steps, zrób je wizualnie ciekawe — np. timeline z connecting line, z animacją postępu przy scrollu
  - Albo zamień na bardziej interaktywny format — np. tabbed interface gdzie kliknięcie kroku pokazuje odpowiedni UI preview
  - Albo przenieś to do hero jako krótki "Setup takes 2 minutes" z inline wizualizacją
  - Treść kroków powinna być bardziej konkretna i mniej generyczna

### 8. SEKCJA BLOG — niepotrzebna na landing page
- 3 artykuły blogowe na landing page to typowy AI-generated filler
- Wygląda jak "dodaj content dla SEO" suggestion od AI
- **Popraw**:
  - Usuń sekcję blog z landing page LUB zamień ją na sekcję "Testimonials" / "Social proof" z prawdziwymi lub placeholder opiniami użytkowników
  - Jeśli chcesz blog — zostaw go tylko jako link w footerze
  - Zamiast bloga dodaj sekcję, która buduje zaufanie: testimonials, logos firm, statystyki ("10k+ goals tracked"), lub krótki FAQ

### 9. FOOTER — minimalistyczny ale pusty
- "Made with ambition" brzmi jak AI-generated tagline
- **Popraw**:
  - Footer powinien mieć: logo, links (Product, Blog, Privacy, Terms), social media icons, newsletter signup (opcjonalnie)
  - Tagline zamień na coś bardziej autentycznego lub po prostu copyright
  - Dodaj subtelny separator (gradient line, pattern) między ostatnią sekcją a footerem

### 10. OGÓLNE DETALE — brakujące politury
- **Popraw**:
  - Dodaj faviconę i odpowiedni meta image (OG image) dla social sharing
  - Nawigacja: powinna mieć blur backdrop-filter przy scrollowaniu (sticky nav z glass effect)
  - Smooth scrolling na anchor linkach
  - Loading state: dodaj skeleton lub spinner żeby strona nie "skakała"
  - Responsywność: upewnij się, że mobile wygląda RÓWNIE dobrze — nie "akceptowalnie", ale dobrze
  - Dark/light mode toggle (opcjonalnie, ale dodaje "premium" feel)

---

## Wytyczne stylistyczne (OBOWIĄZKOWE)

1. **NIE UŻYWAJ**: Inter, Roboto, Arial, system-ui jako głównych fontów
2. **NIE UŻYWAJ**: fioletowych gradientów na białym tle, generycznych niebieskich accentów
3. **NIE UŻYWAJ**: identycznych card layoutów w gridzie dla każdej sekcji
4. **NIE UŻYWAJ**: emoji jako ikon sekcji
5. **NIE UŻYWAJ**: generycznych fraz ("Everything you need", "Get started in 3 steps", "Ready to X?")
6. **UŻYWAJ**: CSS custom properties dla kolorów i spacing
7. **UŻYWAJ**: min. 2 Google Fonts (display + body)
8. **UŻYWAJ**: zróżnicowanych layout'ów między sekcjami
9. **UŻYWAJ**: animacji opartych na scroll (Intersection Observer / framer-motion)
10. **UŻYWAJ**: prawdziwych cieni (wielowarstwowych, nie generycznych `box-shadow: 0 2px 4px rgba(0,0,0,0.1)`)

---

## Dodatkowe wymagania techniczne

- Framework: Vue (jak jest obecnie)
- Styling: Tailwind CSS jest OK, ale uzupełnij o custom CSS tam, gdzie Tailwind jest ograniczający (np. złożone animacje, custom fonts, gradients)
- Animacje: Preferuj CSS animations/transitions. Framer Motion jeśli potrzeba bardziej złożonych (stagger, scroll-triggered)
- Performance: Lazy load obrazków, optimize fonts (font-display: swap), minimalny JS
- Accessibility: Semantic HTML, proper heading hierarchy, focus states, aria-labels na interactive elements, contrast ratios WCAG AA

---

## Inspiracje stylistyczne (NIE kopiuj — użyj jako punkt wyjścia dla kierunku)

- linear.app — czysty dark mode, premium feel, świetna typografia
- vercel.com — odważne nagłówki, dobre animacje scrollowe
- raycast.com — dark mode z żywymi accentami
- notion.so — ciepły, przyjazny, ale dopracowany
- arc.net — unikalny charakter, odważne kolory

---

## Struktura strony (zachowaj te sekcje, ale przebuduj ich wygląd)

1. **Navbar** — logo + nav links + CTA button (sticky, z backdrop blur)
2. **Hero** — odważny headline + subheadline + CTA + UI preview (asymetryczny layout)
3. **Social proof strip** — badge'e lub mini-sekcja z kluczowymi statystykami/trust signals
4. **Features** (2-3 główne) — alternating layout, nie grid identycznych kart
5. **How it works** — interaktywny timeline/tabs zamiast statycznych kroków
6. **Testimonials / Social proof** — zamiast bloga
7. **Final CTA** — pełnoekranowy, z odważnym kolorem tła
8. **Footer** — kompletny, z linkami i social media

---

## Output

Przygotuj kompletny, gotowy do wdrożenia kod landing page. Pokaż mi PEŁNY plik (lub pliki) — nie fragmenty. Strona musi być:
- Wizualnie wyróżniająca się i niegeneryczna
- W pełni responsywna (mobile-first)
- Z działającymi animacjami i interakcjami
- Z prawdziwymi tekstami (nie lorem ipsum) — zachowaj kontekst goalr jako AI goal tracker
- Gotowa do deploy na Vercel
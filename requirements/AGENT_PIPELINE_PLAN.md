# Plan: Agentowe środowisko developmentu dla Goalr

## Context

Celem jest stworzenie w pełni automatycznego pipeline'u, gdzie użytkownik wrzuca plik `.md`
z wymaganiem do `requirements/pending/`, a system automatycznie:
1. Wykrywa plik (file watcher)
2. Uruchamia agenta Claude Code CLI
3. Agent implementuje ficzer, pisze testy (Vitest unit + Playwright E2E)
4. Jeśli testy przechodzą: commit git + plik przeniesiony do `done/`
5. Jeśli testy nie przechodzą: plik do `failed/` + raport z błędem

## Architektura systemu

```
requirements/
  pending/          # użytkownik wrzuca tutaj .md
  in-progress/      # watcher przenosi podczas przetwarzania
  done/             # sukces
  failed/           # błąd + raport
  TEMPLATE.md       # wzorzec do pisania wymagań

scripts/
  requirements-watcher.mjs   # chokidar watcher + kolejka
  process-requirement.mjs    # wywołanie claude CLI + lifecycle pliku

src/
  __tests__/
    setup.ts          # globalne mocki (localStorage, matchMedia, supabase)
    GoalCard.test.ts  # wzorcowy unit test
  __mocks__/
    supabase.ts       # manual mock Supabase dla Vitest

e2e/
  example.spec.ts   # wzorcowy E2E test z page.route()

vitest.config.ts    # oddzielny od vite.config.ts (ważne!)
playwright.config.ts
```

## Nowe zależności do instalacji

```bash
npm install --save-dev vitest @vitest/ui @vue/test-utils jsdom msw @playwright/test chokidar
npx playwright install chromium
```

## Pliki do stworzenia

### 1. `vitest.config.ts` (root projektu)

**Kluczowe:** oddzielna konfiguracja, NIE rozszerzająca `vite.config.ts` — tamta skanuje
filesystem dla bloga przez `getBlogEntries()` i rozbiłaby testy.

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'e2e'],
    alias: { '@': resolve(__dirname, 'src') },
  },
})
```

### 2. `src/__tests__/setup.ts`

Musi stubować PRZED ładowaniem modułów (nie w `beforeEach`):
- `window.matchMedia` — `useDarkMode.ts` wywołuje to na poziomie modułu
- `localStorage` — `useI18n.ts` wywołuje `localStorage.getItem` na poziomie modułu
- `vi.mock('../supabase')` — `src/supabase.ts` rzuca błąd gdy brak env vars

### 3. `src/__mocks__/supabase.ts`

Manual mock z `vi.fn()` dla `auth.getSession`, `auth.onAuthStateChange`, `from()` (builder pattern).
Przy `vi.mock('../supabase')` Vitest auto-rezolwuje do `src/__mocks__/supabase.ts`.

### 4. `playwright.config.ts`

Uruchamia dev server (`vite` zamiast `npm run dev` — pomija blog build).
Używa `page.route('**/rest/v1/**')` do interceptowania Supabase w E2E.

### 5. `requirements/TEMPLATE.md`

Struktura którą agent rozumie:
```markdown
---
feature: [Nazwa]
priority: high|medium|low
---
# [Nazwa ficzerka]
## Context
## Requirements
- [ ] konkretne, testowalne wymaganie
## Acceptance Criteria
1. **Given** [...], **When** [...], **Then** [...]
## Technical Notes
- Component(s) to modify: ...
- i18n keys needed: yes/no
- Supabase schema changes: yes/no
## Test Scenarios
### Unit Tests
- File: src/__tests__/X.test.ts
- Scenario: ...
### E2E Tests
- File: e2e/X.spec.ts
- Scenario: ...
```

### 6. `scripts/requirements-watcher.mjs`

- `chokidar.watch('requirements/pending/')`
- Kolejka seryjna (jeden na raz — git operacje muszą być atomowe)
- `awaitWriteFinish: { stabilityThreshold: 1000 }` — czeka na zakończenie zapisu
- Spawnie `process-requirement.mjs <filePath>`

### 7. `scripts/process-requirement.mjs`

```javascript
// Wywołanie claude CLI
const args = [
  '--print',
  '--dangerously-skip-permissions',
  '--model', 'claude-sonnet-4-6',
  '--output-format', 'text',
  prompt  // cała treść wymagania + instrukcje
]
spawn('claude', args, { cwd: ROOT, stdio: ['inherit', 'pipe', 'pipe'] })
```

System prompt dla agenta zawiera:
- Instrukcje: implementuj → `npm run test:run` → napraw → `npm run test:e2e` → commit
- Konwencje testów (gdzie pliki, jak mockować Supabase)
- Format commita: `feat: <nazwa-ficzerka>`
- Sygnał błędu: `AGENT_FAILURE: <powód>` (ostatnia linia outputu)

Lifecycle pliku:
- `pending/X.md` → `in-progress/X.md` → (sukces) `done/X.md`
- (błąd) `failed/X.md` + `failed/X-error-<timestamp>.md`

## Nowe skrypty w `package.json`

```json
"test": "vitest",
"test:run": "vitest run",
"test:ui": "vitest --ui",
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"watch:requirements": "node scripts/requirements-watcher.mjs"
```

**Ważne:** Agent musi używać `npm run test:run`, nie `npm run test`
(watch mode nigdy nie kończy działania).

## Aktualizacja `CLAUDE.md`

Dwie nowe sekcje:
1. **Testing** — setup, lokalizacje plików, wzorzec unit/E2E, komenda do uruchomienia
2. **Agent Workflow** — jak pisać wymagania, jak uruchomić watcher, format commita

## Kluczowe gotchas

| Problem | Rozwiązanie |
|---------|-------------|
| `supabase.ts` rzuca błąd gdy brak env vars | `vi.mock('../supabase')` w KAŻDYM pliku testowym |
| `useI18n.ts` wywołuje `localStorage` na poziomie modułu | stub w `setup.ts` na poziomie modułu, nie w `beforeEach` |
| `useDarkMode.ts` wywołuje `matchMedia` na poziomie modułu | j.w. |
| `vite` = `rolldown-vite` override może wpłynąć na Vitest | oddzielny `vitest.config.ts` izoluje problem |
| `npm run dev` uruchamia blog build (może failować bez pliku) | Playwright używa `vite` bezpośrednio w `webServer.command` |
| Agent w watch mode (`vitest`) zawiesi się | agent używa `npm run test:run` |

## Sekwencja implementacji

1. Zainstaluj zależności (`vitest`, `playwright`, `chokidar`, itp.)
2. Stwórz `vitest.config.ts`
3. Stwórz `src/__tests__/setup.ts` + `src/__mocks__/supabase.ts`
4. Stwórz wzorcowy `src/__tests__/GoalCard.test.ts`
5. Stwórz `playwright.config.ts` + `e2e/example.spec.ts`
6. Stwórz strukturę `requirements/` + `TEMPLATE.md`
7. Stwórz `scripts/requirements-watcher.mjs`
8. Stwórz `scripts/process-requirement.mjs`
9. Zaktualizuj `package.json` (skrypty)
10. Zaktualizuj `CLAUDE.md` (sekcje Testing + Agent Workflow)
11. Weryfikacja: `npm run test:run` (powinny przejść wzorcowe testy)
12. Weryfikacja: `npm run test:e2e` (powinny przejść wzorcowe E2E)

## Weryfikacja końcowa

```bash
# 1. Uruchom watcher w tle
npm run watch:requirements &

# 2. Stwórz testowe wymaganie
cp requirements/TEMPLATE.md requirements/pending/test-feature.md
# Edytuj plik z prostym wymaganiem

# 3. Obserwuj logi — agent powinien się uruchomić automatycznie

# 4. Sprawdź wynik
ls requirements/done/   # powinien zawierać test-feature.md
git log --oneline -1    # powinien zawierać commit od agenta
```

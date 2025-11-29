# Mystery Maze — dokumentace projektu

Krátký popis
-----------
Mystery Maze je jednoduchá hra v JavaScriptu běžící v prohlížeči. Generuje bludiště, rozmístí klíče a pasti, a hráč se snaží najít východ. Projekt je rozdělen na malé ES moduly (renderer, input, generátor, umístění položek, hlavní hra) a obsahuje základní tooling (Vite, ESLint, Prettier, Vitest).

Požadavky
---------
- Node.js (doporučeno v16+ nebo 18+)
- npm
- Moderní prohlížeč s podporou canvas a ES modules

Rychlý start (lokálně)
----------------------
V terminálu ve složce `homeMadeSemestrakla`:

```powershell
npm install
npm run dev      # spustí vývojový server (Vite)
# Otevřít adresu, kterou vypíše Vite (např. http://localhost:5173)
```

Build a preview
----------------
```powershell
npm run build
npm run preview  # prohlédnout produkční build lokálně
```

Linting / formátování / testy
-----------------------------
- `npm run lint` — spustí ESLint
- `npm run format` — spustí Prettier (přepíše soubory)
- `npm run test` — spustí Vitest (jednoduché unit testy)

Struktura projektu (důležité soubory)
-----------------------------------
- `index.html` — hlavní stránka (tlačítka mají ID `btn-start`, `btn-restart`, ovládací prvky `btn-up`/`btn-left`/...).
- `css/style.css` — styly pro hru
- `js/game.js` — hlavní třída `MazeGame`, orchestruje hru (importuje moduly)
- `js/renderer.js` — ES modul exportující `MazeRenderer` (kreslení na canvas)
- `js/input.js` — ES modul exportující `setupInputs(game)` (klávesnice + touch), obsahuje cleanup
- `js/mazeGenerator.js` — `generateMaze(cols, rows)` (odděleno pro testování)
- `js/itemPlacer.js` — `placeItems(grid, config, TILE)` (umístění klíčů a pastí)
- `js/__tests__/*` — Vitest testy
- `package.json` — skripty a devDependencies (Vite, ESLint, Prettier, Vitest)

Modulové API (stručně)
----------------------
- MazeGame (v `js/game.js`):
  - `new MazeGame()` — inicializuje hru (není globálně vystaveno), stará se o resize, UI, start, gameLoop, gameOver.
  - `start()` — vytvoří bludiště, rozmístí položky a spustí hru; při startu se opět připojí vstupy.
  - `destroy()` — ukončí intervaly/RAF a odpojí listenery.

- MazeRenderer (v `js/renderer.js`):
  - `export class MazeRenderer` — konstruktor bere `ctx`, `config`, `TILE`. Volá se `renderer.draw(game)` z `game.draw()`.

- setupInputs (v `js/input.js`):
  - `export function setupInputs(game)` — přidá event listenery pro klávesnici a touch; na `game` ukládá `game._inputCleanup` funkci pro odstranění listenerů.

- generateMaze (v `js/mazeGenerator.js`):
  - `export function generateMaze(cols, rows)` — vrací 2D pole čísel reprezentující typy polí.

- placeItems (v `js/itemPlacer.js`):
  - `export function placeItems(grid, config, TILE)` — mutuje `grid` a vrací ho po umístění klíčů a pastí.

Testy
-----
- Vitest je nastaven v `package.json`. Testy se nacházejí v `js/__tests__` a testují generátor bludiště a umisťování položek.

CI
--
- `/.github/workflows/ci.yml` — provádí `npm ci`, `npm run lint`, `npm run build`, `npm run test` při push/pull_request do `main`.

Tipy pro nasazení
-----------------
- Vite výstup (`dist/`) lze nasadit na GitHub Pages, Netlify nebo Vercel. Pro Netlify stačí přidat build command `npm run build` a publikovat složku `dist`.
- Pokud chcete GitHub Pages, můžete přidat jednoduchý GitHub Action krok pro deploy (lze připravit automaticky).

Debugging
---------
- Pokud canvas nebo ovládání nespolupracuje:
  - otevřete DevTools (F12) → Console a podívejte se na chyby.
  - zkontrolujte, že `index.html` načítá `script type="module" src="./js/game.js"`.
  - po `gameOver()` se event listenery odstraňují; `start()` znovu volá `setupInputs` (pokud nejsou připojeny), takže restart by měl znovu aktivovat ovládání.

Další doporučení
----------------
- Přidat více unit testů pro kolizní logiku (`checkCollisions`, `movePlayer`) pomocí `jsdom` nebo modularizací logiky.
- Přidat ESLint pravidla a CI badge do README.
- Přepsat zbytky inline handlerů (pokud nějaké zůstanou) a odstranit `window` vystavení.

Pokud chcete, mohu vytvořit také:
- `CONTRIBUTING.md` s pravidly commitu a workflow,
- detailnější `CHANGELOG.md` nebo verzi projektu,
- GitHub Action pro automatický deploy (Netlify / GitHub Pages / Vercel).

Kontakt / poznámky
------------------
Pokud chcete, upravím README podle vašich preferencí (jazyk, detaily deploy, přidání screenshotů apod.).

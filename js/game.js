import { MazeRenderer } from './renderer.js';
import { setupInputs } from './input.js';
import { generateMaze } from './mazeGenerator.js';
import { placeItems } from './itemPlacer.js';

const CONFIG = {
    cols: 21,
    rows: 15,
    cellSize: 30,
    totalKeys: 3,
    trapCount: 6,
    trapCycleTime: 2000, // ms (čas cyklu pasti)
};

const TILE = {
    WALL: 0,
    FLOOR: 1,
    START: 2,
    EXIT: 3,
    KEY: 4,
    TRAP: 5,
};

class MazeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        this.keysDisplay = document.getElementById('keys-display');
        this.timeDisplay = document.getElementById('time-display');
        this.bestTimeDisplay = document.getElementById('best-time-display');
        this.startScreen = document.getElementById('start-screen');
        this.endScreen = document.getElementById('end-screen');
        this.endTitle = document.getElementById('end-title');
        this.endMessage = document.getElementById('end-message');

        this.grid = [];
        this.player = { x: 1, y: 1 };
        this.keysCollected = 0;
        this.isPlaying = false;
        this.startTime = 0;
        this.timerInterval = null;
        this.trapInterval = null;

        // If canvas/context is not available, show fallback
        if (!this.ctx) {
            const container = document.getElementById('game-container');
            if (container) container.innerHTML = '<p>Váš prohlížeč nepodporuje canvas.</p>';
            this.available = false;
            return;
        }
        this.available = true;

        this.resize();
        // debounce resize to avoid thrashing
        window.addEventListener('resize', () => {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = setTimeout(() => this.resize(), 120);
        });
        this.renderer = new MazeRenderer(this.ctx, CONFIG, TILE);
        // setup inputs (returns cleanup attached on game)
        setupInputs(this);
        this.loadBestTime();
    }

    resize() {
        const maxWidth = window.innerWidth - 40;
        const maxHeight = window.innerHeight - 200;
        let size = Math.floor(Math.min(maxWidth / CONFIG.cols, maxHeight / CONFIG.rows));
        CONFIG.cellSize = Math.max(15, Math.min(40, size));

        this.canvas.width = CONFIG.cols * CONFIG.cellSize;
        this.canvas.height = CONFIG.rows * CONFIG.cellSize;

        if (!this.isPlaying && this.grid.length > 0) {
            this.draw();
        }
    }

    start() {
        this.grid = generateMaze(CONFIG.cols, CONFIG.rows);
        placeItems(this.grid, CONFIG, TILE);

        this.player = { x: 1, y: 1 };
        this.keysCollected = 0;
        this.isPlaying = true;
        this.startTime = Date.now();

        this.updateUI();
        this.startScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');

        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);

        // ensure no previous RAF is running
        if (this._rafId) cancelAnimationFrame(this._rafId);
        // Re-attach input handlers in case they were removed on gameOver
        if (!this._inputCleanup) {
            try { setupInputs(this); } catch (e) { /* ignore */ }
        }

        this._rafId = requestAnimationFrame(() => this.gameLoop());
    }

    placeItems() {
        let keysPlaced = 0;
        while (keysPlaced < CONFIG.totalKeys) {
            let rx = Math.floor(Math.random() * CONFIG.cols);
            let ry = Math.floor(Math.random() * CONFIG.rows);
            if (this.grid[ry][rx] === TILE.FLOOR) {
                this.grid[ry][rx] = TILE.KEY;
                keysPlaced++;
            }
        }

        let trapsPlaced = 0;
        while (trapsPlaced < CONFIG.trapCount) {
            let rx = Math.floor(Math.random() * CONFIG.cols);
            let ry = Math.floor(Math.random() * CONFIG.rows);
            const dist = Math.abs(rx - 1) + Math.abs(ry - 1);
            // Pasti mohou být kdekoliv kromě startu
            if (this.grid[ry][rx] === TILE.FLOOR && dist > 2) {
                this.grid[ry][rx] = TILE.TRAP;
                trapsPlaced++;
            }
        }
    }

    // Vrací true, pokud jsou pasti zrovna aktivní (nebezpečné)
    isTrapActive() {
        const now = Date.now();
        return now % CONFIG.trapCycleTime < CONFIG.trapCycleTime / 2;
    }

    movePlayer(dx, dy) {
        if (!this.isPlaying) return;

        const newX = this.player.x + dx;
        const newY = this.player.y + dy;

        if (newX < 0 || newX >= CONFIG.cols || newY < 0 || newY >= CONFIG.rows) return;
        const targetTile = this.grid[newY][newX];

        if (targetTile === TILE.WALL) return;

        this.player.x = newX;
        this.player.y = newY;

        this.checkCollisions(targetTile, newX, newY);
        // Překreslení proběhne v gameLoop
    }

    checkCollisions(tile, x, y) {
        if (tile === TILE.KEY) {
            this.keysCollected++;
            this.grid[y][x] = TILE.FLOOR;
            this.updateUI();
        } else if (tile === TILE.TRAP) {
            if (this.isTrapActive()) {
                this.gameOver(false);
            }
            // Pokud není aktivní, nic se neděje, hráč stojí na pasti
        } else if (tile === TILE.EXIT) {
            if (this.keysCollected >= CONFIG.totalKeys) {
                this.gameOver(true);
            }
        }
    }

    checkCurrentTileDanger() {
        const tile = this.grid[this.player.y][this.player.x];
        if (tile === TILE.TRAP && this.isTrapActive()) {
            this.gameOver(false);
        }
    }

    updateTimer() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60)
            .toString()
            .padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        this.timeDisplay.innerText = `${minutes}:${seconds}`;
    }

    updateUI() {
        this.keysDisplay.innerText = `${this.keysCollected}/${CONFIG.totalKeys}`;
        if (this.keysCollected >= CONFIG.totalKeys) {
            this.keysDisplay.style.color = '#4cc9f0';
        } else {
            this.keysDisplay.style.color = '#fca311';
        }
    }

    gameOver(win) {
        this.isPlaying = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.trapInterval) {
            clearInterval(this.trapInterval);
            this.trapInterval = null;
        }
        if (this.touchInterval) {
            clearInterval(this.touchInterval);
            this.touchInterval = null;
        }
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }

        // remove input listeners
        if (this._inputCleanup) {
            try {
                this._inputCleanup();
            } catch (e) {
                /* ignore */
            }
        }

        this.endScreen.classList.remove('hidden');

        if (win) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.endTitle.innerText = 'VÍTĚZSTVÍ!';
            this.endTitle.style.color = '#4cc9f0';
            this.endMessage.innerText = `Skvělá práce! Unikl jsi z bludiště.\nČas: ${elapsed}s`;
            this.saveBestTime(elapsed);
        } else {
            this.endTitle.innerText = 'PROHRA';
            this.endTitle.style.color = '#ff0000';
            this.endMessage.innerText = 'Chytila tě past!';
        }
    }

    saveBestTime(time) {
        try {
            const currentBest = localStorage.getItem('mysteryMaze_bestTime');
            if (!currentBest || time < parseInt(currentBest)) {
                localStorage.setItem('mysteryMaze_bestTime', time);
                this.loadBestTime();
            }
        } catch (e) {
            // localStorage may be unavailable (private mode) - ignore
        }
    }

    loadBestTime() {
        try {
            const best = localStorage.getItem('mysteryMaze_bestTime');
            if (best) {
                const minutes = Math.floor(best / 60)
                    .toString()
                    .padStart(2, '0');
                const seconds = (best % 60).toString().padStart(2, '0');
                this.bestTimeDisplay.innerText = `${minutes}:${seconds}`;
            } else {
                this.bestTimeDisplay.innerText = '--:--';
            }
        } catch (e) {
            this.bestTimeDisplay.innerText = '--:--';
        }
    }

    draw() {
        this.renderer.draw(this);
    }

    gameLoop() {
        if (!this.isPlaying) return;

        // Kontrola, zda hráč nestojí na pasti, která se právě aktivovala
        this.checkCurrentTileDanger();
        this.draw();

        // schedule next frame
        if (this.isPlaying) {
            this._rafId = requestAnimationFrame(() => this.gameLoop());
        }
    }

    // Cleanup method to stop intervals/animations and listeners
    destroy() {
        this.isPlaying = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.trapInterval) {
            clearInterval(this.trapInterval);
            this.trapInterval = null;
        }
        if (this.touchInterval) {
            clearInterval(this.touchInterval);
            this.touchInterval = null;
        }
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        if (this._inputCleanup) {
            try {
                this._inputCleanup();
            } catch (e) {
                // ignore cleanup errors
            }
        }
    }
}

const game = new MazeGame();
// wire start/restart buttons (remove reliance on inline onclick)
const startBtn = document.getElementById('btn-start');
const restartBtn = document.getElementById('btn-restart');
if (startBtn) startBtn.addEventListener('click', () => game.start());
if (restartBtn) restartBtn.addEventListener('click', () => game.start());

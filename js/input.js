/* Input handler for the maze game (ES module) */
export function setupInputs(game) {
    // Prevent double-adding listeners: if cleanup exists, call it first
    if (game._inputCleanup) game._inputCleanup();

    const keyHandler = (e) => {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                game.movePlayer(0, -1);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                game.movePlayer(0, 1);
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                game.movePlayer(-1, 0);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                game.movePlayer(1, 0);
                break;
        }
    };

    window.addEventListener('keydown', keyHandler);

    const touchHandlers = [];
    const setupTouch = (id, dx, dy) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        const onDown = (e) => {
            e.preventDefault();
            game.movePlayer(dx, dy);
            game.touchInterval = setInterval(() => game.movePlayer(dx, dy), 200);
        };
        const clear = () => clearInterval(game.touchInterval);
        btn.addEventListener('pointerdown', onDown);
        btn.addEventListener('pointerup', clear);
        btn.addEventListener('pointerleave', clear);
        btn.addEventListener('pointercancel', clear);

        touchHandlers.push({ btn, onDown, clear });
    };

    setupTouch('btn-up', 0, -1);
    setupTouch('btn-down', 0, 1);
    setupTouch('btn-left', -1, 0);
    setupTouch('btn-right', 1, 0);

    // Provide cleanup function on game instance
    game._inputCleanup = () => {
        window.removeEventListener('keydown', keyHandler);
        for (const h of touchHandlers) {
            h.btn.removeEventListener('pointerdown', h.onDown);
            h.btn.removeEventListener('pointerup', h.clear);
            h.btn.removeEventListener('pointerleave', h.clear);
            h.btn.removeEventListener('pointercancel', h.clear);
        }
        if (game.touchInterval) {
            clearInterval(game.touchInterval);
            game.touchInterval = null;
        }
        game._inputCleanup = null;
    };
    return game._inputCleanup;
}

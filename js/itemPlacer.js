/* placeItems(grid, config, TILE)
   Mutates `grid` placing keys and traps according to config.
*/
export function placeItems(grid, config, TILE) {
    // place keys
    let keysPlaced = 0;
    const rows = config.rows;
    const cols = config.cols;

    while (keysPlaced < config.totalKeys) {
        const rx = Math.floor(Math.random() * cols);
        const ry = Math.floor(Math.random() * rows);
        if (grid[ry][rx] === TILE.FLOOR) {
            grid[ry][rx] = TILE.KEY;
            keysPlaced++;
        }
    }

    // place traps
    let trapsPlaced = 0;
    while (trapsPlaced < config.trapCount) {
        const rx = Math.floor(Math.random() * cols);
        const ry = Math.floor(Math.random() * rows);
        const dist = Math.abs(rx - 1) + Math.abs(ry - 1);
        if (grid[ry][rx] === TILE.FLOOR && dist > 2) {
            grid[ry][rx] = TILE.TRAP;
            trapsPlaced++;
        }
    }

    return grid;
}

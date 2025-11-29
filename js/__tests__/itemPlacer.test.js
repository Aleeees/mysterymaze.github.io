import { describe, it, expect } from 'vitest';
import { generateMaze } from '../mazeGenerator.js';
import { placeItems } from '../itemPlacer.js';

describe('placeItems', () => {
    it('places correct number of keys and traps and avoids start', () => {
        const cols = 21;
        const rows = 15;
        const CONFIG = { cols, rows, totalKeys: 3, trapCount: 6 };
        const TILE = { WALL: 0, FLOOR: 1, START: 2, EXIT: 3, KEY: 4, TRAP: 5 };

        const grid = generateMaze(cols, rows);
        // ensure we have floors where keys/traps can be placed
        placeItems(grid, CONFIG, TILE);

        // Count keys and traps
        let keyCount = 0;
        let trapCount = 0;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (grid[y][x] === TILE.KEY) keyCount++;
                if (grid[y][x] === TILE.TRAP) trapCount++;
            }
        }

        expect(keyCount).toBe(CONFIG.totalKeys);
        expect(trapCount).toBe(CONFIG.trapCount);

        // ensure no trap at start (1,1)
        expect(grid[1][1]).not.toBe(TILE.TRAP);
    });
});

import { describe, it, expect } from 'vitest';
import { generateMaze } from '../mazeGenerator.js';

describe('generateMaze', () => {
    it('creates grid with correct dimensions and start/exit', () => {
        const cols = 21;
        const rows = 15;
        const maze = generateMaze(cols, rows);
        expect(maze.length).toBe(rows);
        expect(maze[0].length).toBe(cols);
        // start at 1,1 and exit at rows-2,cols-2
        expect(maze[1][1]).toBeDefined();
        expect(maze[rows - 2][cols - 2]).toBeDefined();
    });
});

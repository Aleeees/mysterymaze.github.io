/* Maze generator extracted for testing and reusability */
export function generateMaze(cols, rows) {
    const TILE = {
        WALL: 0,
        FLOOR: 1,
        START: 2,
        EXIT: 3,
    };

    let maze = [];
    for (let y = 0; y < rows; y++) {
        let row = [];
        for (let x = 0; x < cols; x++) {
            row.push(TILE.WALL);
        }
        maze.push(row);
    }

    const stack = [];
    const startX = 1;
    const startY = 1;

    maze[startY][startX] = TILE.FLOOR;
    stack.push({ x: startX, y: startY });

    const directions = [
        { x: 0, y: -2 },
        { x: 0, y: 2 },
        { x: -2, y: 0 },
        { x: 2, y: 0 },
    ];

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const shuffledDirs = directions.sort(() => Math.random() - 0.5);
        let found = false;

        for (const dir of shuffledDirs) {
            const nx = current.x + dir.x;
            const ny = current.y + dir.y;

            if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && maze[ny][nx] === TILE.WALL) {
                maze[current.y + dir.y / 2][current.x + dir.x / 2] = TILE.FLOOR;
                maze[ny][nx] = TILE.FLOOR;
                stack.push({ x: nx, y: ny });
                found = true;
                break;
            }
        }

        if (!found) stack.pop();
    }

    maze[1][1] = TILE.START;
    maze[rows - 2][cols - 2] = TILE.EXIT;
    return maze;
}

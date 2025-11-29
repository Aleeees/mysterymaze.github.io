/* Renderer for the maze game (ES module) */
export class MazeRenderer {
    constructor(ctx, config, tileConst) {
        this.ctx = ctx;
        this.config = config;
        this.TILE = tileConst;
    }

    draw(game) {
        this.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
        const cs = this.config.cellSize;
        const trapActive = game.isTrapActive();

        for (let y = 0; y < this.config.rows; y++) {
            for (let x = 0; x < this.config.cols; x++) {
                const tile = game.grid[y][x];
                const px = x * cs;
                const py = y * cs;
                if (tile === this.TILE.WALL) {
                    this.ctx.fillStyle = '#16213e';
                    this.ctx.fillRect(px, py, cs, cs);
                    this.ctx.strokeStyle = '#1f2e4d';
                    this.ctx.strokeRect(px, py, cs, cs);
                } else {
                    this.ctx.fillStyle = '#0f3460';
                    this.ctx.fillRect(px, py, cs, cs);
                }

                if (tile === this.TILE.KEY) {
                    this.drawKey(px + cs / 2, py + cs / 2, cs / 3);
                } else if (tile === this.TILE.TRAP) {
                    this.drawTrap(px + cs / 2, py + cs / 2, cs / 2.5, trapActive);
                } else if (tile === this.TILE.EXIT) {
                    this.drawDoor(
                        px + cs / 2,
                        py + cs / 2,
                        cs,
                        game.keysCollected >= this.config.totalKeys
                    );
                } else if (tile === this.TILE.START) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    this.ctx.fillRect(px, py, cs, cs);
                }
            }
        }

        this.drawPlayer(game.player.x * cs + cs / 2, game.player.y * cs + cs / 2, cs / 2.5);
    }

    drawPlayer(x, y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#e94560';
        this.ctx.fill();
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(x - radius / 3, y - radius / 3, radius / 4, 0, Math.PI * 2);
        this.ctx.arc(x + radius / 3, y - radius / 3, radius / 4, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawKey(x, y, size) {
        this.ctx.fillStyle = '#fca311';
        this.ctx.beginPath();
        this.ctx.arc(x, y - size / 2, size / 1.5, 0, Math.PI * 2);
        this.ctx.fillRect(x - size / 4, y, size / 2, size * 1.5);
        this.ctx.fillRect(x, y + size, size / 1.5, size / 3);
        this.ctx.fill();
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#fca311';
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    drawTrap(x, y, size, active) {
        if (active) {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - size);
            this.ctx.lineTo(x + size, y + size);
            this.ctx.lineTo(x - size, y + size);
            this.ctx.fill();
            this.ctx.strokeStyle = '#ff9999';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        } else {
            this.ctx.fillStyle = '#4a2b2b';
            this.ctx.beginPath();
            const smaller = size * 0.7;
            this.ctx.moveTo(x, y - smaller);
            this.ctx.lineTo(x + smaller, y + smaller);
            this.ctx.lineTo(x - smaller, y + smaller);
            this.ctx.fill();
            this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
        }
    }

    drawDoor(x, y, size, isOpen) {
        this.ctx.fillStyle = isOpen ? '#4cc9f0' : '#533483';
        const padding = 2;
        this.ctx.fillRect(
            x - size / 2 + padding,
            y - size / 2 + padding,
            size - padding * 2,
            size - padding * 2
        );
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            x - size / 2 + padding,
            y - size / 2 + padding,
            size - padding * 2,
            size - padding * 2
        );

        this.ctx.fillStyle = 'white';
        if (isOpen) {
            this.ctx.fillRect(x - size / 6, y - size / 2, size / 3, size);
        } else {
            this.ctx.beginPath();
            this.ctx.arc(x, y, size / 5, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillRect(x - 2, y, 4, size / 3);
        }
    }
}

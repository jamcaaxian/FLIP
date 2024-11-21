export default class Robot {
    constructor(chess, team) {
        this.chess = chess;
        this.team = team;
        this.matrix = Array.from({ length: 7 }, () => Array(7).fill(0));
    }

    action() { // Will run before player's turn
        Object.entries(this.chess.data.attacker).forEach(([key, { x, y, side }]) => {
            this.matrix[y - 1][x - 1] = side === 0 ? -1 : 1; // attacker: side 0 is -1，side 1 is 1
        });

        Object.entries(this.chess.data.defender).forEach(([key, { x, y, side }]) => {
            this.matrix[y - 1][x - 1] = side === 0 ? -2 : 2; // defender: side 0 is -2，side 1 is 2
        });


        // 以下代码测试用
        this.randomRobot();
    }

    randomRobot() {
        this.result = 0;
        while (this.result === 0) {
            // 随机选择一个棋子
            const keys = Object.keys(this.chess.data[this.team]);
            const chess = this.chess.data[this.team][keys[Math.floor(Math.random() * keys.length)]];
            player.select({x: chess.x, y: chess.y}, chess, true);
            // 获取所有可以移动的位置
            const movablePositions = [];
            player.data.forEach((row, i) => {
                row.forEach((item, j) => {
                    if (item[1].isPredicting) {
                        movablePositions.push([i + 1, j + 1]);
                    }
                });
            });
            // 如果没有可移动的位置，则重新选择棋子
            if (movablePositions.length === 0) {
                console.warn(`No movable positions for chess piece at (${chess.x}, ${chess.y}). Retrying...`);
                continue;
            }
            // 随机选择一个位置
            const position = movablePositions[Math.floor(Math.random() * movablePositions.length)];
            // 如果 position 无效，则重新选择棋子
            if (!position || position.length !== 2) {
                console.warn('Invalid position selected. Retrying...');
                continue;
            }
            // 如果 position 有效，更新状态并执行动作
            this.result = 1;
            setTimeout(() => {
                player.action({x: position[0], y: position[1]}, true);
            }, 0);
        }
    }
}
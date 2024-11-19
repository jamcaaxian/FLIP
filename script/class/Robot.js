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
        const keys = Object.keys(this.chess.data[this.team]);
        const chess = this.chess.data[this.team][keys[Math.floor(Math.random() * keys.length)]];
        player.select({x: chess.x, y: chess.y}, chess);
        const movablePositions = [];
        player.data.forEach((row, i) => { // 外层数组遍历，记录行索引 i
            row.forEach((item, j) => { // 内层数组遍历，记录列索引 j
                if (item[1].isPredicting) { // 检查 isPredicting 是否为 true
                    movablePositions.push([i + 1, j + 1]); // 将索引 [i, j] 添加到 arr 中
                }
            });
        });
        const position = movablePositions[Math.floor(Math.random() * movablePositions.length)];
        setTimeout(() => {
            player.action({x: position[0], y: position[1]}, true);
        }, 500);
    }
}

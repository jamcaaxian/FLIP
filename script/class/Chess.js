export default class Chess {
    constructor(chessboard) {
        this.chessboard = chessboard;

        // 初始位置(x, y)和朝向(side): 0是反面, 1是正面
        this.initialData = {
            attacker: {
                a: {x: 1, y: 4, side: 0},
                b: {x: 2, y: 5, side: 1},
                c: {x: 3, y: 6, side: 0},
                d: {x: 4, y: 7, side: 1},
                e: {x: 5, y: 7, side: 0},
                f: {x: 6, y: 7, side: 1},
                g: {x: 7, y: 7, side: 0}
            },

            defender: {
                a: {x: 1, y: 1, side: 1},
                b: {x: 2, y: 1, side: 0},
                c: {x: 3, y: 1, side: 1},
                d: {x: 4, y: 1, side: 0},
                e: {x: 5, y: 2, side: 1},
                f: {x: 6, y: 3, side: 0},
                g: {x: 7, y: 4, side: 1}
            }
        };

        this.data = JSON.parse(JSON.stringify(this.initialData));
        
        this.generateCanvas();

        this.update();
    }

    update() {
        this.clear();

        for (let key in this.data.attacker) {
            this.drawChess(this.data.attacker[key].x, this.data.attacker[key].y, 'attacker', this.data.attacker[key].side);
        }
        for (let key in this.data.defender) {
            this.drawChess(this.data.defender[key].x, this.data.defender[key].y, 'defender', this.data.defender[key].side);
        }
    }

    generateCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'chess';
        this.canvas.width = this.chessboard.size;
        this.canvas.height = this.chessboard.size;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = this.chessboard.origin.y + 'px';
        this.canvas.style.left = this.chessboard.origin.x + 'px';
        this.canvas.style.transform = 'translate(-50%, -50%)';
        this.canvas.style.backgroundColor = "#00000000";
        document.body.appendChild(this.canvas);
    }

    drawChess(x, y, team, side) {
        const context = this.canvas.getContext('2d');
        const radius = this.chessboard.size / 48; // 圆的半径

        context.beginPath(); // 开始新的路径
        context.arc(this.chessboard.getPosition(x, y).x, this.chessboard.getPosition(x, y).y, radius, 0, Math.PI * 2); // 绘制圆形
        context.fillStyle = team === 'attacker' ? 'black' : 'white'; // 填充颜色
        context.fill(); // 填充圆形

        context.lineWidth = this.chessboard.size / 240; // 边框的粗细
        context.strokeStyle = (team === 'attacker') === (side === 0) ? 'white' : 'black'; // 边框颜色
        context.stroke(); // 绘制圆形边框
    }

    clear() {
        const context = this.canvas.getContext('2d');
        context.clearRect(0, 0, this.chessboard.size, this.chessboard.size);
    }
}
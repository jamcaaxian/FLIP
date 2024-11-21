export default class Chessboard {
    constructor(backgroundColor, hexagonColor, landColor, shadowColor, origin, size) {
        this.backgroundColor = backgroundColor;
        this.hexagonColor = hexagonColor;
        this.land = [];
        this.landColor = landColor;
        this.shadowColor = shadowColor;
        this.origin = {x: origin[0], y: origin[1]};
        this.size = size;
        this.angle = 0; // 初始角度
        this.radius = this.size / 60; // 圆形轨迹的半径
        this.shadowSpeed = 0.01; // 阴影移动速度
        this.positions = [
            Array.from({ length: 7 }, (_, i) => ({
                x: this.size / 2 - 3 * this.size / 24 * Math.sqrt(3),
                y: (4.5 + i) * this.size / 12
            })),
            Array.from({ length: 7 }, (_, i) => ({
                x: this.size / 2 - 2 * this.size / 24 * Math.sqrt(3),
                y: (4.0 + i) * this.size / 12
            })),
            Array.from({ length: 7 }, (_, i) => ({
                x: this.size / 2 - this.size / 24 * Math.sqrt(3),
                y: (3.5 + i) * this.size / 12
            })),
            Array.from({ length: 7 }, (_, i) => ({
                x: this.size / 2,
                y: (3.0 + i) * this.size / 12
            })),
            Array.from({ length: 7 }, (_, i) => ({
                x: this.size / 2 + this.size / 24 * Math.sqrt(3),
                y: (2.5 + i) * this.size / 12
            })),
            Array.from({ length: 7 }, (_, i) => ({
                x: this.size / 2 + 2 * this.size / 24 * Math.sqrt(3),
                y: (2.0 + i) * this.size / 12
            })),
            Array.from({ length: 7 }, (_, i) => ({
                x: this.size / 2 + 3 * this.size / 24 * Math.sqrt(3),
                y: (1.5 + i) * this.size / 12
            }))
        ];

        this.drawChessboard();

        // 开始动画
        this.animateShadow();
    }

    drawChessboard() {
        this.generateBackground();
        this.generateHexagons();
    }

    generateBackground() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'chessboard';
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = this.origin.y + 'px';
        this.canvas.style.left = this.origin.x + 'px';
        this.canvas.style.transform = 'translate(-50%, -50%)';
        this.canvas.style.backgroundColor = this.backgroundColor;
        document.body.appendChild(this.canvas);
    }

    generateHexagons() {
        for (let i = 0; i < 4; i++) {
            this.drawHexagon(this.size / 2 - 3 * this.size / 24 * Math.sqrt(3), (i + 4.5) * this.size / 12, this.size / 24, this.hexagonColor);
        }// Line 1
        for (let i = 0; i < 5; i++) {
            this.drawHexagon(this.size / 2 - 2 * this.size / 24 * Math.sqrt(3), (i + 4) * this.size / 12, this.size / 24, this.hexagonColor);
        }// Line 2
        for (let i = 0; i < 6; i++) {
            this.drawHexagon(this.size / 2 - this.size / 24 * Math.sqrt(3), (i + 3.5) * this.size / 12, this.size / 24, this.hexagonColor);
        }// Line 3
        for (let i = 0; i < 7; i++) {
            this.drawHexagon(this.size / 2, (i + 3) * this.size / 12, this.size / 24, this.hexagonColor);
        }// Line 4
        for (let i = 0; i < 6; i++) {
            this.drawHexagon(this.size / 2 + this.size / 24 * Math.sqrt(3), (i + 3.5) * this.size / 12, this.size / 24, this.hexagonColor);
        }// Line 5
        for (let i = 0; i < 5; i++) {
            this.drawHexagon(this.size / 2 + 2 * this.size / 24 * Math.sqrt(3), (i + 4) * this.size / 12, this.size / 24, this.hexagonColor);
        }// Line 6
        for (let i = 0; i < 4; i++) {
            this.drawHexagon(this.size / 2 + 3 * this.size / 24 * Math.sqrt(3), (i + 4.5) * this.size / 12, this.size / 24, this.hexagonColor);
        }// Line 7

        // Land 1
        this.drawHexagon(this.size / 2 - 3 * this.size / 24 * Math.sqrt(3), 9.5 * this.size / 12, this.size / 24, this.landColor);
        // Land 2
        this.drawHexagon(this.size / 2 - 2 * this.size / 24 * Math.sqrt(3), 10 * this.size / 12, this.size / 24, this.landColor);
        // Land 3
        this.drawHexagon(this.size / 2 - 3 * this.size / 24 * Math.sqrt(3), 10.5 * this.size / 12, this.size / 24, this.landColor);
        // Land 4
        this.drawHexagon(this.size / 2 + 3 * this.size / 24 * Math.sqrt(3), 1.5 * this.size / 12, this.size / 24, this.landColor);
        // Land 5
        this.drawHexagon(this.size / 2 + 2 * this.size / 24 * Math.sqrt(3), 2 * this.size / 12, this.size / 24, this.landColor);
        // Land 6
        this.drawHexagon(this.size / 2 + 3 * this.size / 24 * Math.sqrt(3), 2.5 * this.size / 12, this.size / 24, this.landColor);
    
        // Center Hexagon
        this.drawHexagon(this.size / 2, this.size / 2, this.size / 24, this.landColor);
    }

    drawHexagon(centerX, centerY, size, hexagonColor) {
        const context = this.canvas.getContext('2d');

        context.shadowColor = this.shadowColor; // 阴影颜色
        context.shadowBlur = this.size / 60; // 阴影模糊程度
        context.shadowOffsetX = this.shadowOffsetX; // 阴影水平偏移
        context.shadowOffsetY = this.shadowOffsetY; // 阴影垂直偏移

        context.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 3 * i;
            const x_i = centerX + size * Math.cos(angle);
            const y_i = centerY + size * Math.sin(angle);
            if (i === 0) {
                context.moveTo(x_i, y_i);
            } else {
                context.lineTo(x_i, y_i);
            }
        }
        context.closePath();

        context.fillStyle = hexagonColor + '80';
        context.fill();
    }

    animateShadow() {
        const context = this.canvas.getContext('2d');

        // 计算阴影的偏移量
        this.shadowOffsetX = this.radius * Math.cos(this.angle);
        this.shadowOffsetY = this.radius * Math.sin(this.angle);

        // 清除画布并重新绘制六边形
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.generateHexagons();

        // 更新角度
        this.angle += this.shadowSpeed;
        if (this.angle > 2 * Math.PI) {
            this.angle -= 2 * Math.PI; // 保持角度在0到2π之间
        }

        requestAnimationFrame(() => this.animateShadow()); // 继续动画
    }

    getPosition(x, y) {
        return this.positions[x - 1][y - 1];
    }
}
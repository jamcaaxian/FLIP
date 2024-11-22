export default class UI {
    constructor(chessboard) {
        this.chessboard = chessboard;
        this.generateCanvas();
        this.hexagonColor = ['#2255EE', '#55EE22', '#EE2255'];
        this.buttons = []; // 存储按钮的位置信息
        this.generateHexagons();

        this.animateShadow();
        this.addEventListeners();
    }

    generateCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'ui';
        this.canvas.width = this.chessboard.size / 3.5;
        this.canvas.height = this.chessboard.size / 6;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = this.canvas.height + 'px';
        this.canvas.style.left = this.chessboard.size / 2 - this.canvas.width / 2.5 + 'px';
        this.canvas.style.transform = 'translate(-50%, -50%)';
        this.canvas.style.backgroundColor = "#00000000";
        document.body.appendChild(this.canvas);
    }

    generateHexagons() {
        const hexagonPositions = [
            [this.canvas.width / 4 + 0 * this.chessboard.size / 24 * Math.sqrt(3), this.canvas.height / 2 - 0.25 * this.chessboard.size / 12],
            [this.canvas.width / 4 + 1 * this.chessboard.size / 24 * Math.sqrt(3), this.canvas.height / 2 + 0.25 * this.chessboard.size / 12],
            [this.canvas.width / 4 + 2 * this.chessboard.size / 24 * Math.sqrt(3), this.canvas.height / 2 - 0.25 * this.chessboard.size / 12]
        ];
        
        hexagonPositions.forEach((pos, index) => {
            this.buttons.push({
                x: pos[0],
                y: pos[1],
                size: this.chessboard.size / 24,
                action: this[`button${String.fromCharCode(65 + index)}`].bind(this),
            });
            this.drawHexagon(pos[0], pos[1], this.chessboard.size / 24, this.hexagonColor[index]);
        });
    }

    drawHexagon(centerX, centerY, size, hexagonColor) {
        const context = this.canvas.getContext('2d');

        context.shadowColor = hexagonColor; // 阴影颜色
        context.shadowBlur = this.chessboard.size / 60; // 阴影模糊程度
        context.shadowOffsetX = this.chessboard.shadowOffsetX / 2; // 阴影水平偏移
        context.shadowOffsetY = this.chessboard.shadowOffsetY / 2; // 阴影垂直偏移

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

    addEventListeners() {
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // 判断鼠标点击位置是否在六边形内
            for (const button of this.buttons) {
                if (this.isInsideHexagon(mouseX, mouseY, button.x, button.y, button.size)) {
                    button.action(); // 执行对应的按钮操作
                    break;
                }
            }
        });
    }

    isInsideHexagon(mouseX, mouseY, centerX, centerY, size) {
        const dx = Math.abs(mouseX - centerX);
        const dy = Math.abs(mouseY - centerY);
        if (dx > size || dy > size * Math.sqrt(3) / 2) {
            return false; // 快速排除不可能的情况
        }
        return (dx * Math.sqrt(3) + dy) <= size * Math.sqrt(3); // 检查是否在六边形内
    }

    buttonA() {
        if (confirm("回到主界面？\nQuit the game?"))  {
            window.location.href = "index.html";
        }
    }

    buttonB() {
        // record 中的八位数字含义:
        // 1. 白棋为 0, 黑棋为 1
        // 2. 移动起点 x 坐标
        // 3. 移动起点 y 坐标
        // 4. 移动终点 x 坐标
        // 5. 移动终点 y 坐标
        // 6. 没有上岛为 0, 有上岛为 1
        // 7. 没有翻转为 0, 其它值为翻转 x 坐标
        // 8. 没有翻转为 0, 其它值为翻转 y 坐标
        navigator.clipboard.writeText(JSON.stringify(window.player.record, null, 2))
            .then(() => alert("对局记录已复制！\nThe game record has been copied!"))
            .catch(() => alert("复制失败！\nCopy failed!"));
    }

    buttonC() {
        let record, max, interval;
    
        // 获取棋谱输入
        let input = prompt("从棋谱中加载对局\nLoad game from record\n请在此处粘贴棋谱：\nPaste the record here:");
        if (!input) return;  // 如果没有输入棋谱，则直接返回
    
        // 尝试解析棋谱并判断格式
        try {
            record = JSON.parse(input);
            if (!Array.isArray(record)) throw new Error("格式错误");
        } catch (e) {
            return alert("棋谱格式错误！\nRecord format error!");  // 如果解析失败，则提示错误
        }
    
        // 获取加载到的步数
        input = prompt("加载棋谱到第几步？（非必填）：\nLoad the record to which step? (Optional):");
        max = (input && Number.isInteger(Number(input)) && record[input - 1]) ? Number(input) : record.length;
    
        // 获取每步加载的时间间隔
        input = prompt("每步加载的时间间隔（单位：秒，非必填）：\nTime interval between each step (Seconds, Optional):");
        interval = (input && !isNaN(input) && input >= 0) ? input * 1000 : 0;  // 默认为0秒
    
        // 调用 loadRecord 函数
        window.player.loadRecord(max, interval, record);
    }

    animateShadow() {
        const context = this.canvas.getContext('2d');

        // 计算阴影的偏移量
        this.shadowOffsetX = this.chessboard.radius * Math.cos(this.angle);
        this.shadowOffsetY = this.chessboard.radius * Math.sin(this.angle);

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
}
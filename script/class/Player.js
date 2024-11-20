export default class Player {
    constructor(chess, team, isRobot = false,highlightColor = {
        select: '#DDFF44',
        cursor: '#DDFF4480',
        predict: '#3388FF',
        moveFrom: '#EE225580',
        moveTo: '#EE2255'
    }, gamepadSensitivity = 0.5) {
        this.chess = chess;
        this.team = team;
        this.isRobot = isRobot;
        this.highlightColor = highlightColor;
        this.gamepadSensitivity = gamepadSensitivity;
        this.chessboard = this.chess.chessboard;
        this.moveFrom = {x: 0, y: 0};
        this.moveTo = {x: 0, y: 0};

        this.data = this.resetData();

        this.gamepadPosition = {
            clientX: this.chessboard.origin.x,
            clientY: this.chessboard.origin.y
        };

        this.buttonPressed = {
            A: false,
            B: false,
            X: false,
            Y: false,
            LB: false,
            RB: false,
            LT: false,
            RT: false,
            option: false,
            menu: false,
            up: false,
            down: false,
            left: false,
            right: false
        };

        this.generateCanvas();

        this.update();
    }

    update() {
        this.clear();

        if (this.moveFrom.x!== 0 && this.moveTo.x!== 0 && this.moveFrom.y!== 0 && this.moveTo.y!== 0) {
            this.highlight(this.moveFrom.x, this.moveFrom.y, this.highlightColor.moveFrom);
            this.highlight(this.moveTo.x, this.moveTo.y, this.highlightColor.moveTo);
        }

        this.data.forEach((row, x) => {
            row.forEach((col, y) => {
                if (col[0] !== 0) {
                    const centerX = this.chessboard.getPosition(x + 1, y + 1).x;
                    const centerY = this.chessboard.getPosition(x + 1, y + 1).y;
                    const size = this.chessboard.size / 24;

                    const context = this.canvas.getContext('2d');
                
                    context.beginPath();  // 开始新的路径
                
                    // 计算六边形的每个顶点，并绘制路径
                    for (let i = 0; i < 6; i++) {
                        const angle = Math.PI / 3 * i;  // 当前顶点的角度（60度的倍数）
                        const x_i = centerX + size * Math.cos(angle);  // 顶点的x坐标
                        const y_i = centerY + size * Math.sin(angle);  // 顶点的y坐标
                
                        if (i === 0) {
                            context.moveTo(x_i, y_i);  // 移动到第一个顶点
                        } else {
                            context.lineTo(x_i, y_i);  // 绘制到下一个顶点
                        }
                    }
                
                    context.closePath();  // 关闭路径

                    context.strokeStyle = col[0];  // 设置边框颜色
                    context.lineWidth = this.chessboard.size / 180;  // 设置边框宽度
                    context.stroke();  // 绘制边框
                }
            })
        });

        // If one of player won
        const attackerSides = Object.values(this.chess.data.attacker).map(unit => unit.side);
        const defenderSides = Object.values(this.chess.data.defender).map(unit => unit.side);
        const isAllOne = sides => sides.every(side => side === 1);
        const isAllZero = sides => sides.every(side => side === 0);

        if (isAllOne(attackerSides) || isAllZero(defenderSides)) {
            setTimeout(() => {
                window.location.href = "win.html?team=attacker";
            }, 3000);
        } else if (isAllOne(defenderSides) || isAllZero(attackerSides)) {
            setTimeout(() => {
                window.location.href = "win.html?team=defender";
            }, 3000);
        } else {
            return false;
        }
    }

    generateCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'player';
        this.canvas.width = this.chessboard.size;
        this.canvas.height = this.chessboard.size;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = this.chessboard.origin.y + 'px';
        this.canvas.style.left = this.chessboard.origin.x + 'px';
        this.canvas.style.transform = 'translate(-50%, -50%)';
        this.canvas.style.backgroundColor = "#00000000";
        document.body.appendChild(this.canvas);

        if (!this.isRobot) {
            // 添加事件监听器
            this.canvas.addEventListener('click', (event) => this.click(event));
            this.canvas.addEventListener('mousemove', (event) => this.hover(event));

            // 添加游戏手柄事件监听器
            window.addEventListener('gamepadconnected', (event) => {
                document.body.style.cursor = 'none';
                console.log(`Gamepad: ${event.gamepad.id} connected.`);
                this.gamepad();
            });
            window.addEventListener('gamepaddisconnected', (event) => {
                document.body.style.cursor = 'auto';
                console.log(`Gamepad: ${event.gamepad.id} disconnected.`);
            });
        }
    }

    highlight(x, y, color = 0) {
        this.data[x - 1][y - 1][0] = color;
    }

    resetData() {
        let data = Array(7).fill().map(() => Array(7).fill().map(() => [0, {
            isSelectable: true,
            isSelecting: false,
            isCursoring: false,
            isPredicting: false
        }]));

        data[0][4][1].isSelectable = false;
        data[0][5][1].isSelectable = false;
        data[0][6][1].isSelectable = false;
        data[1][5][1].isSelectable = false;
        data[1][6][1].isSelectable = false;
        data[2][6][1].isSelectable = false;
        data[4][0][1].isSelectable = false;
        data[5][0][1].isSelectable = false;
        data[5][1][1].isSelectable = false;
        data[6][0][1].isSelectable = false;
        data[6][1][1].isSelectable = false;
        data[6][2][1].isSelectable = false;

        return data;
    }

    clear() {
        const context = this.canvas.getContext('2d');
        context.clearRect(0, 0, this.chessboard.size, this.chessboard.size);
    }

    getPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        for (let i = 0; i < this.chessboard.positions.length; i++) {
            for (let j = 0; j < this.chessboard.positions[i].length; j++) {
                const hexPos = this.chessboard.positions[i][j];
                const hexRadius = this.chessboard.size / 24;
                const distance = Math.sqrt((x - hexPos.x) ** 2 + (y - hexPos.y) ** 2);
    
                if (distance <= hexRadius) {
                    return {x: i + 1, y: j + 1};
                }
            }
        }

        return null;
    }

    gamepad() {
        const gamepads = navigator.getGamepads(); // 获取所有手柄
    
        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (gamepad) {
                const leftStick = { x: gamepad.axes[0], y: gamepad.axes[1] };
                const rightStick = { x: gamepad.axes[2], y: gamepad.axes[3] };
                const buttons = {
                    A: gamepad.buttons[0]?.pressed,
                    B: gamepad.buttons[1]?.pressed,
                    X: gamepad.buttons[2]?.pressed,
                    Y: gamepad.buttons[3]?.pressed,
                    LB: gamepad.buttons[4]?.pressed,
                    RB: gamepad.buttons[5]?.pressed,
                    LT: gamepad.buttons[6]?.pressed,
                    RT: gamepad.buttons[7]?.pressed,
                    option: gamepad.buttons[8]?.pressed,
                    menu: gamepad.buttons[9]?.pressed,
                    up: gamepad.buttons[12]?.pressed,
                    down: gamepad.buttons[13]?.pressed,
                    left: gamepad.buttons[14]?.pressed,
                    right: gamepad.buttons[15]?.pressed
                };
    
                if (Math.sqrt(leftStick.x ** 2 + leftStick.y ** 2) > 0.2) {
                    this.gamepadPosition.clientX = Math.min(Math.max(this.gamepadPosition.clientX + leftStick.x * 10 * this.gamepadSensitivity, 0), this.canvas.width);
                    this.gamepadPosition.clientY = Math.min(Math.max(this.gamepadPosition.clientY + leftStick.y * 10 * this.gamepadSensitivity, 0), this.canvas.height);
                    this.hover(this.gamepadPosition);
                }
            
                if (buttons.A && !this.buttonPressed.A) {
                    this.buttonPressed.A = true;
                    this.click(this.gamepadPosition);
                } else if (!buttons.A && this.buttonPressed.A) {
                    this.buttonPressed.A = false;
                }
            }
        }
    
        requestAnimationFrame(this.gamepad.bind(this));
    }
    
    click(event) {
        const position = this.getPosition(event);
        let isSelected = false;

        if (position) {
            for (const key in this.chess.data[this.team]) {
                if (this.chess.data[this.team][key].x === position.x && this.chess.data[this.team][key].y === position.y) {
                    this.select(position, this.chess.data[this.team][key]);
                    isSelected = true;
                    break;
                }
            }
            
            if (!isSelected) {
                this.action(position);
            }
        }
        
        this.update();
        this.hover(event);
    }

    hover(event) {
        const position = this.getPosition(event);
        this.cursor(position);
        this.update();
    }

    select(position, chess, isRobot = false) {
        if (this.data[position.x - 1][position.y - 1][1].isSelectable) {
            if (this.data[position.x - 1][position.y - 1][1].isSelecting) {
                this.data[position.x - 1][position.y - 1][1].isSelecting = false;
                this.highlight(position.x, position.y, 0);

                this.predictor(position, chess).forEach(predictedPosition => {
                    this.data[predictedPosition.x - 1][predictedPosition.y - 1][1].isPredicting = false;
                    this.highlight(predictedPosition.x, predictedPosition.y, 0);
                });
            } else {
                this.data.forEach(row => {
                    row.forEach(col => {
                        col[1].isSelecting = false;
                        col[1].isPredicting = false;
                        col[0] = 0;
                    });
                });

                this.data[position.x - 1][position.y - 1][1].isSelecting = true;
                if (!isRobot) {
                    this.highlight(position.x, position.y, this.highlightColor.select);
                }

                this.predictor(position, chess).forEach(predictedPosition => {
                    this.data[predictedPosition.x - 1][predictedPosition.y - 1][1].isPredicting = true;
                    if (!isRobot) {
                        this.highlight(predictedPosition.x, predictedPosition.y, this.highlightColor.predict);
                    }
                });
            }
        }
    }

    cursor(position) {
        if (position && position.x >= 1 && position.x <= 7 &&position.y >= [1, 1, 1, 1, 2, 3, 4][position.x - 1] && position.y <= [4, 5, 6, 7, 7, 7, 7][position.x - 1]) {
            // 在棋盘范围内
            this.data.forEach((row, x) => {
                row.forEach((col, y) => {
                    col[1].isCursoring = false;
                    if (!col[1].isSelecting && !col[1].isPredicting && (x !== position.x - 1 || y !== position.y - 1)) {
                        col[0] = 0;
                    }
                });
            });
            
            this.data[position.x - 1][position.y - 1][1].isCursoring = true;
            this.highlight(position.x, position.y, this.highlightColor.cursor);

            if (this.data[position.x - 1][position.y - 1][1].isSelecting || this.data[position.x - 1][position.y - 1][1].isPredicting) {
                this.restore = {x: position.x, y: position.y};
            } else {
                if (this.restore) {
                    if (this.data[this.restore.x - 1][this.restore.y - 1][1].isSelecting) {
                        this.highlight(this.restore.x, this.restore.y, this.highlightColor.select);
                    }

                    if (this.data[this.restore.x - 1][this.restore.y - 1][1].isPredicting) {
                        this.highlight(this.restore.x, this.restore.y, this.highlightColor.predict);
                    }
                }
                this.restore = null;
            }
        } else {
            // 在棋盘范围外
            this.data.forEach(row => {
                row.forEach(col => {
                    col[1].isCursoring = false;
                    if (!col[1].isSelecting && !col[1].isPredicting) {
                        col[0] = 0;
                    }
                });
            });

            if (this.restore) {
                if (this.data[this.restore.x - 1][this.restore.y - 1][1].isSelecting) {
                    this.highlight(this.restore.x, this.restore.y, this.highlightColor.select);
                }

                if (this.data[this.restore.x - 1][this.restore.y - 1][1].isPredicting) {
                    this.highlight(this.restore.x, this.restore.y, this.highlightColor.predict);
                }
            }
            this.restore = null;

            let nearestPosition = null;
            
            for (let i = 0, minDistance = Infinity; i < this.chessboard.positions.length; i++) {
                for (let j = 0; j < this.chessboard.positions[i].length; j++) {
                    const hexPos = this.chessboard.positions[i][j];
                    const distance = Math.sqrt((this.gamepadPosition.clientX - hexPos.x) ** 2 + (this.gamepadPosition.clientY - hexPos.y) ** 2);

                    if (distance < minDistance && i + 1 >= 1 && i + 1 <= 7 && j + 1 >= [1, 1, 1, 1, 2, 3, 4][i] && j + 1 <= [4, 5, 6, 7, 7, 7, 7][i]) {
                        minDistance = distance;
                        nearestPosition = hexPos;
                    }
                }
            }

            if (nearestPosition) {
                this.gamepadPosition.clientX = nearestPosition.x;
                this.gamepadPosition.clientY = nearestPosition.y;
            }
        }
    }

    moveChess(positionFrom, positionTo) {
        let status = false;
        ['attacker', 'defender'].forEach(team => {
            Object.keys(this.chess.data[team]).forEach(key => {
                if (this.chess.data[team][key].x === positionFrom.x && this.chess.data[team][key].y === positionFrom.y) {
                    this.chess.data[team][key].x = positionTo.x;
                    this.chess.data[team][key].y = positionTo.y;
                    this.chess.update();

                    this.data = this.resetData();
                    this.update();

                    this.moveFrom = positionFrom;
                    this.moveTo = positionTo;

                    status = true;
                }
            });
        });

        return status;
    }

    flipChess(position) {
        let status = false;
        ['attacker', 'defender'].forEach(team => {
            Object.keys(this.chess.data[team]).forEach(key => {
                if (this.chess.data[team][key].x === position.x && this.chess.data[team][key].y === position.y) {
                    this.chess.data[team][key].side = this.chess.data[team][key].side ^ 1;
                    this.chess.update();

                    this.data = this.resetData();
                    this.update();

                    status = true;
                }
            });
        });

        return status;
    }

    action(position, isRobot = false) {
        if (this.data[position.x - 1][position.y - 1][1].isPredicting) {
            this.data.forEach((row, x) => {
                row.forEach((col, y) => {
                    if (col[1].isSelecting) {
                        if (position.x === 4 && position.y === 4) {
                            // 中心位置
                            let side;
                            Object.values(this.chess.data).forEach(team => {
                                Object.values(team).forEach(chess => {
                                    if (chess.x === x + 1 && chess.y === y + 1) {
                                        side = chess.side;
                                    }
                                });
                            });

                            if (side == 0) {
                                // 是反棋, 上岛
                                const attackerLands = [
                                    {x: 1, y: 6},
                                    {x: 1, y: 7},
                                    {x: 2, y: 7},
                                    {x: 7, y: 2},
                                    {x: 7, y: 1},
                                    {x: 6, y: 1}
                                ];
    
                                const defenderLands = [
                                    {x: 7, y: 2},
                                    {x: 7, y: 1},
                                    {x: 6, y: 1},
                                    {x: 1, y: 6},
                                    {x: 1, y: 7},
                                    {x: 2, y: 7}
                                ];
                                
                                const isLandEmpty = (x, y) => 
                                    !Object.values(this.chess.data.attacker).find(item => item.x === x && item.y === y) &&
                                    !Object.values(this.chess.data.defender).find(item => item.x === x && item.y === y);
                                
                                if (Object.values(this.chess.data.attacker).find(item => item.x === x + 1 && item.y === y + 1)) {
                                    // 进攻方
                                    for (const land of attackerLands) {
                                        if (isLandEmpty(land.x, land.y)) {
                                            this.moveChess({x: x + 1, y: y + 1}, land);
                                            this.flipChess(land);
                                            break; // 成功找到并处理一个位置后退出
                                        }
                                    }
                                }
                                
                                if (Object.values(this.chess.data.defender).find(item => item.x === x + 1 && item.y === y + 1)) {
                                    // 防守方
                                    for (const land of defenderLands) {
                                        if (isLandEmpty(land.x, land.y)) {
                                            this.moveChess({x: x + 1, y: y + 1}, land);
                                            this.flipChess(land);
                                            break; // 成功找到并处理一个位置后退出
                                        }
                                    }
                                }

                                if (!isRobot) {
                                    window.robot.action();
                                }
                            }
                        } else {
                            // 移动棋子
                            this.moveChess({x: x + 1, y: y + 1}, position);
                            console.log(`Move Chess from (${x + 1}, ${y + 1}) to (${position.x}, ${position.y})`);

                            // 翻转棋子
                            const flipPosition = {x: (position.x + x + 1) / 2, y: (position.y + y + 1) / 2};
                            if (Object.values(this.chess.data.attacker).find(item => item.x === flipPosition.x && item.y === flipPosition.y) ||
                                Object.values(this.chess.data.defender).find(item => item.x === flipPosition.x && item.y === flipPosition.y)) {
                                this.flipChess(flipPosition);
                                console.log(`Flip Chess at (${flipPosition.x}, ${flipPosition.y})`);
                            }

                            if (!isRobot) {
                                window.robot.action();
                            }
                        }
                    }
                });
            });
        }
        if (this.moveFrom.x!== 0 && this.moveTo.x!== 0 && this.moveFrom.y!== 0 && this.moveTo.y!== 0) {
            this.highlight(this.moveFrom.x, this.moveFrom.y, this.highlightColor.moveFrom);
            this.highlight(this.moveTo.x, this.moveTo.y, this.highlightColor.moveTo);
            this.update();
        }
    }

    predictor(position, chess) {
        let result = [];
        // x 坐标对应的 y 坐标的范围
        const yRange = {
            1: [1, 4],
            2: [1, 5],
            3: [1, 6],
            4: [1, 7],
            5: [2, 7],
            6: [3, 7],
            7: [4, 7]
        }
        // 定义六个方向
        const directions = [
            {x: 0, y: -1}, // 上
            {x: 1, y: 0}, // 右上
            {x: 1, y: 1}, // 右下
            {x: 0, y: 1}, // 下
            {x: -1, y: 0}, // 左下
            {x: -1, y: -1} // 左上
        ];

        if (chess.side === 0) {
            directions.forEach(direction => {
                let x = position.x + direction.x;
                let y = position.y + direction.y;
                while (x >= 1 && x <= 7 && y >= yRange[x][0] && y <= yRange[x][1]) {
                    if (Object.values(this.chess.data.attacker).some(item => item.x === x && item.y === y) ||
                        Object.values(this.chess.data.defender).some(item => item.x === x && item.y === y)) {
                        break;
                    }
                    x += direction.x;
                    y += direction.y;
                }
                x -= direction.x;
                y -= direction.y;
                if (x !== position.x || y !== position.y) {
                    result.push({x: x, y: y});
                }
            });
        }

        if (chess.side === 1) {
            directions.forEach(direction => {
                let x = position.x + direction.x * 2;
                let y = position.y + direction.y * 2;
                if (x >= 1 && x <= 7 && y >= yRange[x][0] && y <= yRange[x][1]) {
                    if (!Object.values(this.chess.data.attacker).some(item => item.x === x && item.y === y) &&
                        !Object.values(this.chess.data.defender).some(item => item.x === x && item.y === y)) {
                        if (!(x === 4 && y === 4)) {
                            result.push({x: x, y: y});
                        }
                    }
                }
            });
        }

        return result;
    }
}

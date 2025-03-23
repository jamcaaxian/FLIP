import Chessboard from './class/Chessboard.js';
import Chess from './class/Chess.js';
import Player from './class/Player.js';
import UI from './class/UI.js';

const width = window.innerWidth;
const height = window.innerHeight;
const isLandscape = height / width > 1.5 ? 0 : 1;

const chessboard = new Chessboard('#FFBB11', '#FFAA66', '#FF8800', '#DDFF44', [width * (isLandscape ? 0.4 : 0.5), height * (isLandscape ? 0.5 : 0.4)], Math.min(width, height));
const chess = new Chess(chessboard);

let player = new Player(chess, 'attacker', 'pvp');
let ui = new UI(chessboard);

const loadRecord = window.loadRecord = record => window.player.loadRecord(record.length, 0, record);

function changeTeam(team, record, sync = null) {
    player.removeCanvas();
    if (sync !== 1 && room) {
        room.socket.send(JSON.stringify({ type: 'record', team, record }));
    }
    player = new Player(chess, team === 'attacker' ? 'defender' : 'attacker', 'pvp');
    player.record = record;
    ui.removeCanvas();
    ui = new UI(chessboard);

    return team === 'attacker' ? 'defender' : 'attacker';
}

window.player = player;
window.ui = ui;
window.changeTeam = changeTeam;

document.body.style.backgroundColor = chessboard.backgroundColor;

const chatBox = document.createElement('div');
chatBox.style.position = 'absolute';
if (window.innerHeight / window.innerWidth > 1.5) {
    chatBox.style.bottom = '0';
    chatBox.style.right = '0';
    chatBox.style.width = '100%';
    chatBox.style.height = '30%';
} else {
    chatBox.style.top = '0';
    chatBox.style.right = '0';
    chatBox.style.width = '20%';
    chatBox.style.height = '100%';
}
chatBox.style.display = 'flex';
chatBox.style.flexDirection = 'column';
chatBox.style.alignItems = 'center';
chatBox.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';

document.body.appendChild(chatBox);

const connectIdBox = document.createElement('div');
connectIdBox.style.textAlign = 'center';

const chatMessages = document.createElement('div');
chatMessages.style.flexGrow = '1';
chatMessages.style.marginTop = '10px';
chatMessages.style.overflowY = 'auto';
chatMessages.style.width = '90%';
chatMessages.style.backgroundColor = '#00000020';
chatMessages.style.borderRadius = '5px';

const sendBox = document.createElement('div');
sendBox.style.display = 'flex';
sendBox.style.width = '90%';
sendBox.style.margin = '10px';
sendBox.style.justifyContent = 'space-between';

const chatInput = document.createElement('input');
chatInput.style.width = '80%';
chatInput.style.padding = '5px';
chatInput.style.border = 'none';
chatInput.style.borderRadius = '5px 0 0 5px';
chatInput.style.backgroundColor = '#FFBB11BB';
chatInput.placeholder = '输入相同房间号连接';

const chatButton = document.createElement('button');
chatButton.style.width = '20%';
chatButton.style.padding = '5px';
chatButton.style.border = 'none';
chatButton.style.borderRadius = '0 5px 5px 0';
chatButton.style.backgroundColor = '#FFFFFFBB';
chatButton.textContent = '🔗';

sendBox.appendChild(chatInput);
sendBox.appendChild(chatButton);
chatBox.appendChild(connectIdBox);
chatBox.appendChild(chatMessages);
chatBox.appendChild(sendBox);

document.body.appendChild(chatBox);

// PieSocket WebSocket 配置
class Room {
    constructor(room) {
        const PIE_SOCKET_API_KEY = 'IWhDLn3MmgbO4Caoh1hNJt9s47amlhI6rvOjX2tS';
        const PIE_SOCKET_CHANNEL_ID = room || 'default';
        this.socket = new WebSocket(`wss://s14311.sgp1.piesocket.com/v3/${PIE_SOCKET_CHANNEL_ID}?api_key=${PIE_SOCKET_API_KEY}&notify_self=1`);
        this.socket.onopen = () => {
            displayMessage(['💻服务器', '已建立连接']);
            this.socket.send(JSON.stringify({ type: 'chat', message: [user, '已进入房间'] }));
            chatInput.placeholder = '';
            chatButton.textContent = '↩';
        };
        this.socket.onmessage = event => {
            const data = JSON.parse(event.data);
            if (data.type === 'record') {
                changeTeam(data.team, data.record, 1);
                loadRecord(data.record);
            } else if (data.type === 'chat') {
                displayMessage(data.message);
            }
        };
    }
}

const user = Math.random();
let room;

const send = () => {
    const message = chatInput.value;
    if (message) {
        if (!room) {
            room = new Room(message);
            chatInput.value = '';
        } else {
            room.socket.send(JSON.stringify({ type: 'chat', message: [user, message] }));
            chatInput.value = '';
        }
    }
};

chatButton.addEventListener('click', () => send());
chatInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        send();
    }
});

function displayMessage(data) {
    const sender = data[0] === user ? '🟡我' : (data[0] === '💻服务器' ? '💻服务器' : '👤对手');
    const message = data[1];
    const msg = document.createElement('p');
    msg.textContent = `${sender}: ${message}`;
    msg.style.backgroundColor = sender === '🟡我' ? '#FFBB1150' : (sender === '👤对手' ? '#388FFF50' : '#FFFFFF50');
    msg.style.padding = '5px';
    msg.style.margin = '5px';
    msg.style.borderRadius = '5px';
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

import Chessboard from './class/Chessboard.js';
import Chess from './class/Chess.js';
import Player from './class/Player.js';
import UI from './class/UI.js';

const width = window.innerWidth;
const height = window.innerHeight;

const chessboard = new Chessboard('#FFBB11', '#FFAA66', '#FF8800', '#DDFF44', [width / 2, height / 2], Math.min(width, height));
const chess = new Chess(chessboard);

let player = new Player(chess, 'attacker', 'pvp');
let ui = new UI(chessboard);

function changeTeam(team, record) {
    player.removeCanvas();
    player = new Player(chess, team === 'attacker'? 'defender' : 'attacker', 'pvp');
    player.record = record;
    ui.removeCanvas();
    ui = new UI(chessboard);

    return team === 'attacker'? 'defender' : 'attacker';
}

window.player = player;
window.ui = ui;
window.changeTeam = changeTeam;


document.body.style.backgroundColor = chessboard.backgroundColor;
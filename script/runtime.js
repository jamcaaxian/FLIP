import Chessboard from './class/Chessboard.js';
import Chess from './class/Chess.js';
import Player from './class/Player.js';
import Robot from './class/Robot.js';

const width = window.innerWidth;
const height = window.innerHeight;

const chessboard = new Chessboard('#FFBB11', '#FFAA66', '#FF8800', '#DDFF44', [width / 2, height / 2], Math.min(width, height));
const chess = new Chess(chessboard);
const urlParams = new URLSearchParams(window.location.search);
const player = new Player(chess, urlParams.get('team') || 'attacker');
const robot = new Robot(chess, player.team === 'attacker'? 'defender' : 'attacker');
window.player = player;
window.robot = robot;
if (player.team === 'defender') {
    robot.action();
}

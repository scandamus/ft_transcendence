'use strict';

import PageBase from './PageBase.js';
import { labels } from '../modules/labels.js';
import { webSocketManager } from "../modules/websocket.js";
import { router } from "../modules/router.js";
import { initToken } from '../modules/token.js';

export default class GamePlay extends PageBase {
    constructor(params) {
        super(params);
        GamePlay.instance = this;
        this.title = 'GamePlay';
        this.setTitle(this.title);
        this.generateBreadcrumb(this.title, this.breadcrumbLinks);
        this.player1 = 'player1'; // TODO fetch from backend?
        this.player2 = 'player2';
        this.score1 = 0;
        this.score2 = 0;
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.initGame.bind(this));
    }

    async renderHtml() {
        return `
           <div class="playBoardWrap">
                <p>Press space key to turn on the sound</p>
                <ul class="listPlayerActiveMatch">
                    <li class="listPlayerActiveMatch_item">${this.player1}</li>
                    <li class="listPlayerActiveMatch_item">${this.player2}</li>
                </ul>
                <canvas id="playBoard" width="650" height="450"></canvas>
            </div>
        `;
    }

    async initGame() {
        try {
            const gameMatchId = this.params['id'].substr(1);
            console.log("============ ", gameMatchId, " ============");
            const containerId = `pong/${gameMatchId}`;
            console.log(`URL = ${containerId}`);
            const pongSocket = await webSocketManager.openWebSocket(containerId);
            // ノードを取得
            const canvas = document.getElementById("playBoard");
            // 2dの描画コンテキストにアクセスできるように
            // キャンバスに描画するために使うツール
            const ctx = canvas.getContext("2d");

            // sound
            this.audioCtx = new window.AudioContext();
            const ballNode = this.audioCtx.createOscillator();
            const pannerNode = this.audioCtx.createStereoPanner();
            const paddleNode = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            ballNode.connect(pannerNode).connect(this.audioCtx.destination);
            ballNode.type = 'sine';
            paddleNode.connect(gainNode).connect(this.audioCtx.destination);
            paddleNode.type = 'sine';

            function drawBackground() {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            function drawLineDash() {
                ctx.beginPath();
                ctx.setLineDash([15, 15]);
                ctx.lineWidth = 15;
                ctx.strokeStyle = '#808080FF';
                ctx.moveTo(325, 0);
                ctx.lineTo(325, 450);
                ctx.stroke();
                ctx.closePath();
            }

            function drawScore(left_paddle, right_paddle) {
                ctx.font = '48px "Courier New"';
                ctx.textAlign = "center";
                ctx.fillStyle = '#808080FF';
                ctx.fillText(`${left_paddle.score}   ${right_paddle.score}`, canvas.width / 2, 50);
            }

            function drawBall(obj) {
                ctx.beginPath();
                ctx.rect(obj.x, obj.y, obj.size, obj.size)
                ctx.fillStyle = '#808080FF';
                ctx.fill();
                ctx.closePath();
            }

            function drawPaddle(obj) {
                ctx.beginPath();
                ctx.rect(obj.x, obj.y, obj.horizontal, obj.vertical);
                ctx.fillStyle = '#808080FF';
                ctx.fill();
                ctx.closePath();
            }

            const changeSound = (data) => {
                // ball.y: 周波数を上下 
                const freq = 440 * Math.pow(2, (data.ball.y / canvas.height) * -2 + 1);
                ballNode.frequency.value = freq;
                // ball.x: パンを左右 
                const pan = ((data.ball.x / canvas.width) * 2 - 1) * 1.125;
                const clamp = (x, min, max) => Math.min(Math.max(min, x), max);
                pannerNode.pan.value = clamp(pan, -1, +1);

                // paddle.y: 周波数を上下 
                const paddleFreq = 440 * Math.pow(2, (data.left_paddle.y / canvas.height) * -2 + 1); // TODO left or right
                paddleNode.frequency.value = paddleFreq;
                // currentTime: 周期的に強弱
                gainNode.gain.value = clamp(Math.sin(this.audioCtx.currentTime * 32) * 0.25, 0, 0.25);
            }

            const updateGameObjects = async (data) => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // 背景色
                drawBackground();
                // 中央の波線
                drawLineDash();
                // スコア
                drawScore(data.left_paddle, data.right_paddle);

                drawBall(data.ball);
                // 右
                drawPaddle(data.right_paddle);
                // 左
                drawPaddle(data.left_paddle);

                changeSound(data);

                if (!data.game_status) {
                    console.log("Game Over");
                    pongSocket.send(JSON.stringify({
                        action: 'end_game',
                        match_id: gameMatchId,
                    }));
                    document.removeEventListener("keydown", keyDownHandler, false);
                    document.removeEventListener("keyup", keyUpHandler, false);
                    webSocketManager.closeWebSocket(containerId);
                    window.history.pushState({}, null, "/dashboard");
                    await router(true);
                }
            }

            // 押されたとき
            document.addEventListener("keydown", keyDownHandler, false);
            // 離れたとき
            document.addEventListener("keyup", keyUpHandler, false);

            function keyDownHandler(e) {
                // send event to django websocket
                if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "w" || e.key === "s") {
                    sendKeyEvent(e.key, true);
                }
            }

            function keyUpHandler(e) {
                // send event to django websocket
                if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "w" || e.key === "s") {
                    sendKeyEvent(e.key, false);
                } else if (e.key == ' ') {
                    ballNode.start();
                    paddleNode.start();
                } else if (e.key == 'm') {
                    ballNode.stop();
                    paddleNode.stop();
                }
            }

            function sendKeyEvent(key, is_pressed) {
                let data = {
                    action: 'key_event',
                    key: key,
                    is_pressed: is_pressed,
                };
                webSocketManager.sendWebSocketMessage(containerId, data);
            }

            pongSocket.onmessage = function (e) {
                try {
                    const data = JSON.parse(e.data);
                    // document.querySelector('#pong-log').value += (data.message + '\n');
                    console.log('received_data -> ', data);
                    console.log('RIGHT_PADDLE: ', data.right_paddle.score, '  LEFT_PADDLE: ', data.left_paddle.score);
                    updateGameObjects(data);
                } catch (error) {
                    console.error('Error parsing message data:', error);
                }
            }
        } catch (error) {
            console.error('Error initializing game', error);
        }
    }

    destroy() {
        super.destroy();
        this.audioCtx.close();
    }
}

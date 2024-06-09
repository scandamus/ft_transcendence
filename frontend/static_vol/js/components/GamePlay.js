'use strict';

import PageBase from './PageBase.js';
import { webSocketManager } from "../modules/websocket.js";

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('GamePlay');
        this.player1 = 'player1人目'; // TODO json
        this.player2 = 'player2人目';
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.initGame.bind(this));
    }

    async renderHtml() {
        return `
           <div class="playBoardWrap">
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
            const containerId = `pong/${gameMatchId}`;
            console.log(`URL = ${containerId}`);
            const pongSocket = await webSocketManager.openWebSocket(containerId);
            // ノードを取得
            const canvas = document.getElementById("playBoard");
            // 2dの描画コンテキストにアクセスできるように
            // キャンバスに描画するために使うツール
            const ctx = canvas.getContext("2d");

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

            function updateGameObjects(data) {
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

                if (!game_status) {
                    console.log("Game Over");
                    //alert('GAME OVER');
                    // ここでゲームをリセットする処理を追加するか、ページをリロードする
                    //document.location.reload();
                    // TODO 勝敗を記録など
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
                }
            }

            function sendKeyEvent(key, is_pressed) {
                let data = {
                    message: 'key_event',
                    key: key,
                    is_pressed: is_pressed,
                };
                pongSocket.send(JSON.stringify(data));
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
}

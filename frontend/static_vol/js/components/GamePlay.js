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
                <canvas id="playBoard" width="600" height="450"></canvas>
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

            function drawBall(obj) {
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#0095DD';
                ctx.fill();
                ctx.closePath();
            }
            function drawPaddle(obj) {
                ctx.beginPath();
                ctx.rect(obj.x, obj.y, obj.width, obj.height);
                ctx.fillStyle = '#0095DD';
                ctx.fill();
                ctx.closePath();
            }

            function updateGameObjects(ball, paddle1, paddle2, game_status) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                drawBall(ball);
                // 右
                drawPaddle(paddle1);
                // 左
                drawPaddle(paddle2);

                if (!game_status) {
                    console.log("Game Over");
                    //alert('GAME OVER');
                    // ここでゲームをリセットする処理を追加するか、ページをリロードする
                    //document.location.reload();
                    // TODO 勝敗を記録など
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
            function keyDownHandler (e) {
                // send event to django websocket
                if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "w" || e.key === "s") {
                    sendKeyEvent(e.key, true);
                }
            }
            document.addEventListener("keydown", keyDownHandler, false);
            function keyUpHandler (e) {
                // send event to django websocket
                if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "w" || e.key === "s") {
                    sendKeyEvent(e.key, false);
                }
            }
            document.addEventListener("keyup", keyUpHandler, false);

            pongSocket.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    //  document.querySelector('#pong-log').value += (data.message + '\n');
                    console.log('received_data -> ', data);
                    //console.log("updateGameObjects() called");
                    updateGameObjects(data.ball, data.paddle1, data.paddle2, data.game_status);
                } catch (error) {
                    console.error('Error parsing message data:', error);
                }
            };
        } catch (error) {
            console.error('Error initializing game', error);
        }
    }
}

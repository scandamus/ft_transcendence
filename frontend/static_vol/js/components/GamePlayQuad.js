'use strict';

import PageBase from './PageBase.js';
import { labels } from '../modules/labels.js';
import { webSocketManager } from '../modules/websocket.js';
import { router } from '../modules/router.js';
import { initToken } from '../modules/token.js';

export default class GamePlayQuad extends PageBase {
    constructor(params) {
        super(params);
        GamePlayQuad.instance = this;
        this.title = 'GamePlayQuad';
        this.setTitle(this.title);
        this.generateBreadcrumb(this.title, this.breadcrumbLinks);
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.initGame.bind(this));
    }

    async renderHtml() {
        return `
           <div class='playBoardWrap'>
                <ul class='listPlayerActiveMatch'>
                </ul>
                <canvas id='playBoard' width='650' height='650'></canvas>
            </div>
        `;
    }

    async initGame() {
        try {
            const gameMatchId = this.params['id'].substr(1);
            console.log('============ ', gameMatchId, ' ============');
            const containerId = `pong4/${gameMatchId}`;
            console.log(`URL = ${containerId}`);
            const pongSocket = await webSocketManager.openWebSocket(containerId);
            // ノードを取得
            const canvas = document.getElementById('playBoard');
            // 2dの描画コンテキストにアクセスできるように
            // キャンバスに描画するために使うツール
            const ctx = canvas.getContext('2d');

            function drawBackground() {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            function drawCornerLine(line_width, size) {
                ctx.lineWidth = line_width;
                ctx.lineJoin = 'miter';
                ctx.lineCap = 'butt'
                ctx.strokeStyle = 'red';
                const offset = line_width / 2;

                // 左上
                ctx.beginPath();
                ctx.moveTo(size, offset);
                ctx.lineTo(offset, offset);
                ctx.lineTo(offset, size);
                ctx.stroke();

                // 右上
                ctx.beginPath();
                ctx.moveTo(canvas.width - size, offset);
                ctx.lineTo(canvas.width - offset, offset);
                ctx.lineTo(canvas.width - offset, size);
                ctx.stroke();

                // 左下
                ctx.beginPath();
                ctx.moveTo(size, canvas.height - offset);
                ctx.lineTo(offset, canvas.height - offset);
                ctx.lineTo(offset, canvas.height - size);
                ctx.stroke();

                // 右下
                ctx.beginPath();
                ctx.moveTo(canvas.width - size, canvas.height - offset);
                ctx.lineTo(canvas.width - offset, canvas.height - offset);
                ctx.lineTo(canvas.width - offset, canvas.height - size);
                ctx.stroke();
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

            function drawScores(data) {
                const sideOffset = 30; // 側面からのオフセット
                const scorePadding = 5; // 得点間のパディング
                const scoreSize = 10; // 得点の正方形のサイズ

                for (let i = 0; i < data.left_paddle.score; i++) {
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(sideOffset, sideOffset + i * (scoreSize + scorePadding), scoreSize, scoreSize);
                }

                for (let i = 0; i < data.upper_paddle.score; i++) {
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(canvas.width - sideOffset - (i + 1) *  scoreSize - i * scorePadding, sideOffset, scoreSize, scoreSize);
                }

                for (let i = 0; i < data.right_paddle.score; i++) {
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(canvas.width - sideOffset - scoreSize, canvas.height - sideOffset - (i + 1) *  scoreSize - i * scorePadding, scoreSize, scoreSize);
                }

                for (let i = 0; i < data.lower_paddle.score; i++) {
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(sideOffset + i * (scoreSize + scorePadding), canvas.height - scoreSize - sideOffset, scoreSize, scoreSize);
                }
            }

            const updateGameObjects = async (data) => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // 背景色
                drawBackground();
                // 四隅の枠を生成
                drawCornerLine(15, 15*8);
                // ball
                drawBall(data.ball);
                // 右
                drawPaddle(data.right_paddle);
                // 左
                drawPaddle(data.left_paddle);
                // 上
                drawPaddle(data.upper_paddle);
                //下
                drawPaddle(data.lower_paddle);

                // 残機の表示
                drawScores(data);

                if (!data.game_status) {
                    console.log('Game Over');
                    //alert('GAME OVER');
                    // ここでゲームをリセットする処理を追加するか、ページをリロードする
                    //document.location.reload();
                    // TODO 勝敗を記録など
                    pongSocket.send(JSON.stringify({
                        action: 'end_game',
                        match_id: gameMatchId,
                    }));
                    document.removeEventListener('keydown', keyDownHandler, false);
                    document.removeEventListener('keyup', keyUpHandler, false);
                    webSocketManager.closeWebSocket(containerId);
                    window.history.pushState({}, null, '/dashboard');
                    await router(true);
                }
            }

            // 押されたとき
            document.addEventListener('keydown', keyDownHandler, false);
            // 離れたとき
            document.addEventListener('keyup', keyUpHandler, false);

            function keyDownHandler(e) {
                // send event to django websocket
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'w' || e.key === 's'
                    || e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'd') {
                    sendKeyEvent(e.key, true);
                }
            }

            function keyUpHandler(e) {
                // send event to django websocket
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'w' || e.key === 's'
                    || e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'd') {
                    sendKeyEvent(e.key, false);
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

            function playSound(sound_type) {
                if (!sound_type) {
                    console.info('sound_type is undefined');
                    return;
                } else {
                    console.log('sound_type: ', sound_type)
                }
                let sound;
                if (sound_type === 'paddle_collision') {
                    sound = new Audio('../../sounds/8-bit-game-4-188106.mp3');
                } else if (sound_type === 'wall_collision') {
                    sound = new Audio('../../sounds/8-bit-game-5-188107.mp3');
                } else if (sound_type === 'scored' || sound_type === 'game_over') {
                    sound = new Audio('../../sounds/8-bit-game-6-188105.mp3');
                }
                if (sound) {
                    sound.play();
                }
            }

            pongSocket.onmessage = function (e) {
                try {
                    const data = JSON.parse(e.data);
                    // document.querySelector('#pong-log').value += (data.message + '\n');
                    console.log('received_data -> ', data);
                    // console.log('RIGHT_PADDLE: ', data.right_paddle.score, '  LEFT_PADDLE: ', data.left_paddle.score, 'UPPER_PADDLE: ', data.upper_paddle.score, '  LOWER_PADDLE: ', data.lower_paddle.score);
                    updateGameObjects(data);
                    playSound(data.sound_type)
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
    }
}

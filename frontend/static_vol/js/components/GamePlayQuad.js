'use strict';

import PageBase from './PageBase.js';
import { labels } from '../modules/labels.js';
import { webSocketManager } from '../modules/websocket.js';
import { router } from '../modules/router.js';
import { initToken } from '../modules/token.js';

export default class GamePlayQuad extends PageBase {
    static instance = null;

    constructor(params) {
        if (GamePlayQuad.instance) {
            return GamePlayQuad.instance;
        }
        super(params);
        GamePlayQuad.instance = this;
        this.title = 'GamePlayQuad';
        this.setTitle(this.title);
        this.generateBreadcrumb(this.title, this.breadcrumbLinks);
        this.containerId = '';
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.initGame.bind(this));
        // sound
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // 音量の変更のため
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.sounds = {};
    }

    async renderHtml() {
        const listPlayer = JSON.parse(sessionStorage.getItem('all_usernames'));
        return `
           <div class='playBoardWrap playBoardWrap-quad'>
                <ul class='listPlayerActiveMatch listPlayerActiveMatch-quad-first-half'>
                    <li class="listPlayerActiveMatch_item listPlayerActiveMatch_item-player1"><img src="${listPlayer[0].avatar || '/images/avatar_default.png'}" alt="" width="50" height="50"><span>${listPlayer[0].username}</span></li>
                    <li class="listPlayerActiveMatch_item listPlayerActiveMatch_item-player3"><img src="${listPlayer[2].avatar || '/images/avatar_default.png'}" alt="" width="50" height="50"><span>${listPlayer[2].username}</span></li>
                </ul>
                <ul class='listPlayerActiveMatch listPlayerActiveMatch-quad-second-half'>
                    <li class="listPlayerActiveMatch_item listPlayerActiveMatch_item-player2"><img src="${listPlayer[1].avatar || '/images/avatar_default.png'}" alt="" width="50" height="50"><span>${listPlayer[1].username}</span></li>
                    <li class="listPlayerActiveMatch_item listPlayerActiveMatch_item-player4"><img src="${listPlayer[3].avatar || '/images/avatar_default.png'}" alt="" width="50" height="50"><span>${listPlayer[3].username}</span></li>
                </ul>
                <canvas id='playBoard' width='650' height='650'></canvas>
                <ol class="listButtonControl listButtonControl-quad listButtonControl-updown listButtonControl-player2">
                    <li class="listButtonControl_btn listButtonControl_btn-top"><button type="button">↑</button></li>
                    <li class="listButtonControl_btn listButtonControl_btn-bottom"><button type="button">↓</button></li>
                </ol>
                <ol class="listButtonControl listButtonControl-quad listButtonControl-leftright listButtonControl-player4">
                    <li class="listButtonControl_btn listButtonControl_btn-left"><button type="button">←</button></li>
                    <li class="listButtonControl_btn listButtonControl_btn-right"><button type="button">→</button></li>
                </ol>
            </div>
        `;
    }

    async loadSounds() {
        const soundFiles = {
            paddle_collision: '../../sounds/pong-paddle.mp3',
            wall_collision: '../../sounds/8-bit-game-5-188107.mp3',
            scored: '../../sounds/8-bit-game-6-188105.mp3',
            game_over: '../../sounds/game-fx-9-40197.mp3',
        };

        for (const [key, url] of Object.entries(soundFiles)) {
            const response = await fetch(url);
            // バイナリデータを取り出す
            const arrayBuffer = await response.arrayBuffer();
            // 取り出した音声データをでコード
            this.sounds[key] = await this.audioContext.decodeAudioData(arrayBuffer);
        }
    }

    playSound = (soundType) => {
        if (!soundType || !this.sounds[soundType]) {
            console.info('sound_type is undefined or sound is not preloaded');
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = this.sounds[soundType];
        // 出力先に接続する
        source.connect(this.gainNode);
        this.gainNode.gain.value = 0.1;
        // 遅延0でで再生
        source.start(0);
    }

    sendKeyEvent = (key, is_pressed) => {
        let data = {
            action: 'key_event',
            key: key,
            is_pressed: is_pressed,
        };
        webSocketManager.sendWebSocketMessage(this.containerId, data);
    }

    keyDownHandler = (e) => {
        // send event to django websocket
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'w' || e.key === 's'
            || e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'd') {
            this.sendKeyEvent(e.key, true);
        }
    }

    keyUpHandler = (e) => {
        // send event to django websocket
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'w' || e.key === 's'
            || e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'd') {
            this.sendKeyEvent(e.key, false);
        }
    }

    async initGame() {
        try {
            const gameMatchId = this.params['id'].substr(1);
            console.log('============ ', gameMatchId, ' ============');
            this.containerId = `pong4/${gameMatchId}`;
            console.log(`URL = ${this.containerId}`);
            const pongSocket = await webSocketManager.openWebSocket(this.containerId);
            // ノードを取得
            const canvas = document.getElementById('playBoard');
            // 2dの描画コンテキストにアクセスできるように
            // キャンバスに描画するために使うツール
            const ctx = canvas.getContext('2d');
            await this.loadSounds();

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
                    webSocketManager.closeWebSocket(this.containerId);
                    this.containerId = '';
                    window.history.pushState({}, null, '/dashboard');
                    await router(true);
                }
            }

            // 押されたとき
            document.addEventListener('keydown', this.keyDownHandler, false);
            // 離れたとき
            document.addEventListener('keyup', this.keyUpHandler, false);

            pongSocket.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    // document.querySelector('#pong-log').value += (data.message + '\n');
                    console.log('received_data -> ', data);
                    // console.log('RIGHT_PADDLE: ', data.right_paddle.score, '  LEFT_PADDLE: ', data.left_paddle.score, 'UPPER_PADDLE: ', data.upper_paddle.score, '  LOWER_PADDLE: ', data.lower_paddle.score);
                    updateGameObjects(data);
                    this.playSound(data.sound_type);
                } catch (error) {
                    console.error('Error parsing message data:', error);
                }
            }
        } catch (error) {
            console.error('Error initializing game', error);
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.keyDownHandler, false);
        document.removeEventListener('keyup', this.keyUpHandler, false);
        sessionStorage.removeItem('all_usernames');
        GamePlayQuad.instance = null;
        super.destroy();
    }
}

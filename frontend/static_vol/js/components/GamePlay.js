'use strict';

import PageBase from './PageBase.js';

import { webSocketManager } from "../modules/websocket.js";
import { router } from "../modules/router.js";
import { isTouchDevice, resetControlSize } from "../modules/judgeTouchDevice.js";
import { buttonControlManager } from "../modules/ButtonControlManager.js";

export default class GamePlay extends PageBase {
    static instance = null;

    constructor(params) {
        if (GamePlay.instance) {
            return GamePlay.instance;
        }
        super(params);
        GamePlay.instance = this;
        this.title = 'GamePlay';
        this.setTitle(this.title);
        this.generateBreadcrumb(this.title, this.breadcrumbLinks);
        this.containerId = '';
        this.player_name = sessionStorage.getItem('player_name');
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
        let resultHtml = `
            <div class="playBoardWrap playBoardWrap-dual">
                <ul class="listPlayerActiveMatch listPlayerActiveMatch-dual">
                    <li class="listPlayerActiveMatch_item"><img src="${listPlayer[0].avatar || '/images/avatar_default.png'}" alt="" width="50" height="50"><span>${listPlayer[0].username}</span></li>
                    <li class="listPlayerActiveMatch_item"><img src="${listPlayer[1].avatar || '/images/avatar_default.png'}" alt="" width="50" height="50"><span>${listPlayer[1].username}</span></li>
                </ul>
                <canvas id="playBoard" width="650" height="450"></canvas>`;
        if (isTouchDevice()) {
            resultHtml += `
                <ol class="listButtonControl listButtonControl-dual listButtonControl-updown listButtonControl-${this.player_name}">
                    <li class="listButtonControl_btn listButtonControl_btn-top"><button type="button">↑</button></li>
                    <li class="listButtonControl_btn listButtonControl_btn-bottom"><button type="button">↓</button></li>
                </ol>`;
        }
        resultHtml += `</div>`;
        return resultHtml;
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
        if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "w" || e.key === "s") {
            this.sendKeyEvent(e.key, true);
        }
    }

    keyUpHandler = (e) => {
        // send event to django websocket
        if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "w" || e.key === "s") {
            this.sendKeyEvent(e.key, false);
        }
    }

    async initGame() {
        try {
            const gameMatchId = this.params['id'].substr(1);
            console.log("============ ", gameMatchId, " ============");
            this.containerId = `pong/${gameMatchId}`;
            console.log(`URL = ${this.containerId}`);
            const pongSocket = await webSocketManager.openWebSocket(this.containerId);
            // ノードを取得
            const canvas = document.getElementById("playBoard");

            if (isTouchDevice()) {
                const elControl = canvas.closest('div').querySelector('.listButtonControl');
                resetControlSize(canvas, elControl);
                buttonControlManager.listenButtonControl(elControl, this);
            }
            // 2dの描画コンテキストにアクセスできるように
            // キャンバスに描画するために使うツール
            const ctx = canvas.getContext("2d");
            // サウンドを読み込んでおく
            await this.loadSounds();

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

                if (!data.game_status) {
                    console.log("Game Over");
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
                    window.history.pushState({}, null, "/dashboard");
                    await router(true);
                }
            }

            // 押されたとき
            document.addEventListener("keydown", this.keyDownHandler, false);
            // 離れたとき
            document.addEventListener("keyup", this.keyUpHandler, false);

            pongSocket.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    // document.querySelector('#pong-log').value += (data.message + '\n');
                    console.log('received_data -> ', data);
                    console.log('RIGHT_PADDLE: ', data.right_paddle.score, '  LEFT_PADDLE: ', data.left_paddle.score);
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
        document.removeEventListener("keydown", this.keyDownHandler, false);
        document.removeEventListener("keyup", this.keyUpHandler, false);
        sessionStorage.removeItem('all_usernames');
        sessionStorage.removeItem('player_name');
        GamePlay.instance = null;
        super.destroy();
    }
}

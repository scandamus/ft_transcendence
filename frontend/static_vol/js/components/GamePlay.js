'use strict';

import PageBase from './PageBase.js';

export default class extends PageBase {
    constructor(params) {
        super(params);

        this.title = 'GamePlay';
        this.player1 = 'player1人目'; // TODO json
        this.player2 = 'player2人目';

        this.setTitle(this.title);
        this.generateBreadcrumb(this.title, this.breadcrumbLinks);

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

    initGame() {
        // ノードを取得
        const canvas = document.getElementById("playBoard");
        // 2dの描画コンテキストにアクセスできるように
        // キャンバスに描画するために使うツール
        const ctx = canvas.getContext("2d");
        let state = 1;
        // TODO server side にするならこの辺を全部移植
        let ball = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            dx: 1,
            dy: 1,
            Radius: 10,
        };
        //右
        let paddle1 = {
            x: (canvas.width - 10),
            y: (canvas.height - 75) / 2,
            Height: 75,
            Width: 10,
        };
        // 左
        let paddle2 = {
            x: 0,
            y: (canvas.height - 75) / 2,
            Height: 75,
            Width: 10,
        };

        function drawBall(obj) {
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.Radius, 0, Math.PI * 2);
            ctx.fillStyle = '#0095DD';
            ctx.fill();
            ctx.closePath();
        }

        function drawPaddle(obj) {
            ctx.beginPath();
            ctx.rect(obj.x, obj.y, obj.Width, obj.Height);
            ctx.fillStyle = '#0095DD';
            ctx.fill();
            ctx.closePath();
        }

        function collisionDetection() {
            // この関数をpaddleに当たったかを判定する関数に修正する
            // canvasの左半分か右半分かで処理を分岐する
            // 左
            if (ball.x - ball.Radius < paddle2.Width) {
                // paddle2の幅の範囲内にballがあるかを確認する
                if (ball.y > paddle2.y && ball.y < paddle2.y + paddle2.Height) {
                    ball.dx = -ball.dx;
                } else {
                    state = 0;
                }
            }
            // 右
            else if (ball.x + ball.Radius > canvas.width - paddle1.Width) {
                if (ball.y > paddle1.y && ball.y < paddle1.y + paddle1.Height) {
                    ball.dx = -ball.dx;
                } else {
                    state = 0;
                }
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBall(ball);
            drawPaddle(paddle1);
            drawPaddle(paddle2);
            if (state === 1) {
                collisionDetection();
            }
            if (ball.y + ball.dy > canvas.height - ball.Radius ||
                ball.y + ball.dy < ball.Radius) {
                ball.dy = -ball.dy;
            }
            if (paddle1UpPressed) {
                paddle1.y -= 7;
                if (paddle1.y < 0) {
                    paddle1.y = 0;
                }
            }
            if (paddle1DownPressed) {
                paddle1.y += 7;
                if (paddle1.y + paddle1.Height > canvas.height) {
                    paddle1.y = canvas.height - paddle1.Height;
                }
            }
            if (paddle2UpPressed) {
                paddle2.y -= 7;
                if (paddle2.y < 0) {
                    paddle2.y = 0;
                }
            }
            if (paddle2DownPressed) {
                paddle2.y += 7;
                if (paddle2.y + paddle2.Height > canvas.height) {
                    paddle2.y = canvas.height - paddle2.Height;
                }
            }
            if (ball.x < ball.Radius || ball.x > canvas.width - ball.Radius) {
                alert('GAME OVER');
                document.location.reload();
                clearInterval(interval);
            }
            ball.x += ball.dx;
            ball.y += ball.dy;
        }

        // 押されたとき
        document.addEventListener("keydown", keyDownHandler, false);
        // 離れたとき
        document.addEventListener("keyup", keyUpHandler, false);
        // 右
        let paddle1UpPressed = false;
        let paddle1DownPressed = false;
        // 左
        let paddle2UpPressed = false;
        let paddle2DownPressed = false;

        function keyDownHandler(e) {
            if (e.key === "ArrowUp") {
                paddle1UpPressed = true;
            } else if (e.key === "ArrowDown") {
                paddle1DownPressed = true;
            } else if (e.key === "w") {
                paddle2UpPressed = true;
            } else if (e.key === "s") {
                paddle2DownPressed = true;
            }
        }

        function keyUpHandler(e) {
            if (e.key === "ArrowUp") {
                paddle1UpPressed = false;
            } else if (e.key === "ArrowDown") {
                paddle1DownPressed = false;
            } else if (e.key === "w") {
                paddle2UpPressed = false;
            } else if (e.key === "s") {
                paddle2DownPressed = false;
            }
        }

        let interval = setInterval(draw, 10);
    }
}

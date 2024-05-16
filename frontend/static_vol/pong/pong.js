// ノードを取得
//const roomName = JSON.parse(document.getElementById('room-name').textContent);
const roomName = 'test';

const pongSocket = new WebSocket(
    'wss://'
    + window.location.host
    + '/ws/pong/'
    + roomName
    + '/'
);

pongSocket.onopen = function(e) {
    console.log('WebSocket is now open:', pongSocket.readyState);
    sendSocketOpen();
};

pongSocket.onclose = function(e) {
    // 1000は正常終了
    if (e.code === 1000) {
        console.log('WebSocket closed normally.');
    } else {
        console.error('pong socket closed unexpectedly', 'Reason:', e.reason, 'Code:', e.code);
    }
};

// document.querySelector('#pong-message-input').focus();
// document.querySelector('#pong-message-input').onkeyup = function(e) {
//     if (e.key === 'Enter') {  // enter, return
//         document.querySelector('#pong-message-submit').click();
//     }
// };
const canvas = document.getElementById("pongcanvas");
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
    ctx.rect(obj.x, obj.y, obj.width, obj.height);
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

    if (!data.game_status) {
        console.log("Game Over");
        alert('GAME OVER');
        // ここでゲームをリセットする処理を追加するか、ページをリロードする
        // document.location.reload();
    }
}

// 押されたとき
document.addEventListener("keydown", keyDownHandler, false);
// 離れたとき
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler (e) {
    // send event to django websocket
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "w" || e.key === "s") {
        sendKeyEvent(e.key, true);
    }
}
function keyUpHandler (e) {
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

function sendSocketOpen() {
    let data = {
        message: 'socket_status',
        status: true,
    }
    pongSocket.send(JSON.stringify(data));
}

pongSocket.onmessage = function(e) {
    try {
        const data = JSON.parse(e.data);
        // document.querySelector('#pong-log').value += (data.message + '\n');
        console.log('received_data -> ', data);
        console.log('RIGHT_PADDLE: ', data.right_paddle.score, '  LEFT_PADDLE: ', data.left_paddle.score);
        updateGameObjects(data);
    } catch (error) {
        console.error('Error parsing message data:', error);
    }
};
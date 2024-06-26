// ノードを取得
const roomName = JSON.parse(document.getElementById('room-name').textContent);

const pongSocket = new WebSocket(
    'ws://'
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
    console.error('pong socket closed unexpectedly', e.reason, 'Code:', e.code);
};

document.querySelector('#pong-message-input').focus();
document.querySelector('#pong-message-input').onkeyup = function(e) {
    if (e.key === 'Enter') {  // enter, return
        document.querySelector('#pong-message-submit').click();
    }
};
const canvas = document.getElementById("pongcanvas");
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
        alert('GAME OVER');
        // ここでゲームをリセットする処理を追加するか、ページをリロードする
        document.location.reload();
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
        document.querySelector('#pong-log').value += (data.message + '\n');
        console.log('received_data -> ', data);
        console.log("updateGameObjects() called");
        updateGameObjects(data.ball, data.paddle1, data.paddle2, data.game_status);
    } catch (error) {
        console.error('Error parsing message data:', error);
    }
};

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

function drawBall(obj) {
    ctx.beginPath();
    ctx.rect(obj.x, obj.y, obj.size, obj.size)
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

function updateGameObjects(ball, right_paddle, left_paddle, game_status) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBall(ball);
    // 右
    drawPaddle(right_paddle);
    // 左
    drawPaddle(left_paddle);

    if (!game_status) {
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
        updateGameObjects(data.ball, data.right_paddle, data.left_paddle, data.game_status);
    } catch (error) {
        console.error('Error parsing message data:', error);
    }
};

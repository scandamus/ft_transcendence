// ノードを取得
//const roomName = JSON.parse(document.getElementById('room-name').textContent);
// const roomName = 'multitest';

const pongSocket = new WebSocket(
    'wss://'
    + window.location.host
    + '/ws/multipong/'
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
const canvas = document.getElementById("multipongcanvas");
// 2dの描画コンテキストにアクセスできるように
// キャンバスに描画するために使うツール
const ctx = canvas.getContext("2d");

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
    // 四隅の枠を生成
    drawCornerLine(15, 15*8);
    // スコア
    // drawScore(data.left_paddle, data.right_paddle);
    //
    drawBall(data.ball);
    // // 右
    drawPaddle(data.right_paddle);
    // // 左
    drawPaddle(data.left_paddle);
    // 上
    drawPaddle(data.upper_paddle);
    //下
    drawPaddle(data.lower_paddle);

    if (!data.game_status) {
        console.log("Game Over");
        // alert('GAME OVER');
        console.log('GAME OVER');
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
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "w" || e.key === "s" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "a" || e.key === "d") {
        sendKeyEvent(e.key, true);
    }
}
function keyUpHandler (e) {
    // send event to django websocket
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "w" || e.key === "s" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "a" || e.key === "d") {
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
        // console.log('RIGHT_PADDLE: ', data.right_paddle.score, '  LEFT_PADDLE: ', data.left_paddle.score, 'UPPER_PADDLE: ', data.upper_paddle.score, '  LOWER_PADDLE: ', data.lower_paddle.score);
        updateGameObjects(data);
    } catch (error) {
        console.error('Error parsing message data:', error);
    }
};

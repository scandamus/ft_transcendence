let socket = null;

export function openWebSocket() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        console.error('Access token is missing');
        return;
    }

    //socket = new WebSocket(`ws://localhost:8001/ws/some_path/?token=${accessToken}`);
    socket = new WebSocket(
        'wss://'
        + window.location.host
        + '/ws/lounge/'
    );

    socket.onopen = () => {
        console.log('WebSocket is open now.');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        // Handle incoming messages
    };

    socket.onclose = (event) => {
        console.log('WebSocket is closed now.');
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

export function closeWebSocket() {
    if (socket) {
        socket.close();
        socket = null;
        console.log('WebSocket has been closed.');
    }
}

export function sendWebSocketMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.error('WebSocket is not open.');
    }
}

export function getWebSocket() {
    if (!socket) {
        openWebSocket();
    }
    return socket;
}
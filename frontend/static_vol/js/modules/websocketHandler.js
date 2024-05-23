export const pongHandler = (event, containerId) => {
    let data;
    try {
        data = JSON.parse(event.data);
    } catch {
        console.error(`Error parsing data from ${containerId}: `, error);
    }

    if (data.type === 'gameSession') {
        loadGameContent(data.jwt, containerId);
    }
}

const loadGameContent = (jwt, containerId) => {
    console.log(`Loading ${containerId} content with JWT: `, jwt);
}
let ws;
let token;

function connectWebSocket() {
    ws = new WebSocket(`ws://${window.location.host}`);
    
    ws.onopen = () => {
        updateStatus('Connected to WebSocket');
        if (token) {
            authenticateWebSocket();
        }
    };

    ws.onclose = () => {
        updateStatus('Disconnected from WebSocket');
        setTimeout(connectWebSocket, 3000);
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'auth') {
            updateStatus(`Authentication ${data.status}`);
        }
        addMessage(JSON.stringify(data, null, 2));
    };
}

function authenticateWebSocket() {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'auth', token }));
    }
}

async function register(event) {
    event.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        addMessage('Register response: ' + JSON.stringify(data, null, 2));
    } catch (error) {
        addMessage('Register error: ' + error.message);
    }
    return false;
}

async function login(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.token) {
            token = data.token;
            authenticateWebSocket();
        }
        addMessage('Login response: ' + JSON.stringify(data, null, 2));
    } catch (error) {
        addMessage('Login error: ' + error.message);
    }
    return false;
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

function addMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('pre');
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Connect when page loads
connectWebSocket();
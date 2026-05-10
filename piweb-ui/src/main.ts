import { Terminal } from '@xterm/xterm';

const term = new Terminal({
    cursorBlink: true,
    theme: {
        background: '#000000'
    }
});

term.open(document.getElementById('terminal')!);

const socket = new WebSocket(`ws://${window.location.hostname}:300/`);

// When we receive data from the server, write it to the terminal
socket.onmessage = (event) => {
    term.write(event.data);
};

// When we type in the terminal, send it to the server
term.onData((data) => {
    socket.send(data);
});

socket.onopen = () => {
    console.log('Connected to WebSocket server');
};

socket.onclose = () => {
    term.write('\r\n[Connection Closed]\r\n');
};

socket.onerror = (error) => {
    term.write('\r\n[WebSocket Error]\r\n');
    console.error('WebSocket Error:', error);
};

// Handle window resize
window.addEventListener('resize', () => {
    // In a real implementation, we would notify the backend about the new size
    // Since we are using child_process.spawn instead of node-pty, 
    // we don't have a real TTY to resize.
});

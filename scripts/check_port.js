
const net = require('net');

function checkConnection(port, host) {
    const client = new net.Socket();
    client.connect(port, host, function() {
        console.log('Connected');
        client.destroy();
        process.exit(0);
    });

    client.on('error', function(err) {
        console.log('Connection refused/Error. Retrying...');
        client.destroy();
        // Continue but exit with error code if we wanted, but here we just log
    });
}

// Check repeatedly
let attempts = 0;
const interval = setInterval(() => {
    attempts++;
    console.log(`Attempt ${attempts}...`);
    checkConnection(3030, 'localhost');
    if (attempts > 10) {
        console.log("Given up.");
        clearInterval(interval);
        process.exit(1);
    }
}, 2000);

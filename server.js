const https = require('https');
const fs = require('fs');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
    key: fs.readFileSync(path.join(process.cwd(), 'key.pem')),
    cert: fs.readFileSync(path.join(process.cwd(), 'cert.pem'))
};

app.prepare().then(() => {
    https.createServer(httpsOptions, (req, res) => {
        handle(req, res);
    }).listen(3000, 'localhost', () => {
        console.log('Entra');
    });
});
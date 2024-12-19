const https = require('https'); // Módulo para crear servidores HTTPS en Node.js.
const fs = require('fs'); // Módulo para trabajar con el sistema de archivos.
const next = require('next'); // Framework Next.js para aplicaciones React.
const path = require('path');  // Módulo para manejar rutas de archivos y directorios.

// Verificar si la aplicación está en modo desarrollo o producción.
const dev = process.env.NODE_ENV !== 'production';
console.log(`Aplicación iniciada en modo ${dev ? 'desarrollo' : 'producción'}`);

const app = next({ dev }); // Inicializar la aplicación Next.js.
const handle = app.getRequestHandler(); // Manejador de solicitudes de Next.js.

// Obtiene los certificados para el servidor HTTPS.
const httpsOptions = {
    key: fs.readFileSync(path.join(process.cwd(), 'key.pem')),
    cert: fs.readFileSync(path.join(process.cwd(), 'cert.pem'))
};

// Prepara la aplicación Next.js.
app.prepare().then(() => {
    https.createServer(httpsOptions, (req, res) => {
        handle(req, res);
    }).listen(3000, 'localhost', () => {
        console.log("Funciona la web con HTTPS"); // Mensaje de éxito.
    });
});
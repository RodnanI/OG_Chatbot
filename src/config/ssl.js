const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// SSL Konfiguration
const sslConfig = {
    // SSL Zertifikate einlesen
    getCertificates: () => {
        try {
            return {
                cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.crt')),
                ca: fs.readFileSync(path.join(__dirname, '../ssl/ca.crt')),
                key: fs.readFileSync(path.join(__dirname, '../ssl/private.key'))
            };
        } catch (error) {
            console.error('Fehler beim Lesen der SSL-Zertifikate:', error);
            throw error;
        }
    },

    // HTTPS Server erstellen
    createHttpsServer: (app, hostname = 'localhost', port = 443) => {
        const certificates = sslConfig.getCertificates();

        const httpsServer = https.createServer(certificates, app);

        httpsServer.listen(port, hostname, () => {
            console.log(`HTTPS Server läuft auf https://${hostname}:${port}`);
        });

        return httpsServer;
    },

    // HTTP zu HTTPS Weiterleitung einrichten
    createRedirectServer: (hostname = 'localhost', httpPort = 80, httpsPort = 443) => {
        const redirectServer = http.createServer((req, res) => {
            res.writeHead(301, {
                Location: `https://${hostname}:${httpsPort}${req.url}`
            });
            res.end();
        });

        redirectServer.listen(httpPort, hostname, () => {
            console.log(`HTTP zu HTTPS Weiterleitung aktiv auf http://${hostname}:${httpPort}`);
        });

        return redirectServer;
    },

    // Express Middleware für HTTPS Weiterleitung
    httpsRedirectMiddleware: (req, res, next) => {
        if (req.protocol === 'http') {
            return res.redirect(301, `https://${req.headers.host}${req.url}`);
        }
        next();
    }
};

module.exports = sslConfig;
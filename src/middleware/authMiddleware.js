 require('dotenv').config();
const secretKey = process.env.SECRET_KEY;

function authenticateKey(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // Si no hay token, no autorizado

    if (token !== secretKey) return res.sendStatus(403); // Si el token no es válido, prohibido

    next(); // Si el token es válido, pasa al siguiente middleware o ruta
}

module.exports = authenticateKey;
const express = require('express');
const router = express.Router();
const { extraerReproductores,getInicio,extraerInformacionAnime, extraerInformacionBusquedaAnime } = require('./../controllers/AnimeLatam.controllers');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Ruta para obtener el inicio\
router.get('/inicio', authenticateToken, async (req, res) => {
    const inicio = await getInicio("https://latanime.org/");
    res.json(inicio);
});

// Ruta para obtener información de un anime
router.get('/anime/:nombreAnime', authenticateToken, async (req, res) => {
    const nombreAnime = req.params.nombreAnime;
    const anime = await extraerInformacionAnime(nombreAnime);
    res.json(anime);
});

// Ruta para obtener resultados de búsqueda de un anime
router.get('/buscar/:nombreAnime', authenticateToken, async (req, res) => {
    const nombreAnime = req.params.nombreAnime;
    try {
        const animes = await extraerInformacionBusquedaAnime(nombreAnime);
        res.json(animes);
    } catch (error) {
        res.status(500).send('Error fetching the search results');
    }
});

// Ruta para obtener reproductores
router.post('/reproductores', authenticateToken, async (req, res) => {
    const { url } = req.body; // Extraer la URL del cuerpo de la solicitud
    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        const reproductores = await extraerReproductores(url);
        res.json(reproductores);
    } catch (error) {
        res.status(500).send('Error fetching the URL');
    }
});

module.exports = router;
const express = require('express');
const cors = require('cors');
const rutasAnimeLatam = require('./src/routes/AnimeLatam.routes');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/animelatam', rutasAnimeLatam);

 
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
const cheerio = require('cheerio');
const { JSDOM } = require("jsdom");
const axios = require('axios');

async function getInicio(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const episodes = $('a[href^="https://latanime.org/ver/"]').map((i, element) => {
            const anchor = $(element);
            return {
                link: anchor.attr('href'),
                image: anchor.find('img').attr('src') || null,
                altText: anchor.find('img').attr('alt') || null,
                highResImage: anchor.find('img').attr('data-src') || null,
                title: anchor.find('h2').text().trim() || null,
                date: anchor.find('.span-tiempo').text().trim() || null,
                language: anchor.find('.info_cap span').text().trim() || null,
            };
        }).get();

        return episodes;
    } catch (error) {
        console.error('Error in getInicio:', error);
        throw error;
    }
}


async function extraerInformacionAnime(nombreAnime) {
    try {
        // Construir la URL del anime
        const url = `https://latanime.org/anime/${nombreAnime.toLowerCase().replace(/ /g, '-')}`;

        // Hacer la solicitud HTTP para obtener el HTML de la página
        const response = await axios.get(url);
        const htmlString = response.data;

        // Crear el DOM usando cheerio
        const $ = cheerio.load(htmlString);

        // Extraer la información del anime
        const titulo = $('h2').text().trim();
        const descripcion = $('p.opacity-75').text().trim();
        const imagen = $('.serieimgficha img').attr('src');
        const generos = $('a div.btn').map((i, el) => $(el).text().trim()).get();
        const estreno = $('.span-tiempo').text().trim().replace('Estreno: ', '');
        const episodios = $('p:nth-child(4)').text().trim().replace('Episodios: ', '');

        // Extraer los capítulos
        const capitulos = [];
        $('.cap-layout').each((i, el) => {
            const tituloCapitulo = $(el).text().trim();
            const enlace = $(el).closest('a').attr('href');
            const imagen = $(el).find('img').attr('src');
            capitulos.push({ tituloCapitulo, enlace, imagen });
        });

        // Retornar la información extraída
        return {
            titulo,
            descripcion,
            imagen,
            generos,
            estreno,
            episodios,
            capitulos
        };

    } catch (error) {
        console.error("Error al obtener la información del anime:", error);
        throw error;
    }
}

async function extraerInformacionBusquedaAnime(nombreAnime) {
    try {
        // Construir la URL de búsqueda
        const url = `https://latanime.org/buscar?q=${nombreAnime.toLowerCase().replace(/ /g, '+')}`;

        // Hacer la solicitud HTTP para obtener el HTML de la página de búsqueda
        const response = await axios.get(url);
        const htmlString = response.data;

        // Crear el DOM usando cheerio
        const $ = cheerio.load(htmlString);

        const animes = [];
        const elementosAnime = $('.row > .col-md-4.col-lg-3.col-xl-2.col-6.my-3');

        elementosAnime.each((i, elemento) => {
            const titulo = $(elemento).find('h3.my-1').text().trim();
            const descripcion = $(elemento).find('span.opacity-75').text().trim();
            const estreno = $(elemento).find('span[style="color: #ffc119;"]').text().trim();
            const imagen = $(elemento).find('img.img-fluid2').attr('src');
            const enlace = $(elemento).find('a').attr('href');

            animes.push({
                titulo,
                descripcion,
                estreno,
                imagen,
                enlace
            });
        });

        return animes;

    } catch (error) {
        console.error("Error al obtener los resultados de búsqueda del anime:", error);
        throw error;
    }
}

async function extraerReproductores(url) {
    try {
        const response = await axios.get(url);
        const htmlString = response.data;

        // Crear el DOM usando cheerio
        const $ = cheerio.load(htmlString);

        const reproductores = [];
        const elementosReproductor = $('.cap_repro .play-video.repro-item.cap');

        elementosReproductor.each((i, elemento) => {
            const nombre = $(elemento).text().trim();
            const enlace = decodificarEnlace($(elemento).attr('data-player'));

            reproductores.push({
                nombre,
                enlace
            });
        });

        return reproductores;
    } catch (error) {
        console.error("Error al obtener los reproductores:", error);
        throw error;
    }
}

 

function decodificarEnlace(base64String) {
    return Buffer.from(base64String, 'base64').toString('utf-8');
}

module.exports = {
    getInicio,
    extraerInformacionAnime,
    extraerInformacionBusquedaAnime,
    extraerReproductores
};



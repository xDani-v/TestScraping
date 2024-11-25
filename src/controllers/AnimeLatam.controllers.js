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

        // Crear el DOM usando jsdom
        const dom = new JSDOM(htmlString);
        const doc = dom.window.document;

        // Extraer la información del anime
        const titulo = doc.querySelector('h2')?.textContent.trim();
        const descripcion = doc.querySelector('p.opacity-75')?.textContent.trim();
        const imagen = doc.querySelector('.serieimgficha img')?.src;
        const generoElements = doc.querySelectorAll('a div.btn');
        const generos = Array.from(generoElements).map(genero => genero.textContent.trim());
        const estreno = doc.querySelector('.span-tiempo')?.textContent.trim().replace('Estreno: ', '');
        const episodios = doc.querySelector('p:nth-child(4)')?.textContent.trim().replace('Episodios: ', '');

        // Extraer los capítulos
        const capitulos = [];
        const capElements = doc.querySelectorAll('.cap-layout');
        capElements.forEach(cap => {
            const tituloCapitulo = cap.textContent.trim();
            const enlace = cap.closest('a').href;
            const imagen = cap.querySelector('img')?.src;
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
    }
}

async function extraerInformacionBusquedaAnime(nombreAnime) {
    try {
        // Construir la URL de búsqueda
        const url = `https://latanime.org/buscar?q=${nombreAnime.toLowerCase().replace(/ /g, '+')}`;

        // Hacer la solicitud HTTP para obtener el HTML de la página de búsqueda
        const response = await axios.get(url);
        const htmlString = response.data;

        // Crear el DOM usando jsdom
        const dom = new JSDOM(htmlString);
        const doc = dom.window.document;

        const animes = [];
        const elementosAnime = doc.querySelectorAll('.row > .col-md-4.col-lg-3.col-xl-2.col-6.my-3');

        elementosAnime.forEach(elemento => {
            const titulo = elemento.querySelector('h3.my-1')?.textContent.trim();
            const descripcion = elemento.querySelector('span.opacity-75')?.textContent.trim();
            const estreno = elemento.querySelector('span[style="color: #ffc119;"]')?.textContent.trim();
            const imagen = elemento.querySelector('img.img-fluid2')?.src;
            const enlace = elemento.querySelector('a')?.href;

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
    }
}


async function extraerReproductores(url) {

    const response = await axios.get(url);
    const htmlString = response.data;

    const dom = new JSDOM(htmlString);
    const doc = dom.window.document;

    const reproductores = [];
    const elementosReproductor = doc.querySelectorAll('.cap_repro .play-video.repro-item.cap');

    elementosReproductor.forEach(elemento => {
        const nombre = elemento.textContent.trim();
        const enlace = decodificarEnlace(elemento.getAttribute('data-player'));

        reproductores.push({
            nombre,
            enlace
        });
    });

    return reproductores;
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



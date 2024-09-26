const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;
const BASE_URL = 'https://webscraper.io/test-sites/e-commerce/static/computers/laptops';


async function scrapeLenovoLaptops(page = 1) {
    let url = `${BASE_URL}?page=${page}`;
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const laptops = [];

        $('div.thumbnail').each((index, element) => {
            const titulo = $(element).find('.title').text().trim();
            const preco = parseFloat($(element).find('.price').text().replace('$', '').trim());
            const descricao = $(element).find('.description').text().trim();
            const comentarios = $(element).find('.ratings .pull-right').text().trim();
            const avaliacao = $(element).find('.ratings span').attr('data-rating');

            if (titulo.toLowerCase().includes('lenovo')) {
                laptops.push({
                    titulo,
                    preco,
                    descricao,
                    comentarios,
                    avaliacao
                });
            }
        });

    
        const nextPage = $('.pagination li.active').next().find('a').length > 0;

        if (nextPage) {
            const nextLaptops = await scrapeLenovoLaptops(page + 1); 
            return laptops.concat(nextLaptops); 
        }

        return laptops;

    } catch (error) {
        console.error('Erro ao fazer o scraping:', error);
        return [];
    }
}

app.get('/lenovo-laptops', async (req, res) => {
    const laptops = await scrapeLenovoLaptops();
    laptops.sort((a, b) => a.preco - b.preco); 
    res.json(laptops);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});



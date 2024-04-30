const express = require('express');
const axios = require('axios');
const { JSDOM } = require('jsdom');

const app = express();
const port = 3000;

const path = require('path');

// ...

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/api/scrape', async (req, res) => {
    const keyword = req.query.keyword;
    const url = `https://www.amazon.com/s?k=${keyword}`;

    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });
        const dom = new JSDOM(data);
        const document = dom.window.document;

        const products = [...document.querySelectorAll('.s-result-item')].map(product => {
            const title = product.querySelector('.a-link-normal .a-text-normal')?.textContent;
            const rating = product.querySelector('.a-icon-star-small .a-icon-alt')?.textContent;
            const reviews = product.querySelector('.a-link-normal .a-size-base')?.textContent;
            const image = product.querySelector('.s-image')?.src;

            return { title, rating, reviews, image };
        });

        res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.toString() });
  }
  
});

app.listen(port, () => console.log(`Server running on port ${port}`));

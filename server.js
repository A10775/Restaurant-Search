const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const session = require('express-session');

const app = express();
const PAGE_SIZE = 10;
const API_KEY = '7216a4ef61efbd95';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/search', async (req, res) => {
    const { latitude, longitude, radius } = req.body;
    req.session.searchParams = { latitude, longitude, radius };

    res.redirect('/results');
});

app.get('/results', async (req, res) => {
    const { latitude, longitude, radius } = req.session.searchParams;
    const currentPage = parseInt(req.query.page) || 1;
    const start = (currentPage - 1) * PAGE_SIZE;

    try {
        const response = await axios.get('http://webservice.recruit.co.jp/hotpepper/gourmet/v1/', {
            params: {
                key: API_KEY,
                lat: latitude,
                lng: longitude,
                range: radius,
                start: start + 1,
                count: PAGE_SIZE,
                format: 'json'
            }
        });

        const totalResults = response.data.results.results_available;
        const restaurants = response.data.results.shop;
        res.render('results', {
            restaurants,
            currentPage,
            pageSize: PAGE_SIZE,
            totalResults,
            start: start + 1,
            end: start + restaurants.length,
            radius
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('エラーが発生しました。');
    }
});

app.get('/details/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const response = await axios.get('http://webservice.recruit.co.jp/hotpepper/gourmet/v1/', {
            params: {
                key: API_KEY,
                id: id,
                format: 'json'
            }
        });

        const restaurant = response.data.results.shop[0];
        res.render('details', { restaurant });
    } catch (error) {
        console.error(error);
        res.status(500).send('エラーが発生しました。');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

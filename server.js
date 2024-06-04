const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const session = require('express-session');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const API_KEY = '7216a4ef61efbd95';

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/search', async (req, res) => {
    const { latitude, longitude, radius, keyword } = req.body;

    req.session.searchParams = { latitude, longitude, radius, keyword };

    const perPage = 10;
    const page = req.query.page || 1;
    const sort = req.query.sort || 'distance_asc';

    const params = {
        key: API_KEY,
        lat: latitude,
        lng: longitude,
        range: radius,
        format: 'json',
        count: perPage,
        start: (page - 1) * perPage + 1,
        order: sort === 'recommend' ? 4 : 1 // オススメ順:4, 距離順:1
    };

    if (keyword) {
        params.keyword = keyword;
    }

    try {
        const response = await axios.get('http://webservice.recruit.co.jp/hotpepper/gourmet/v1/', { params });

        const restaurants = response.data.results.shop;
        const totalResults = response.data.results.results_available;
        const totalPages = Math.ceil(totalResults / perPage);

        res.render('results', {
            restaurants,
            currentPage: parseInt(page),
            totalPages,
            totalResults,
            radius,
            keyword,
            perPage,
            sort
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('エラーが発生しました。');
    }
});

app.get('/details/:id', async (req, res) => {
    const id = req.params.id;
    const page = req.query.page || 1;

    try {
        const response = await axios.get('http://webservice.recruit.co.jp/hotpepper/gourmet/v1/', {
            params: {
                key: API_KEY,
                id: id,
                format: 'json'
            }
        });

        const restaurant = response.data.results.shop[0];
        res.render('details', { restaurant, page });
    } catch (error) {
        console.error(error);
        res.status(500).send('エラーが発生しました。');
    }
});

app.get('/results', async (req, res) => {
    const { latitude, longitude, radius, keyword } = req.session.searchParams;

    const perPage = 10;
    const page = req.query.page || 1;
    const sort = req.query.sort || 'distance_asc';

    const params = {
        key: API_KEY,
        lat: latitude,
        lng: longitude,
        range: radius,
        format: 'json',
        count: perPage,
        start: (page - 1) * perPage + 1,
        order: sort === 'recommend' ? 4 : 1 // オススメ順:4, 距離順:1
    };

    if (keyword) {
        params.keyword = keyword;
    }

    try {
        const response = await axios.get('http://webservice.recruit.co.jp/hotpepper/gourmet/v1/', { params });

        const restaurants = response.data.results.shop;
        const totalResults = response.data.results.results_available;
        const totalPages = Math.ceil(totalResults / perPage);

        res.render('results', {
            restaurants,
            currentPage: parseInt(page),
            totalPages,
            totalResults,
            radius,
            keyword,
            perPage,
            sort
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('エラーが発生しました。');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

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

app.post('/search', (req, res) => {
    const { latitude, longitude, radius } = req.body;

    req.session.searchParams = { latitude, longitude, radius }; // セッションに検索条件を保存
    req.session.currentPage = 1; // 現在のページ番号を初期化

    res.redirect('/results');
});

app.get('/results', async (req, res) => {
    const { latitude, longitude, radius } = req.session.searchParams;
    const currentPage = parseInt(req.query.page) || req.session.currentPage || 1;
    const start = (currentPage - 1) * 10 + 1; // 1ページに10件表示する場合のオフセット

    try {
        const response = await axios.get('http://webservice.recruit.co.jp/hotpepper/gourmet/v1/', {
            params: {
                key: API_KEY,
                lat: latitude,
                lng: longitude,
                range: radius,
                start: start,
                format: 'json'
            }
        });

        const restaurants = response.data.results.shop;
        const totalResults = response.data.results.results_available;

        res.render('results', {
            restaurants,
            currentPage,
            totalResults,
            pageSize: 10
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

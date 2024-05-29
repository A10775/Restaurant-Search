const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const API_KEY = '7216a4ef61efbd95';

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/search', async (req, res) => {
    const { latitude, longitude, radius } = req.body;

    try {
        const response = await axios.get('http://webservice.recruit.co.jp/hotpepper/gourmet/v1/', {
            params: {
                key: API_KEY,
                lat: latitude,
                lng: longitude,
                range: radius,
                format: 'json'
            }
        });

        const restaurants = response.data.results.shop;
        res.render('results', { restaurants });
    } catch (error) {
        console.error(error);
        res.status(500).send('エラーが発生しました。');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

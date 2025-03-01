const express = require('express');

const web = express.Router();

web.get('/', (req, res) => {
    res.render('welcome', {
        heading: 'Welcome to MVC!',
    })
});

module.exports = web;
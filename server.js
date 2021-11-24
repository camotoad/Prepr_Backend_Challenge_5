const express = require('express');

const configExpress = () => {
    const app = express();

    app.set('views', './app/views');
    app.set('view engine', 'ejs');

    require('./app/routes/routes')(app);

    return app;
};

const app = configExpress();

app.listen('3000', () => {
    console.log('Server running at http://localhost:3000/');
});

module.exports = app;
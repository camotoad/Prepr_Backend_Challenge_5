const express = require('express');
const mysql = require('mysql');

const configExpress = () => {
    const app = express();

    app.set('views', './app/views');
    app.set('view engine', 'ejs');

    require('./app/routes/routes')(app);

    return app;
};

const db = mysql.createConnection({
    host        : 'localhost',
    user        : 'root',
    password    : ''
    ,database    : 'node_challenge_login_db' //Comment out and create db first
});

db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('Mysql Connected');
})

//create db
// function createDB(){
//     let q = 'create database node_challenge_login_db';
//     db.query(q, (err, result) => {
//         if (err) throw err;
//         console.log(result);
//         console.log('DB created');
//     });

//     let q2 = 'create table node_challenge_login_db.users(id int auto_increment, display_name varchar(100), password varchar(100), email varchar(100), picture varchar(100), primary key (id))';
//     db.query(q2, (err, result) => {
//         if (err) throw err;
//         console.log(result);
//         console.log('Table created');
//     });
// };

const app = configExpress();

app.listen('3000', () => {
    console.log('Server running at http://localhost:3000/');
    //createDB();
});

module.exports = app;
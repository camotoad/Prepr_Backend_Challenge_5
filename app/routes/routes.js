const con = require('../controllers/controller');
const express = require('express');
const router = express.Router(); 

module.exports = function(app){
    const controller = require('../controllers/controller');

    app.route('/').get(controller.index);
    app.route('/signup').get(controller.register).post(controller.create);
    app.route('/login').get(controller.login).post(controller.validate);
}
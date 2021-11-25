
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const db = mysql.createConnection({
    host        : 'localhost',
    user        : 'root',
    password    : ''
    ,database    : 'node_challenge_login_db' //Comment out and create db first
});

exports.index = function(req,res){
    

    let q = `select * from users where display_name = 'asdf'`;
    db.query(q, (err, result) => {
        if (err) throw err;
        res.render('index', {
            user: result
        });
    });
}

exports.register = function(req,res){
    
    res.render('signup');
}

exports.create = async function(req, res, next){
    
    if(req.body.password !== req.body.con_password){
        req.flash('error', 'Passwords do not match.');
        res.redirect('/signup');
    } else if(req.body.password.length < 6) {
        req.flash('error', 'Password need to be at least 6 characters long.');
        res.redirect('/signup');
    }

    try{
        const hashedPw = await bcrypt.hash(req.body.password, 10);
        console.log(hashedPw);
        let q = `insert into users(display_name, email, password) values ('${req.body.display_name}', '${req.body.email}', '${hashedPw}')`;
        db.query(q, (err, result) => {
                    if (err) throw err;
                    req.flash('success', 'Your account has been created, Please log in');
                    res.redirect('/login');
                });
    } catch {
        req.flash('error', 'There was an error on our end.');
        res.redirect('/signup');
    } 
};

exports.login = function(req,res){
    
    res.render('login');
}

exports.validate = function(req,res,next){
    let q = `select * from users where email = '${req.body.email}'`;
    db.query(q, (err, result) => {
        if (err) throw err;
        try{
            console.log(result[0].password);
            if(bcrypt.compare(req.body.password, result[0].password)){
                req.session.display_name = result.display_name;
                res.redirect('/');
            } else {
                req.flash('error', 'Your information does not match our records.');
                res.redirect('/login');
            }
        } catch(e) {
            req.flash('error', 'There was an error on our end.');
            console.log(e);
            res.redirect('/login');
        }
    });
}

exports.logout = function(req, res){
    req.session.destroy();
    req.flash('success', 'You have been logged out');
    res.redirect('/login');
}

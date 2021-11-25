
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const db = mysql.createConnection({
    host        : 'localhost',
    user        : 'root',
    password    : ''
    ,database    : 'node_challenge_login_db' //Comment out and create db first
});

exports.index = function(req,res){
    if(!req.session.display_name){
        console.log(req.session.display_name)
        req.flash('error', 'Please log in to access this page.');
        return res.redirect('/login');
    }

    let q = `select * from users where display_name = 'asdf'`;
    db.query(q, (err, result) => {
        if (err) throw err;
        res.render('index', {
            user: result[0].display_name
        });
    });
}

exports.register = function(req,res){
    if(req.session.display_name){
        res.redirect('/');
    }
    
    return res.render('signup');
}

exports.create = function(req, res, next){
    
    if(req.body.password !== req.body.con_password){
        req.flash('error', 'Passwords do not match.');
        return res.redirect('/signup');
    } else if(req.body.password.length < 6) {
        req.flash('error', 'Password need to be at least 6 characters long.');
        return res.redirect('/signup');
    }
    let ematch = `select * from users where email = '${req.body.email}'`;
    db.query(ematch, (err, result) => {
        if (err) throw err;
       if(result.length > 0){
            req.flash('error', 'This email has been taken.');
            return res.redirect('/signup');
       } else {
            try{
                const hashedPw = bcrypt.hash(req.body.password, 10);
                console.log(hashedPw);
                let q = `insert into users(display_name, email, password) values ('${req.body.display_name}', '${req.body.email}', '${hashedPw}')`;
                db.query(q, (err, result) => {
                            if (err) throw err;
                            req.flash('success', 'Your account has been created, Please log in');
                            return res.redirect('/login');
                        });
            } catch {
                req.flash('error', 'There was an error on our end.');
                return res.redirect('/signup');
            } 
       }
    });

   
};

exports.login = function(req,res){
    if(req.session.display_name){
        res.redirect('/');
    }
    return res.render('login');
}

exports.validate = function(req,res){
    let q = `select * from users where email = '${req.body.email}'`;
    db.query(q, (err, result) => {
        if (err) throw err;
        try{
            if(result.length > 0 && result){
                //console.log(result);
                if(bcrypt.compare(req.body.password, result[0].password)){
                    req.session.display_name = result[0].display_name;
                    return res.redirect('/');
                } 
                req.flash('error', 'Your information does not match our records.');
                return res.redirect('/login');
            }
            else {
                req.flash('error', 'Your information does not match our records.');
                return res.redirect('/login');
            }
        } catch(e) {
            req.flash('error', 'There was an error on our end.');
            console.log(e);
            return res.redirect('/login');
        }
    });
}

exports.logout = function(req, res){
    req.session.display_name = null;
    req.flash('success', 'You have been logged out');
    return res.redirect('/login');
}

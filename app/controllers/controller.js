
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const multer = require('multer');
const session = require('express-session');
const path = require('path');

const db = mysql.createConnection({
    host        : 'localhost',
    user        : 'root',
    password    : ''
    ,database    : 'node_challenge_login_db' //Comment out and create db first
});

exports.index = function(req,res){
    if(!req.session.display_name){
        req.flash('error', 'Please log in to access this page.');
        return res.redirect('/login');
    }

    let q = `select * from users where display_name = '${req.session.display_name}'`;
    db.query(q, (err, result) => {
        if (err) throw err;
        if(result[0].picture){ var pic = '/' + result[0].picture}
        else {var pic = '/default.jpg'}
        res.render('index', {
            user: result[0].display_name,
            pic: pic,
            about: result[0].about
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
    } else if (req.body.display_name == '' || req.body.email == ''){
        req.flash('error', 'Please fill out every field.');
        return res.redirect('/signup');
    }

    let ematch = `select * from users where email = '${req.body.email}'`;
    db.query(ematch, (err, result) => {
        if (err) throw err;
        if(result.length > 0){
            req.flash('error', 'This email has been taken.');
            return res.redirect('/signup');
       } else {
            let nmatch = `select * from users where display_name = '${req.body.display_name}'`;
            db.query(nmatch, (err, result) =>{
            if (err) throw err;
            if(result.length > 0){
            req.flash('error', 'This name has been taken.');
            return res.redirect('/signup');
            }
            });
            try{
                const hashedPw = bcrypt.hashSync(req.body.password, 10);          
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

exports.upload = function(req, res){
    
    const storage = multer.diskStorage({
        destination: 'app/pics',
        filename: function(req, file, cb){
        cb(null, req.session.display_name + '-' + Date.now() + path.extname(file.originalname));
        }
    });
    
    const upload = multer({
        storage: storage,
        limits:{ fileSize: 1000000 },
        fileFilter: function(req, file, cb){
        checkFileType(file, cb);
        }
    }).single('image');
    
    // Check File Type
    function checkFileType(file, cb){
        
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
        if(extname){
        return cb(null,true);
        } else {
        cb('Error: Images Only!');
        }
    }
    upload(req, res, (err) => {
        if(err){
          req.flash('error', err);
          return res.redirect('/edit');
        } else {
          if(req.file == undefined){
            //console.log('no file selected');
          } else {
            db.query(`update users set picture = '${req.file.filename}' where display_name = '${req.session.display_name}'`, (err, result) => {if (err) throw err;});
          }
          if(req.body.about == null){
            //pass
          } else {
                db.query(`update users set about = '${req.body.about}' where display_name = '${req.session.display_name}'`, (err, result) => {if (err) throw err;});
          }
            req.flash('success', 'Success');
            return res.redirect('/');
        }
      });
}

    exports.edit = function(req,res){
        if(!req.session.display_name){
            console.log(req.session.display_name)
            req.flash('error', 'Please log in to access this page.');
            return res.redirect('/login');
        }

        return res.render('edit')
    }
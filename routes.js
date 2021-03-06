const passport=require('passport');
const bcrypt = require('bcrypt');

module.exports = (app, myDataBase)=> {
    app.route('/').get((req, res) => {
        res.render('pug', {
          title: 'Connected to Database',
          message: 'Please login',
          showLogin:true,
          showRegistration:true,
        });
      });
    app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
        res.redirect('/profile');
    });
    app.route('/logout').get((req,res)=>{
        req.logout();
        res.redirect('/');
    })
    app.route('/register')
        .post((req, res, next) => {
        myDataBase.findOne({ username: req.body.username }, function(err, user) {
          const hash = bcrypt.hashSync(req.body.password, 12);
          if (err) {
            next(err);
          } else if (user) {
            res.redirect('/');
          } else {
            myDataBase.insertOne({
              username: req.body.username,
              password: hash
            },
              (err, doc) => {
                if (err) {
                  res.redirect('/');
                } else {
                  next(null, doc.ops[0]);
                }
              }
            )}
        })
    },
        passport.authenticate('local', { failureRedirect: '/' }),
        (req, res, next) => {
          res.redirect('/profile');
        }
    );
    const ensureAuthenticated=(req,res,next)=>{
        if(req.isAuthenticated()){
          return next();
        }
        res.redirect('/');
    }
    app.route('/profile').get(ensureAuthenticated,(req,res)=>{
        res.render(process.cwd()+'/views/pug/profile',{username:req.user.username});
    });
    app.use((req, res, next) => {
        res.status(404)
          .type('text')
          .send('Not Found');
    });
}





var express          = require('express'),
    app              = express(),
    handlebars       = require('express-handlebars'),
    connect          = require('connect'),
    flash            = require('connect-flash'),
    bodyParser       = require('body-parser'),
    urlencoded       = bodyParser.urlencoded({extended: false}),
    cookieParser     = require('cookie-parser'),
    session          = require('express-session'),
    logger           = require('morgan')('dev'),
    mongoose         = require('mongoose'),
    passport         = require('passport'),
    User             = require('./models/User');

//////////////////////
// INIT
//////////////////////

var init = {
  'engine'   :   handlebars.create({
                    layoutsDir    : 'views/layouts',
                    partialsDir   : 'views/partials',
                    defaultLayout : 'default',
                    helpers       : new require('./views/helpers')(),
                    extname       : '.hbs'
                  }).engine,
  'static'   :  __dirname + '/public/dist',
  'views'    :  'views',

  'secret'   :  'Quentin Vesclovious Cawks',
  'database' :  'mongodb://localhost/open-protocol'
};

app.set('view engine', 'hbs');
app.set(init.views);
app.engine('hbs', init.engine);

//////////////////////
// MONGOOSE
//////////////////////

mongoose.connect(init.database);
mongoose.connection.on('error',
  console.error.bind(console,
    'connection error:'));
mongoose.connection.once('open',
  function callback() {
    console.log('DB connected');
  });

//////////////////////
// MIDDLEWARE
//////////////////////

app.use(express.static(init.static));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(urlencoded);
app.use(logger);
app.use(session({
  secret: init.secret,
  saveUninitialized: false,
  resave: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//////////////////////
// PASSPORT
//////////////////////

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//////////////////////
// LOCAL
//////////////////////

var LocalStrategy    = require('passport-local').Strategy;
var credentials      = require('./config/credentials'),
    FacebookStrategy = require('passport-facebook'),
    TwitterStrategy  = require('passport-twitter').Strategy;

passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({
    username: username
  },
  function(err, user) {
    if (err) {
      return done(err);
    }

    if (!user) {
      return done(null, false);
    }
    else if (user) {
      return done(null, user);
    }
  });
}));

var secure = function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  }
  else {
    next();
  }
};

//////////////////////
// ROUTES
//////////////////////

app.get('/',
  secure,
  function(req, res, next) {
    console.log('===SECURE==');
    console.log(req.user);
    console.log('===SECURE==');
    res.render('app', {
      user: req.user
    });
  });

app.get('/register',
  function(req, res, next) {
    console.log('==REGISTER=');
    console.log(req.user);
    console.log('==REGISTER=');
    res.render('index');
  });

app.post('/register',
  function(req, res, next) {
    var user = new User();

    user.username = req.body.username;
    user.password = req.body.password;

    user.save(function(err, user) {
      if (err) {
        return res.render('index', {
          message: 'Username taken.'
        });
      }

      req.login(user,
        function(err) {
          if (err) {
            return next(err);
          }

        passport.authenticate('local')(req, res,
          function() {
            res.redirect('connect');
          });
      });
    });
  });

app.get('/login',
  function(req, res, next) {
    console.log('====LOGIN==');
    console.log(req.user);
    console.log('====LOGIN==');
    res.render('login');
  });

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  }),
  function(req, res, next) {
    res.redirect('/');
  });

app.get('/logout',
  function(req, res, next) {
    req.logout();
    res.redirect('login');
  });

app.get('/connect',
  secure,
  function(req, res, next) {
    res.render('connect', {
      user: req.user
    });
  });

//////////////////////
// FACEBOOK
//////////////////////

passport.use(new FacebookStrategy(credentials.facebook,
  function(accessToken, refreshToken, profile, done) {
    User.findOne({
      'facebook.id': profile.id
    },
    function(err, user) {
      if (err) {
        return done(null, false, err);
      }

      if (user) {
        // yes => log user in;
        // This is probably where the user goes straight into the app
        return done(null, user);
      }
    });

  return done(null, profile);
  }
));

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  urlencoded,
  function(req, res, next) {
    passport.authenticate('facebook', {
      failureRedirect: '/register'
    },
    function(err, user, info) {
      if (err) {
        return next(err);
      }

      if (user && req.user.facebook.id) {
        return res.redirect('/');
      }
      else if (user && req.user && !req.user.facebook.id) {
        var attr = user._json;

        req.user.facebook = {
          id        : attr.id,
          email     : attr.email,
          name      : attr.name,
          firstName : attr.first_name,
          lastName  : attr.last_name,
          gender    : attr.gender,
          profile   : attr.link,
        };

        req.user.save(function(err, user) {
          if (err) {
            console.log(err);
          }

          return res.redirect('/connect');
        });
      }
      else if (!req.user) {
        return res.redirect('/register');
      }
    })(req, res, next);
});

//////////////////////
// TWITTER
//////////////////////


app.listen(3000);
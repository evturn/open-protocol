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
    passport         = require('passport');

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
var User = require('./models/User');

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
      return done(null, false, {
        message: 'Unknown user ' + username
      });
    }

    user.comparePassword(password,
      function(err, isMatch) {
        if (err) {
          return done(err);
        }

        if (isMatch) {
          return done(null, user);
        }
        else {
          return done(null, false, {
            message: 'Invalid password'
          });
        }
      });
  });
}));

var secure = function(req, res, next) {
  if (!req.user) {
    req.flash('error', 'Log in immediately!');
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
    console.log('===========');
    res.render('app', {
      user: req.user
    });
  });

app.get('/register',
  function(req, res, next) {
    console.log('===========');
    console.log(req.user);
    console.log('===========');
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

      req.login(user, function(err) {
        if (err) {
          return next(err);
        }

        passport.authenticate('local')(req, res, function() {
            res.redirect('connect');
        });
      });
    });
  });

app.get('/login',
  function(req, res, next) {
    res.render('login');
  });

app.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
  }),
  function(req, res, next) {
    res.redirect('/');
  });

app.get('/logout',
  function(req, res, next) {
    req.logout();
    res.redirect('register');
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
        console.log('====error====');
        console.log(err);
        console.log('===========');
        return done(null, false, err);
      }

      if (user) {
        console.log('======user==');
        console.log(user);
        console.log('===========');
        return done(null, user);
      }
    });

    console.log('===========');
    console.log('===profile=');
    console.log(profile);
    console.log('===========');
    console.log('===========');

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

      if (user) {
        console.log('jfdslak;fdsakl', user);
        return next(user);
      }

      if (user && req.user) {
        console.log('DFHJSKAFDSJAF;FJKSLA;FJDKSLA;FJDSLA;');
      }

    })(req, res, next);
});

//////////////////////
// TWITTER
//////////////////////


app.listen(3000);
var express         = require('express'),
    app             = express(),
    handlebars      = require('express-handlebars'),
    connect         = require('connect'),
    flash           = require('connect-flash'),
    bodyParser      = require('body-parser'),
    urlencoded      = bodyParser.urlencoded({extended: false}),
    cookieParser    = require('cookie-parser'),
    session         = require('express-session'),
    logger          = require('morgan')('dev'),
    mongoose        = require('mongoose'),
    passport        = require('passport'),
    LocalStrategy   = require('passport-local').Strategy;

//////////////////////
// INIT
//////////////////////

var init = {
  engine    :   handlebars.create({
                  layoutsDir    : 'views/layouts',
                  partialsDir   : 'views/partials',
                  defaultLayout : 'default',
                  helpers       : new require('./views/helpers')(),
                  extname       : '.hbs'
                }).engine,
  database  :  'mongodb://localhost/open-protocol',
  static    :  __dirname + '/public/dist',
  secret    :  'Quentin Vesclovious Cawks'
};

app.set('view engine', 'hbs');
app.set('views', 'views');
app.engine('hbs', init.engine);

//////////////////////
// MONGOOSE
//////////////////////

mongoose.connect(init.database);
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function callback() {
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
    console.log('===========');
    console.log(req);
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
    console.log('===========');
    console.log(req);
    console.log('===========');
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
    console.log('===========');
    console.log(req.user);
    console.log('===========');
    res.render('connect', {
      user: req.user
    });
  });

//////////////////////
// CONNECT
//////////////////////


app.listen(3000);
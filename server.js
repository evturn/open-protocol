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
// HANDLEBARS
//////////////////////

hbs = handlebars.create({
  layoutsDir    : 'views/layouts',
  partialsDir   : 'views/partials',
  defaultLayout : 'default',
  helpers       : new require('./views/helpers')(),
  extname       : '.hbs'
}).engine;

app.set('view engine', 'hbs');
app.set('views', 'views');
app.engine('hbs', hbs);

//////////////////////
// MONGOOSE
//////////////////////

mongoose.connect('mongodb://localhost/open-protocol', function(err) {
  if (err) {
    console.log('Ensure you\'re connected');
  }
});
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function callback() {
  console.log('DB connected');
});

//////////////////////
// MIDDLEWARE
//////////////////////
var User = require('./models/User');

app.use(express.static(__dirname + '/public/dist'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(urlencoded);
app.use(logger);
app.use(flash());
app.use(session({
  secret: 'Quentin Vesclovious Cawks',
  saveUninitialized: false,
  resave: false
}));
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

app.get('/', function(req, res, next) {
  res.render('index');
});

app.get('/failure', function(req, res, next) {
  res.render('index');
});

app.get('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/failure',
                                   failureFlash: true })
);

app.post('/register', function(req, res, next) {
  var user = new User();

  user.username = req.body.username;
  user.password = req.body.password;


  user.save(function(err, user) {
    if (err) {
      return next(err);
    }
    console.log(user);
    res.redirect('/login');
  });
});



app.listen(3000);
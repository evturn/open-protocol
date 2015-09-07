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
    passport        = require('passport');


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

app.use(bodyParser.json());
app.use(urlencoded);
app.use(cookieParser());
app.use(express.static(__dirname + '/public/dist'));
app.use(logger);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res, next) {
  res.render('index');
});

app.listen(3000);
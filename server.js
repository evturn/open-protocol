var express = require('express'),
    app = express(),
    handlebars = require('express-handlebars');


hbs = handlebars.create({
  layoutsDir    : 'views/layouts',
  partialsDir   : 'views/partials',
  defaultLayout : 'default',
  helpers       : new require('./views/helpers')(),
  extname       : '.hbs',
});

app.set('view engine', 'hbs');
app.set('views', 'views');
app.engine('hbs', hbs.engine);

module.exports = hbs;
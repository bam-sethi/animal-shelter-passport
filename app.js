var express = require('express');
var path = require('path');
var debug = require("debug");
var logger = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
var expressLayouts = require('express-ejs-layouts');
var app = express();
var router = express.Router()

var moongoose = require('mongoose');
var databaseURL = process.env.MONGOLAB_URI || 'mongodb://localhost/animalshelter';
moongoose.connect(databaseURL);

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts)
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

app.listen(process.env.PORT || 9000)


require("./models/animal");
var Animal = moongoose.model("Animal");

app.get("/animals", function(req, res){
  Animal.find({}, function (err, animals) {

    res.render('animals/index', { animals: animals });
  });
})

app.post("/animals", function(req, res){
  Animal.create(req.body.animal, function (err, animal) {
    if(err){
      res.send("something wrong happened"+ err)
    }else{
      res.redirect('/animals');
    }

  });
})

app.get("/animals/:id/adopt", function(req, res){
  Animal.findByIdAndUpdate(req.params.id, {status: "adopted"}, function(err, animal){
    res.redirect('/animals');
  })
});

app.get("/animals/:id/abandon", function(req, res){
  Animal.findByIdAndUpdate(req.params.id, {status: "orphan"}, function(err, animal){
    res.redirect('/animals');
  })
});

app.delete('/animals/:id', function(req, res) {
  console.log('in delete');
  Animal.findByIdAndRemove(req.params.id, function(err) {
    res.redirect('/animals');
  })
})


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

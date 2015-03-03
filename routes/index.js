var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/foo2', function (req, res, next) {
  res.render('foo2', { title: "This is totally foo2"});
});

router.get('/layoutit', function (req, res, next) {
  res.render('layoutit/layoutit', { title: "Layout It"});
});

router.get('/flot', function (req, res, next) {
  res.render('flot', { title: "Flot"});
});
router.get('/layoutit2', function (req, res, next) {
  res.render('layoutit/layoutit2', { title: "Flot"});
});
router.get('/layoutit3', function (req, res, next) {
  res.render('layoutit/layoutit3', { title: "Flot"});
});
router.get('/layoutit4', function (req, res, next) {
  res.render('layoutit/layoutit4', { title: "Flot"});
});

module.exports = router;

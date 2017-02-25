var express = require('express');
var router = express.Router();

/* GET dashboard page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Dashboard' });
});

module.exports = router;

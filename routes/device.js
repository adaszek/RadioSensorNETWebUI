var express = require('express');
var router = express.Router();

/* GET devices listing. */
router.get('/', function(req, res, next) {
  res.render('device', { title: 'Device' });
});

module.exports = router;

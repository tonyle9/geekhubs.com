'use strict'

var express = require('express');
var router = express.Router();

var User = require('../models/user')
var Comment = require('../models/comment')
var Article = require('../models/article')
var Tag = require('../models/tag')

router.param('username', function(req, res, next, username) {
  User
  .findOne({username})
  .exec(function(err, user) {    
    if (err) return next(err)
    if (!user) return next(getNotFoundError())
    
    res.locals.user = user
    next()
  })
})

router.get('/', function(req, res, next) {
  User
  .find()
  .sort('-createdAt')
  .exec(function(err, users) {
    if (err) return next(err)

    res.render('users/index', {users})
  })
})

router.get('/new', function(req, res, next) {
  res.render('users/new', {user: {}})
})

router.get('/:username/edit', function(req, res, next) {
  res.render('users/edit')  
})

router.get('/:username', function(req, res, next) {
  res.render('users/show')
})

router.put('/:username', function(req, res, next) {
  let user = res.locals.user
  
  user.email = req.body.email
  user.username = req.body.username
  user.password = req.body.password
  
  user.save((err) => {
    if (err) return next(err)
    res.redirect('/users/' + user.username)  
  })
})

router.post('/', function(req, res, next) {
  var user = new User({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  })
  
  user.save((err) => {
    if (err) return next(err)
    res.redirect('/users/' + user.username)
  })
});

module.exports = router;



function getNotFoundError () {
  var error = new Error('User not found')
  error.status = 404
  return error
}
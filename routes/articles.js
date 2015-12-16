'use strict'

var express = require('express');
var router = express.Router();

var Comment = require('../models/comment')
var Article = require('../models/article')
var Hub = require('../models/hub')

router.param('id', function(req, res, next, id) {
  Article
  .findById(id)
  .populate('hubs')
  .populate('creator')
  .exec(function(err, article) {    
    if (err) return next(err)
    if (!article) return next(getNotFoundError())
    
    res.locals.article = article
    next()
  })
})

router.get('/', function(req, res, next) {
  Article
  .find()
  .sort('-createdAt')
  .populate('hubs')
  .populate('creator')
  .exec(function(err, articles) {
    if (err) return next(err)

    res.render('articles/index', {articles})
  })
})

router.get('/new', function(req, res, next) {
  Hub.find().exec(function(err, hubs) {
    if (err) return next(err)
    res.render('articles/new', {article: {}, hubs})  
  })
  
})

router.get('/:id/edit', function(req, res, next) {
  Hub.find().exec(function(err, hubs) {
    if (err) return next(err)
    res.render('articles/edit', {hubs})  
  })
})

router.get('/:id/:slug', function(req, res, next) {
  let article = res.locals.article

  Comment
  .find({article: article._id})
  .sort('createdAt')
  .populate('creator')
  .populate('article')
  .exec((err, comments) => {
    res.render('articles/show', {comments, comment: {}})  
  })
})



router.put('/:id', function(req, res, next) {
  let article = res.locals.article
  
  let lastHubs = article.hubs.map(hub => hub._id.toString())
  let newHubs = req.body.hubs
  let set = new Set(lastHubs.concat(newHubs))
  let hubs = Array.from(set)
    
  article.title = req.body.title
  article.summary = req.body.summary
  article.content = req.body.content
  article.slug = req.body.slug
  article.hubs = req.body.hubs

  article.save((err, article) => {
    if (err) return next(err)
    res.redirect('/articles/' + article._id + '/' + article.slug)  
    
    Hub.updateArticlesCount(hubs)
  })
})

router.post('/', function(req, res, next) {
  
  var article = new Article({
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
    slug: req.body.slug,
    hubs: req.body.hubs,
    creator: req.user._id
  })
  
  article.save((err, article) => {
    if (err) return next(err)
    res.redirect('/articles/' + article._id + '/' + article.slug)  

    Hub.updateArticlesCount(article.hubs)
  })
});

module.exports = router;



function getNotFoundError () {
  var error = new Error('Article not found')
  error.status = 404
  return error
}
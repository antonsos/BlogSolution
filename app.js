const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');

//MDB config
const db = require('./config/keys').MongoURL;

app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(expressSanitizer());

let port = process.env.PORT || 5001;

//MongoDB connect
mongoose.connect(db)
  .then( () => (
    console.log('ok')
  ))
  .catch( err => console.log(err));

const blogSchema = new mongoose.Schema({
  name: String,
  image: String,
  body: String,
  created: { type: Date, default: Date.now }
})

const Blog = mongoose.model('Blog', blogSchema);

app.get('/', (req, res) => {
  res.redirect('/blogs');
});

app.get('/blogs', (req, res) => {
  Blog.find({}, (err, posts) => {
      if(err) return console.log(err)
      res.render('index', {posts});
  })
});

app.get('/blogs/new', (req, res) => {
  res.render('new');
});

app.post('/blogs', (req, res) => {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, (err, newBlog) => {
    if(err) res.render('new');
    res.redirect('/blogs');
  })
})

app.get('/blogs/:id', (req, res) => {
  Blog.findById(req.params.id, (err, post) => {
      if(err) req.redirect('/blogs')
      res.render('post', {post});
  })
});

app.get('/blogs/:id/edit', (req, res) => {
  Blog.findById(req.params.id, (err, post) => {
      if(err) req.redirect('/blogs')
      res.render('edit', {post});
  })
});

app.post('/blogs/:id', (req, res) => {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updateBlog) => {
    if(err) res.render('/blogs');
    res.redirect('/blogs')
  })
})

app.delete('/blogs/:id', (req, res) => {
  Blog.findByIdAndRemove(req.params.id, req.body.blog, (err, updateBlog) => {
    if(err) res.render('/blogs');
    res.redirect('/blogs')
  })
})


app.listen(port, () => {
  console.log(`YelpCamp has started! ${port}`);
});
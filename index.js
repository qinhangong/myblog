const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const formidable = require('express-formidable');
const config = require('config-lite')(__dirname);
const routes = require('./routes');
const pkg = require('./package');
const winston = require('winston')
const expressWinston = require('express-winston')

const app = express();

app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  name: config.session.key,
  secret: config.session.secret,
  resave: true,
  saveUninitialized: false,
  cookie: { maxAge: config.session.maxAge },
  store: new MongoStore({ url: config.mongodb })
}))
app.use(flash());
app.use(formidable({
  uploadDir: path.join(__dirname, 'public/img'), // 上传文件保存的目录
  keepExtensions: true// 保留后缀
}))
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  next();
})
app.use(expressWinston.logger({
    transports: [
      new (winston.transports.Console)({
        json: true,
        colorize: true
      }),
      new winston.transports.File({
        filename: 'logs/success.log'
      })
    ]
  }))

routes(app);

app.use(expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      }),
      new winston.transports.File({
        filename: 'logs/error.log'
      })
    ]
  }))


app.use(function (err, req, res, next) {
  req.flash('error', err.message);
  res.redirect('/posts');
})

app.listen(config.port, function (err) {
  if (!err) console.log(`${pkg.name} listening on port ${config.port}`)
})





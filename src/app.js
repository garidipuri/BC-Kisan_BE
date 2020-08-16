const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//var morgan = require('morgan');
var fs = require('fs');
var path = require('path');
var rfs = require('rotating-file-stream');

const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const userRoutes = require('./routes/user');

app.listen(3000,() => {
  console.log("Server running on port 3000");
 });

try {
  mongoose.connect("mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false/varam", 
      // useMongoClient: true
      { useNewUrlParser: true,  useUnifiedTopology: true }
    
  );
  
} catch (error) {
  console.log("error")
  
}

console.log('connected')
mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});
// log only 4xx and 5xx responses to console
app.use(morgan('dev', {
  skip: function (req, res) { return res.statusCode < 400 }
}))
// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log')
})
 
// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))
 

 
app.get('/', function (req, res) {
  res.send('hello, world!')
})


// Routes which should handle requests
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/user", userRoutes);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});


// middleware

// app.use('/src',routes)
// const port =process.env.PORT;
// app.listen(port,()=> {
//   console.log('server is running on port :${port}')
// })

module.exports = app


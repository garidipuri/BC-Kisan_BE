const express = require("express");//importing express 
const router = express.Router();
const mongoose = require("mongoose"); // importing mongoose
const bcrypt = require("bcrypt"); // importing bcrypt
var path=require('path')
var bodyParser = require('body-parser')// importing body parser middleware to parse form content from HTML
var nodemailer = require('nodemailer');//importing node mailer
var directTransport = require('nodemailer-direct-transport');
var options = {};
var transporter = nodemailer.createTransport(directTransport(options))
const jwt =require('jsonwebtoken')

const User = require("../models/user");  //import userschema fromm models folde
const { object } = require("joi");
const { response } = require("express");
const Token =require("../models/token");
const { JsonWebTokenError } = require("jsonwebtoken");

//signup api
router.post("/signup", (req, res, next) => {
  var response ={ }
  var token ={ }
  var crypto = require('crypto');
  var nodemailer = require('nodemailer');
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        response = {
          success: false,
          message: 'you are already registered please login',
          data: null
       }
        
        res.send(response)

      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            response = {
              success: false,
              message: JSON.stringify(err),
              data: null
           }
           res.send(response)
            
           
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              firstName:req.body.firstName,
              lastName:req.body.lastName,
              email: req.body.email,
              password: hash
            });
  
            console.log(user);

            user.save().then(result => {
                console.log(result);
                response={
                  success: true,
                  message: 'signup success',
                  data: {
                    first_name :result.get('firstName'),
                    last_name :result.get('lastName'),
                    email:result.get('email'),
                   }
                }
                res.send(response);
                
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});



// login api

router.post("/login", (req, res, next) => {

  var response ={ }
  
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        response= {
          success: false,
          message: 'email not registered with us',
           data: null
         }
        res.send(response)
      
      }
    
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          response = {
            success: false,
            message: JSON.stringify(err),
            data: null
          }
          
          res.send(response)
         
        } else {

          if (result) {
            const token =jwt.sign({
              email:user[0].email,
              userId:user[0]._id

            },process.env.JWT_KEY,{
              expiresIn:"1h"
            }
          );
             response={
              success: true,
              message: 'login success',
              data: {
                first_name: user[0].firstName,
                last_name:user[0].lastName,
                email:user[0].email
               },
               token:token,
            }
            
             res.send (response)
          } else {

            response = {
              success: false,
              message: 'Incorrect Password',
              data: null
            }
            
            res.send(response)
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});


  
//   send verification code api

router.post("/verification-code", (req, res, next) =>{
var response={ };

var otp = Math.floor((Math.random() * 1000000) + 1);

    console.log(otp)

    User.findOne({email: req.body.email},(error, user)=>{
      if(error){
        response={
          success: false,
          message: JSON.stringify(error),
          data:null
        }
        res.send(response);
      } else {
        if(user !== null){
              var transporter = nodemailer.createTransport({
                service: 'gmail',
                port: 465,
                secure: true,
                  auth: { user: 'varalakshmi.garidipuri@gmail.com', pass: 'dimplelakshmi07' },
                  tls: {
                  //do not fail on invalid certs
                rejectUnauthorized: false
              },
              });
          
              var mailOptions = {
                from: '"BC"<varalakshmi.garidipuri@gmail.com>',
                to : req.body.email,
                subject : "Please confirm your Email account",
                html : `<div>OTP: ${otp}</div>` 
              }
          
              transporter.sendMail(mailOptions, function(error){
                if(error){
                                                
                res.send(JSON.stringify(error));
                                                    
                }
              })
            
          
          
              response={
                success: true,
                message: 'email sent',
                data:{
                  otp: otp,
                  _id: user.get('_id')
                }
              }
              res.send(response);
        } else {
          response={
            success: false,
            message: 'please signup, you have not found in our records',
            data:null
          }
          res.send(response);
        }
      }
    })
   
   
 
})

// password  update api


router.post('/password_reset', function(req, res) {
  console.log(req.body);
  var response = {}
  User.findOne({_id: req.body._id},(error, user)=>{
    if(error){
      response={
        success: false,
        message: JSON.stringify(error),
        data:null
      }
      res.send(response);
    } else {
      if(user !== null){
        
        bcrypt.hash(req.body.newpassword, 10, (err, hash) => {

          User.updateOne({_id: req.body._id},{$set:{password: hash}},(error)=>{
            if(error){
              response={
                success: false,
                message: JSON.stringify(error),
                data:null
              }
              res.send(response);
            } else {
              response={
                success: true,
                message: 'You have updated the password successfully',
                data:null
              }
              res.send(response);
            }
          })

        });
      } else {
        response={
          success: false,
          message: 'you have not found in our records',
          data:null
        }
        res.send(response);
      }
    }
  })
});
module.exports = router ;
const mongoose = require('mongoose');
const { string } = require('joi');

const UserSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email:{ type:String ,
        required:true, 
        unique:true},

    password :String,
    firstName :String,
    lastName :String
});


module.exports = mongoose.model('User',UserSchema)
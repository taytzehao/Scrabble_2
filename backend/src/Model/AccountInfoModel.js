const mongoose = require('mongoose');
const crypto = require('crypto');

var accountschema=mongoose.Schema({
    username: String,
    email: String,
    password:String,
    googlelogin:Boolean,
    
})

module.exports =mongoose.model('accountinfo',accountschema)
const ResetTokenModel = require('./Model/ResetTokenModel');
const Mongoosehelper = require('./Helper/Mongoosehelper').DataService;
const emailSender=require("./Mail.js")
const express=require("express")
let router= express.Router()

router.route("/forgot").post(async (req,res)=>{
    
    const user=await Mongoosehelper.findByEmail(req.body.email)
    if (user){
        
        const resetToken = await Mongoosehelper.createPasswordResetToken(user._id);
        emailSender.sendforgotpassword(user.email,user.username,user._id,resetToken)
        res.sendStatus(200)
    }
});

router.route("/reset").post( async (req,res)=>{
    console.log("REQ>BODY",req.body)
    await Mongoosehelper.changePassword(req.body.userid, req.body.password);
    await Mongoosehelper.deletePasswordResetToken(req.params.resetToken);
    res.send(true)
});

module.exports = {router};
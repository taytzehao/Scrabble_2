var path=require('path')
var env=require('dotenv').config({path:path.resolve(__dirname, '../src/.env')})


var express=require('express');
var bcrypt= require('bcrypt')

var jwt=require('jsonwebtoken')
var app=express()
var http = require('http').Server(app)
var mongoose = require('mongoose')
var cors = require('cors');



var dburl="mongodb+srv://taytzehao:oVhrwlJx6eyGVfq1@cluster0.g8bnr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

mongoose.connect(dburl,(err)=>{
    console.log("Mongoose is connected", err)
})








app.use(cors());
app.use(express.static(__dirname))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

const resetpassword=require("./Resetpassword.js")
app.use("/forgotpassword",resetpassword.router)
app.listen(5000,() => {
    console.log('server is listening on port')
})

async function comparePassword(dbpassword,candidatePassword){
    return  bcrypt.compare(candidatePassword,dbpassword)
}

var accountinfo=require("./Model/AccountInfoModel.js")

app.get('/login', async (req,res) => { 
    const data=JSON.parse(req.query.values)
    let profile=await accountinfo.findOne({username:data.username})
    
    if (! profile)
        profile=await accountinfo.findOne({email:data.username})
    if (! profile)
        res.send({logged:false})
    else{
    comparePassword(profile.password,data.password).then(response=> {
        
        if (response){ 
            profile.password=undefined
            res.send({logged:response,profile:profile}) }
        else{
            res.send({logged:response})
            }})}
})

app.post('/login',(req,res)=>{
    
    const user=req.body.username
    
    const accessToken=jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'10m' })
    const refreshToken = jwt.sign(user,process.env.REFRESH_TOKEN_SECRET)
    res.json({accessToken:accessToken,refreshToken:refreshToken})

})
function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization']
    const token =authHeader && authHeader.plit(' ')[1]
    if (token==null) return res.send({logged:false})

    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if (err) return res.send({logged:false})
        req.user=user
        next()
    })
}

const { OAuth2Client } = require('google-auth-library');
const { notDeepEqual } = require('assert');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
app.post("/api/v1/auth/google", async (req, res) => {
    const { token }  = req.body
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const { name, email, picture } = ticket.getPayload();    

    let profile=accountinfo
    
    if(await profile.findOne({email:email})){
        console.log("EMAIL PRESENT")
        let user=await profile.findOne({email:email})
        (user.password)? delete user.password : null
        res.send({logged:true,profile:user})
    }else{
        let variance_num=0
        let extendedname=name
        while(!await profile.findOne({username:extendedname})){
            extendedname=name+variance_num.toString()
            variance_num+=1
            
        }
        let save_profile=new accountinfo({username:extendedname,email:email,googlelogin:true})
        save_profile.save((err)=>{
            if (err)
                res.sendStatus(500)
            
            res.send({logged:true,profile:save_profile})
        })
        
    }
})



app.get('/signup', async (req,res) => { 
    const emailavailable= await accountinfo.exists({email:req.query.email})
    res.send(!emailavailable)
})

app.post('/signup',async (req,res) =>{


 let profileinfo= new accountinfo({...req.body,googlelogin:false})
 let temp =profileinfo.password
    profileinfo.password = await bcrypt.hash(profileinfo.password,10)
    bcrypt.compare(temp,profileinfo.password).then(res=>console.log("bcrypt compare:", res))
    profileinfo.save((err)=>{
        if (err)
            sendStatus(500)
        
        res.sendStatus(200)
    })
})





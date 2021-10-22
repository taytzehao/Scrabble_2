var express=require('express');
const app = require('express')()
const http = require('http').createServer(app)
var cors = require('cors');
app.use(cors());
app.use(express.json())
const io = require('socket.io')(http,{cors: {origin: '*',}})
var mongoose = require('mongoose')
var dburl="mongodb+srv://taytzehao:oVhrwlJx6eyGVfq1@cluster0.g8bnr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
var checkWord = require('check-word'),
words= checkWord('en');
mongoose.set('useFindAndModify', false);
mongoose.connect(dburl,(err)=>{
    console.log("Mongoose is connected", err)
})
var gamesschema=mongoose.Schema({
    Room_id: String,
    Players: {
        1:{Username:String,Score:Number,Tiles:Array},
        2:{Username:String,Score:Number,Tiles:Array},
        3:{Username:String,Score:Number,Tiles:Array},
        4:{Username:String,Score:Number,Tiles:Array}
    },  
    Start:Boolean    
})

var gameinfo=mongoose.model('gameinfo',gamesschema)

app.post("/new_game",(req,res)=>{
    const Room_id = Date.now()
    
    
    const new_game= new gameinfo({Room_id:Room_id})
    new_game.save((err)=>{
        if (err){
            res.sendStatus(500)
        }else{
            res.status(200).send(Room_id.toString())
       }   })
})


app.get("/search_rooms",async (req,res)=>{
    const room_ids = await gameinfo.find({"Players.4.Username":{"$exists":false}}).select(['Room_id'])
    res.send(room_ids)
})

app.put("/join_room",async (req,res)=>{
    try{
    const room = await gameinfo.findOne({Room_id:req.body.room_id}).exec()

    let player_num=0
    for (let key=1;key<= Object.keys(room.Players).length;key++){
        if(room.Players[key].Username){    
            player_num+=1
        }
    }
    player_num+=1
    let update_string="Players."+player_num.toString()
    res.sendStatus(200)
    }catch(err){
        console.log("This is error:",err)
    }
})


app.get("/get_added_players",async(req,res)=>{
    let entered_players=await gameinfo.findOne({Room_id:req.query.room_id}).select(['Players'])
    let entered_list=[]
    for (let i=1;i<=Object.keys(entered_players.Players).length;i++){
        
        if (entered_players.Players[i].Username){
            entered_list.push(entered_players.Players[i])
        }
    }
    
    res.send(entered_list)
})

app.put("/add_player",async(req,res)=>{
    let entered_players=await gameinfo.findOne({Room_id:req.body.room_id}).select(['Players'])
    let num=0
    for (let i=1;i<=Object.keys(entered_players.Players).length;i++){
        
        if (entered_players.Players[i].Username){
            num+=1
        }
    }
    let update_string="Players."+(num+1).toString()+".Username"
    let update_string2="Players."+(num+1).toString()+".Score"
    let update_string3="Players."+(num+1).toString()+".Tiles"
    try{
        await gameinfo.findOneAndUpdate({Room_id:req.body.room_id},
        {$set:{[update_string]:req.body.username,[update_string2]:0,[update_string3]:req.body.tiles}})
            
        
    }catch(err){
        res.send(err)
    }
})

app.put("/challenge",)

io.on('connection',socket =>{ 
    socket.on("emit_join_game",(username,room_id)=>{
        
        socket.join(room_id)
        socket.to(room_id).emit("join_game",username)
    })
    socket.on("emit_new_player",(socket_in)=>{
        socket.join(socket_in.room_id)
        socket.to(socket_in.room_id).emit("incoming_new_player",{username:socket_in.username,tiles:socket_in.tiles})
    })
    socket.on("emit_challenge_player",(socket_in)=>{
        let room_id=socket_in.room_id
        let result=[]
        console.log("SOCKET IN",socket_in)
        for (let i=0;i<socket_in.challenge_words.length;i++){
            result.push({word:socket_in.challenge_words[i],result:words.check(socket_in.challenge_words[i].toLowerCase())})        
        }
        console.log("REULST",result)
        io.to(room_id).emit("challenge_player",{challenger_username:socket_in.challenger_username,
                                                challenge_index:socket_in.challenge_index,
                                                result:result})
    })
    socket.on("emit_updated_score",(socket_in)=>{
        let room_id=socket_in.room_id
        delete socket_in.room_id
        socket.to(room_id).emit("update_player_score",socket_in)
    })
    socket.on("emit_draw",(socket_in)=>{
        let room_id=socket_in.room_id
        delete socket_in.room_id
        socket.to(room_id).emit("update_player_draw",socket_in)
    })
    socket.on("emit_drop_container",(socket_in)=>{
        let room_id=socket_in.room_id
        delete socket_in.room_id
        socket.to(room_id).emit("drop_tile_container",socket_in)
    })
    socket.on("emit_drop_block",(socket_in)=>{
        let room_id=socket_in.room_id
        
        delete socket_in.room_id
        socket.join(room_id)
        socket.to(room_id).emit("drop_tile_block",socket_in)
    })
    socket.on("emit_fail_return",(socket_in)=>{
        let room_id=socket_in.room_id
        delete socket_in.room_id
        socket.to(room_id).emit("fail_return",socket_in)
    })
    socket.on("emit_delete_tile",(socket_in)=>{
        let room_id=socket_in.room_id
        delete socket_in.room_id
        io.to(room_id).emit("delete_tile",socket_in)
    })
    
    socket.on('disconnect',()=>{
        //socket.broadcast.emit("player_disconnet",players[socket.id])
        //delete players[socket.id] 
    })

})

http.listen(5500, function() {
    console.log('listening on port 5500')
  })
import React, {useState,useContext,useEffect,useRef} from 'react';
import {UserContext,SocketContext} from '../../UserContext.js'
import {GamesContext,BlocksContext,PlayerListContext,SachetContext} from '../GamesContext.js'
import {games_sachet} from '../Gamespage.js'
import './Actionbar.css'

function Draw_button(values){
    const [drawActive,setdrawActive]=useState(false) 
    const websocket=useContext(SocketContext)
    const {profile,setprofile}=useContext(UserContext)
    const {playerlistState,setplayerlistState}=useContext(PlayerListContext)
    const {gameState,setgameState}=useContext(GamesContext)   
    const {sachetState,setsachetState}=useContext(SachetContext)   
    const playerlistRef=useRef(null);
    const gamestateRef=useRef(null);
    const sachetstateRef=useRef(null);
    playerlistRef.current=playerlistState
    gamestateRef.current=gameState
    sachetstateRef.current=sachetState
    
    const drawstyle={opacity:(drawActive) ?  1: 0.5 }


    function Draw(){
      let sachet={...sachetstateRef.current}
      Object.setPrototypeOf( sachet,sachetstateRef.current )
      var drawn_tiles=playerlistRef.current[gamestateRef.current.player_turn].draw(sachet)
      let return_tiles=playerlistRef.current[gamestateRef.current.player_turn].delete_list
      for (let i=0;i<return_tiles.length;i++){
        return_tiles[i].canDrop=false
        return_tiles[i].canDrag=false
        return_tiles[i].container_index=undefined
        return_tiles[i].board_index=undefined
        return_tiles[i].placed=false
        return_tiles[i].just_added=false
      }
      console.log("DRAWN TILES",drawn_tiles)
      
      sachet.add_by_tiles(return_tiles)
      let tempdeletelist=playerlistRef.current[gamestateRef.current.player_turn].delete_list
      setplayerlistState((prevplayerlist=>{
        let newplayerlist=[...prevplayerlist]
        newplayerlist[gamestateRef.current.player_turn].tiles=newplayerlist[gamestateRef.current.player_turn].tiles.concat(drawn_tiles)
        newplayerlist[gamestateRef.current.player_turn].delete_list=[]
        return newplayerlist
      }))
     
      values.next_funct(sachet)
      
      websocket.current.emit("emit_draw",{  
        room_id:gamestateRef.current.room_id,
        player_turn:gamestateRef.current.player_turn,
        drawn_tiles:drawn_tiles,
        return_tiles:tempdeletelist
      })
      }
      useEffect(()=>{
        console.log("WEBSOCKET ONE",websocket.current)
        
        websocket.current.on("update_player_draw",(socket_out)=>{
          let sachet2={...sachetstateRef.current}
          Object.setPrototypeOf( sachet2,sachetstateRef.current )
          sachet2.add_by_tiles(socket_out.return_tiles)
          sachet2.remove_by_tiles(socket_out.drawn_tiles)
          setplayerlistState((prevplayerlist=>{
            let newplayerlist=[...prevplayerlist]
            newplayerlist[gamestateRef.current.player_turn].draw_by_tiles(socket_out.drawn_tiles)
            newplayerlist[gamestateRef.current.player_turn].delete_list=[]
            return newplayerlist
          }))
        values.next_funct(sachet2)
      })},[])

    useEffect(()=>{
     
        if(gamestateRef.current.player_turn==gamestateRef.current.your_index && 
          !gamestateRef.current.just_added.length && 
          playerlistState[gameState.your_index].delete_list.length){
        
          setdrawActive(true)
        }else{
         
          setdrawActive(false)
        }
      },[,gameState,playerlistState])

    return(
        <div>
            <button type="button" className="draw_button gamesbtn" style={drawstyle} onClick={Draw} disabled={!drawActive}>Draw</button> 
        </div>)
}

export default Draw_button
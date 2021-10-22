import React, {useState,useContext,useEffect,useRef} from 'react';
import {UserContext,SocketContext} from '../../UserContext.js'
import {GamesContext,BlocksContext,PlayerListContext,AnalyticsDataContext,SachetContext} from '../GamesContext.js'
import Challenge_status from "./Challenge_status.js";
import Draw_button from "./Draw_button.js";
import Score_button from "./Score_button.js";

function Action_bar() {
  const {playerlistState,setplayerlistState}=useContext(PlayerListContext)
  const {gameState,setgameState}=useContext(GamesContext)   
  const {boardState,setboardState}=useContext(BlocksContext)
  const {analyticsdataState,setanalyticsdataState}=useContext(AnalyticsDataContext)
  const {sachetState,setsachetState}=useContext(SachetContext)  
  const websocket=useContext(SocketContext) 
  const playerlistRef=useRef(null);
  const gamestateRef=useRef(null);
  const boardstateRef=useRef(null);
  const sachetstateRef=useRef(null);
  const analyticsdataRef=useRef(null);
  playerlistRef.current=playerlistState
  gamestateRef.current=gameState
  boardstateRef.current=boardState
  sachetstateRef.current=sachetState
  analyticsdataRef.current=analyticsdataState
  
  function next_turn(updated_sachet,challenged_words=[],challenge_index=undefined){
    let newanalyticsdata=[...analyticsdataRef.current];
      let analytics_index;
      let just_added_list=gamestateRef.current.just_added;
      for (let index of just_added_list){
        analytics_index=newanalyticsdata.findIndex(data=>{
          return data.alphabet==boardstateRef.current.blocks[index].content.alphabet;})

        if(newanalyticsdata[analytics_index].num==1) { newanalyticsdata.splice(analytics_index,1)}else{newanalyticsdata[analytics_index].num-=1}
      }
    setboardState((prevboardState=>{
      let tempboardState={...prevboardState}
      gamestateRef.current.just_added.forEach(index=>{
          tempboardState.blocks[index].content.just_added=false
          tempboardState.blocks[index].content.challenge=true
          tempboardState.blocks[index].content.active=false
          tempboardState.blocks[index].content.canDrag=false
          tempboardState.blocks[index].content.canDrop=false
          tempboardState.blocks[index].content.index=null
      })
      return tempboardState
  }))
    setanalyticsdataState(newanalyticsdata)
    setgameState((prevgameState=>({...prevgameState,
      turn_num:prevgameState.turn_num+1, 
      challenge_words:challenged_words,
      challenge_index:challenge_index,
      just_added:[]     
  }))) 
    setsachetState(updated_sachet)
  }
  function fail_return_state(player_turn,return_tiles,just_added){
    setplayerlistState((prevplayerlistState=>{
      let newplayerlistState=[...prevplayerlistState]
      newplayerlistState[player_turn].tiles=newplayerlistState[player_turn].tiles.concat(return_tiles)
      return newplayerlistState
    }))
    setboardState((prevboardState=>{
      let newboardState={...prevboardState}
      just_added.forEach(index=>{
        newboardState.blocks[index].content=null
      })
      return newboardState
    }))
    setgameState((prevgameState=>({...prevgameState,
      just_added:[]     
  }))) 
  }

  useEffect(()=>{
    websocket.current.on("fail_return",(socket_out)=>{
      fail_return_state(socket_out.player_turn,socket_out.return_tiles,socket_out.just_added)
  })},[])
  

  return (
    <div>
      <Challenge_status />
    <div className="Action_bar">
      <Score_button next_funct={next_turn} fail_return_funct={fail_return_state}/>
      <Draw_button next_funct={next_turn}/>   
    </div>
    </div>)
     
}

export default Action_bar;
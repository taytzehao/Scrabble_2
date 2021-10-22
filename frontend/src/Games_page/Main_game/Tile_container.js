import React,{useContext,useState,useEffect,useRef} from 'react';
import {useDrag} from 'react-dnd';
import './Tile_container.css'
import {DndProvider,useDrop} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {GamesContext,PlayerListContext,BlocksContext} from '../GamesContext.js'
import {Tile} from '../Sachet.js'
import Delete_logo from './Delete_logo.js'
import Challenge_button from './Challenge_button.js'
import {SocketContext, UserContext} from '../../UserContext.js';


const positions=[[2,1,"row","horizontal"],[1,2,"column","vertical"],[2,3,"row","horizontal"],[3,2,"column","vertical"]];

function Tile_container(value) {
    const websocket=useContext(SocketContext)
    const {profile,setprofile}=useContext(UserContext)
    const {gameState,setgameState}=useContext(GamesContext)
    const {playerlistState,setplayerlistState}=useContext(PlayerListContext)
    const {boardState,setboardState}=useContext(BlocksContext)
    const playerlistRef=useRef(null);
    const gamestateRef=useRef(null);
    const boardstateRef=useRef(null);
    playerlistRef.current=playerlistState
    gamestateRef.current=gameState
    boardstateRef.current=boardState

    const container_name="tile_container "+positions[value.player_num][3]
    const containerstyle={
      gridColumn:positions[value.player_num][0],
      gridRow:positions[value.player_num][1],
    }
    const holderstyle={
      display:"flex",
      flexDirection:positions[value.player_num][2]
    }
    useEffect(()=>{
      
      let temp_playerlist=[...playerlistState]
     
      if(gamestateRef.current.player_turn==gamestateRef.current.your_index){
        temp_playerlist[gamestateRef.current.your_index].active=true
        temp_playerlist[gamestateRef.current.your_index].delete_active=true
        temp_playerlist[gamestateRef.current.your_index].tiles.forEach(tile=>{tile.active=true})
        setplayerlistState(temp_playerlist)
      }else{
        temp_playerlist[gamestateRef.current.your_index].active=false
        temp_playerlist[gamestateRef.current.your_index].delete_active=false
        temp_playerlist[gamestateRef.current.your_index].tiles.forEach(tile=>{tile.active=false})
        setplayerlistState(temp_playerlist)
      }
    },[,gameState.player_turn])

    
    return (
      
      <div className={container_name} style={containerstyle}>
          <div className="name_display">{playerlistState[value.player_num].username}</div>   
          <div className="score_display">{playerlistState[value.player_num].score}</div> 
          <div className="tile_holder" style={holderstyle}>
              
                {playerlistState[value.player_num].tiles.map((tile,pos)=>(
                  <Tile tile={tile} orientation={positions[value.player_num][3]} key={pos}/>
                ))}  
              
          </div>
          <Challenge_button player_num={value.player_num}/>
          <Delete_logo player_num={value.player_num}/>               
      </div>
    );
    
  }
    
export default Tile_container;
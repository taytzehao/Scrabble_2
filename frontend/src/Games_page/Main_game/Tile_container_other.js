import React, {useContext,useState} from 'react';
import './Tile_container.css'
import {UserContext} from '../../UserContext.js'
import {GamesContext,Invisible_tile_context,PlayerListContext} from '../GamesContext.js'
import {Tile} from '../Sachet.js'

const positions=[[2,1,"row","horizontal"],[1,2,"column","vertical"],[2,3,"row","horizontal"],[3,2,"column","vertical"]];

function Tile_container_other(value) {
  const [tile_visibility,set_tile_visibility]=useState("hidden")
  const {profile,setprofile}=useContext(UserContext)
  const {gameState,setgameState}=useContext(GamesContext)  
  const {playerlistState,setplayerlistState}=useContext(PlayerListContext)
  const container_name="tile_container "+positions[value.player_num][3]
  const containerstyle={
    gridColumn:positions[value.player_num][0],
    gridRow:positions[value.player_num][1],
  }
  const holderstyle={
    display:"flex",
    flexDirection:positions[value.player_num][2]
  }
  

  return (
    
    <div className={container_name} style={containerstyle}>
        <div className="name_display">{playerlistState[value.player_num].username}</div>   
        <div className="score_display">{playerlistState[value.player_num].score}</div> 
        <div className="tile_holder" style={holderstyle}>  
          <Invisible_tile_context.Provider value={{tile_visibility,set_tile_visibility}}>
            {playerlistState[value.player_num].tiles.map((tile,pos)=>(
            <Tile tile={tile} key={pos}/>
            ))}        
          </Invisible_tile_context.Provider>
        </div>      
    </div>
  );
  }

export default Tile_container_other
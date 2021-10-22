import {UserContext,SocketContext} from '../../UserContext.js'
import {Board} from './Board.js'
import Tile_container from './Tile_container.js'
import Tile_container_other from './Tile_container_other.js'
import React, {useState,useContext,useEffect,useRef} from 'react';
import {GamesContext,Invisible_tile_context,BlocksContext,PlayerListContext,TileDropContext} from '../GamesContext.js'
import './Main_game.css';
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'




function Main_game() {
    const [tile_visibility,set_tile_visibility]=useState("visible")
    const {profile,setprofile}=useContext(UserContext)
    const {gameState,setgameState}=useContext(GamesContext)
    const {boardState,setboardState}=useContext(BlocksContext)
    const {playerlistState,setplayerlistState}=useContext(PlayerListContext)
    const websocket=useContext(SocketContext)

    const playerlistRef=useRef(null);
    const gamestateRef=useRef(null);
    const boardstateRef=useRef(null);
    playerlistRef.current=playerlistState
    gamestateRef.current=gameState
    boardstateRef.current=boardState
    function container_container_state(player_index,drop_container){
      setplayerlistState((prevplayerlist=>{
        let temp_playerlist=[...prevplayerlist]
        temp_playerlist[player_index].tiles=drop_container
        return temp_playerlist
    }))
    }

    function board_container_state(player_index,drag_block,drop_container,just_added){
      console.log("DRAG BLOCk", drag_block)
      setboardState((prevblockstate=>{
        let tempblockstate={...prevblockstate}
        tempblockstate.blocks[drag_block.index]=drag_block
        return tempblockstate
        }))


      setplayerlistState((prevplayerlist=>{
          let temp_playerlist=[...prevplayerlist]
          temp_playerlist[player_index].tiles=[...drop_container]
          console.log("TEMP PLAYER LIST",temp_playerlist)
          return temp_playerlist
      }))
      setgameState(prevgamestate=>({
          ...prevgamestate,
          just_added:just_added      
        }))
    }

    useEffect(()=>{
      websocket.current.on("drop_tile_container",(socket_out)=>{
          if(socket_out.drag_block){
            console.log("DROP CoNTAINER",socket_out.drop_container)
            board_container_state(socket_out.player_index,socket_out.drag_block,socket_out.drop_container,socket_out.just_added)
          }else{
            container_container_state(socket_out.player_index,socket_out.drop_container)
          } 
      })
    },[])

      return (
        
        <div className="main_game">
          <TileDropContext.Provider value={{board_container_state,container_container_state}}>
            <Invisible_tile_context.Provider value={{tile_visibility,set_tile_visibility}}>
                <DndProvider backend={HTML5Backend}>
                  {playerlistState.map((Player,pos)=>(
                  (Player.username==profile.username)?
                  <Tile_container player_num={pos} key={pos}/>:
                  <Tile_container_other player_num={pos} key={pos}/>))}
                  <Board blocks_class={boardState}/>  
                </DndProvider>
            </Invisible_tile_context.Provider>    
          </TileDropContext.Provider>                                   
        </div>
      );
  }
    
export default Main_game;
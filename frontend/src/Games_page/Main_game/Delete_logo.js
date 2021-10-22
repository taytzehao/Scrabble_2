import React,{useContext,useState,useEffect,useRef} from 'react';
import {useDrag} from 'react-dnd';
import './Tile_container.css'
import {DndProvider,useDrop} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {GamesContext,PlayerListContext,BlocksContext} from '../GamesContext.js'
import {Tile} from '../Sachet.js'
import {SocketContext, UserContext} from '../../UserContext.js';
import delete_logo from '../../UI_component/delete.png';

function Delete_logo(value){
  const websocket=useContext(SocketContext)
  const {profile,setprofile}=useContext(UserContext)
  const {gameState,setgameState}=useContext(GamesContext)
  const {playerlistState,setplayerlistState}=useContext(PlayerListContext)
  const {boardState,setboardState}=useContext(BlocksContext)
  const drawstyle={opacity:(playerlistState[value.player_num].delete_active) ?  1: 0.5 }
  const playerlistRef=useRef(null);
  const gamestateRef=useRef(null);
  const boardstateRef=useRef(null);
  playerlistRef.current=playerlistState
  gamestateRef.current=gameState
  boardstateRef.current=boardState

    const [{isOver},drop] = useDrop(()=>({
      accept: "active",
      collect:monitor=>({
          isOver:!!monitor.isOver(),
      }),
      canDrop: ()=>playerlistRef.current[gamestateRef.current.your_index].active,
      drop: (tile)=> addDelete(tile),
    })); 
    function container_delete_state(drag_container,delete_tile){
      setplayerlistState(prevplayerlistState=>{
        let newplayerlistState=[...prevplayerlistState]
        newplayerlistState[gamestateRef.current.player_turn].tiles=drag_container
        newplayerlistState[gamestateRef.current.player_turn].delete_list.push(delete_tile)    
        return newplayerlistState
      })
    }

    function board_delete_state(drag_block,delete_tile){
      setboardState(prevboardState=>{
        let newboardState={...prevboardState}
        newboardState.blocks[drag_block.index]=drag_block
        return newboardState
      })
      setplayerlistState(prevplayerlistState=>{
        let newplayerlistState=[...prevplayerlistState] 
        newplayerlistState[gamestateRef.current.player_turn].delete_list.push(delete_tile) 
        return newplayerlistState
      })
      setgameState((prevgameState=>({...prevgameState,
        just_added:prevgameState.just_added.filter(board_index=>board_index!=drag_block.index)    
      }))) 
    }
  
      function addDelete(drop_tile){
        let drag_block
        let drag_container
        let delete_tile
        if (drop_tile.board_index) {
          delete_tile=boardstateRef.current.blocks[drop_tile.board_index].content 
          delete_tile.container_index=undefined
          delete_tile.board_index=undefined
          delete_tile.placed=false
          delete_tile.just_added=false
          drag_block=boardstateRef.current.blocks[drop_tile.board_index]
          drag_block.content=null
        }else{
          delete_tile=playerlistRef.current[gamestateRef.current.player_turn].tiles[drop_tile.container_index]
          delete_tile.container_index=undefined
          drag_container=playerlistRef.current[gamestateRef.current.player_turn].tiles.filter(tile=>tile.id!=drop_tile.id);
          for (let i=0;i<drag_container.length;i++){drag_container[i].container_index=i}
        }

        websocket.current.emit("emit_delete_tile",{
          room_id:gamestateRef.current.room_id,
          player_turn:gamestateRef.current.player_turn,
          drag_block:(drop_tile.board_index==0 || drop_tile.board_index) ? drag_block : drop_tile.board_index,   
          drag_container:(drop_tile.container_index==0 || drop_tile.container_index) ? drag_container : drop_tile.container_index,
          delete_tile:delete_tile,
        })
      }
      useEffect(()=>{
        websocket.current.on("delete_tile",(socket_out)=>{
          console.log(socket_out)
          if(socket_out.hasOwnProperty("drag_block")){
            board_delete_state(socket_out.drag_block,socket_out.delete_tile)
          }else{
            container_delete_state(socket_out.drag_container,socket_out.delete_tile)
          } 
      })
      },[])
    
      return(
          <div>
              <img src={delete_logo} ref={drop} className="delete_img" visibility={drawstyle} />
          </div>
      )
}

export default Delete_logo
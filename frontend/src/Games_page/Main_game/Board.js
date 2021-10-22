import React, {useState,useContext,useEffect,useRef} from 'react';
import {useDrop} from 'react-dnd';
import './Board.css'
import {UserContext,SocketContext} from '../../UserContext.js'
import {GamesContext,PlayerListContext,BlocksContext} from '../GamesContext.js';
import {Tile} from '../Sachet.js'
import io from 'socket.io-client';
import _ from "lodash";


const block_type = {
  dw:{className:"bl dw",innerHTML:"Double Word Score"},
  tw:{className:"bl tw",innerHTML:"Triple Word Score"},
  dl:{className:"bl dl",innerHTML:"Double Letter Score"},
  tl:{className:"bl tl",innerHTML:"Triple Letter Score"},
  st:{className:"bl dw st",innerHTML:""},
  default:{className:"bl default",innerHTML:""},
};

function Block(values){ 
    const websocket=useContext(SocketContext)
    const {profile,setprofile}=useContext(UserContext)
    const {playerlistState,setplayerlistState}=useContext(PlayerListContext)
    const {gameState,setgameState}=useContext(GamesContext)   
    const {boardState,setboardState}=useContext(BlocksContext)
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
        canDrop: ()=> !values.block.content && gamestateRef.current.player_turn==gamestateRef.current.your_index ,
        drop: (tile)=> addTile(tile),
    })); 
    const dragOverstyle={
        backgroundColor: isOver && "grey"
    } 
    
    const addTile=(tile_drag)=>{
        let drag_block;
        let drag_container;
        let tempdragcontainer;
        let drop_block=boardstateRef.current.blocks[values.block.index];
        let update_just_added=gamestateRef.current.just_added;
        if (tile_drag.container_index || tile_drag.container_index==0){
            let tile=playerlistRef.current[gamestateRef.current.your_index].tiles[tile_drag.container_index]
            if(tile.alphabet==" "){
                
                let wrong_input=true;
                while(wrong_input){
                    let alphabet=window.prompt("Please enter your desired alphabet");
                    if (alphabet.length == 1 && alphabet.toLowerCase() != alphabet.toUpperCase()){
                        alphabet = alphabet.toUpperCase();
                        tile.alphabet=alphabet
                        wrong_input = false;
                    }
                }
            }  
            tile.placed=true
            tile.just_added=true
            tile.container_index=undefined
            tile.board_index=values.block.index
            tile.canDrop=false

            
            drop_block.content=tile
            drag_container=playerlistRef.current[gamestateRef.current.your_index].tiles
            drag_container.splice(tile_drag.container_index,1)
            for (let i=0;i<drag_container.length;i++){drag_container[i].container_index=i}

           update_just_added.push(values.block.index)
           
            values.container_board(drag_container,drop_block,update_just_added)
            tempdragcontainer=_.cloneDeep(drag_container)

            for (let i=0;i<tempdragcontainer.length;i++){
                tempdragcontainer[i].canDrag=false
                tempdragcontainer[i].canDrop=false
        }
        }else{
            
            drag_block=boardstateRef.current.blocks[tile_drag.board_index]
            let tile=drag_block.content

            tile.container_index=undefined
            tile.board_index=values.block.index
            drop_block.content=tile
            drag_block.content=null

            let initial_index=update_just_added.indexOf(drag_block.index)

            update_just_added.splice(initial_index,1)
            update_just_added.push(drop_block.index)

            values.board_board(drag_block,drop_block,update_just_added)
            
        }
        
        websocket.current.emit("emit_drop_block",{
            room_id:gamestateRef.current.room_id,
            drag_container:(tile_drag.container_index==0 || tile_drag.container_index)? tempdragcontainer : tile_drag.container_index,
            drag_block:(tile_drag.board_index==0 || tile_drag.board_index) ? drag_block : tile_drag.board_index,
            drop_block:drop_block,
            just_added:update_just_added,
        })
        
    }
    
    
    return(
        <div className={block_type[values.block.type].className} ref={drop} style={dragOverstyle}>
            {values.block.content &&  <Tile tile={values.block.content}/>}
            {block_type[values.block.type].innerHTML}
        </div>)   
    
}



class Blocks{
    constructor(){
        this.blocks=[]
        this.row_length = 15;
        this.column_length = 15;
        this.tw_coordinate=['14,14','7,14','0,14','14,7','0,7','14,0','7,0','0,0']
        this.dw_coordinate=[,'13,13','1,13','12,12','2,12','11,11','3,11','10,10',
                '4,10','10,4','4,4','11,3','3,3','12,2','2,2','13,1','1,1']

        this.dl_coordinate=['11,14', '3,14', '8,12', '6,12', '14,11', '7,11', '0,11', 
                '12,8', '8,8', '6,8', '2,8', '11,7', '3,7', '12,6', '8,6', '6,6', 
                '2,6', '14,3', '7,3', '0,3', '8,2', '6,2', '11,0', '3,0']


        this.tl_coordinate=['9,13', '5,13', '13,9', '9,9', '5,9', '1,9', '13,5', '9,5',
                  '5,5', '1,5', '9,1', '5,1']

        this.st_coordinate=['7,7']
        this.construct_blocks()
    }
    construct_blocks(){
        let pos=0
        for (let y=0 ; y<this.row_length ; ++y){  

            for (let x=0 ; x<this.column_length ; ++x){
                
                let temp_coord=x.toString() + "," + y.toString();    
                switch(temp_coord){
                    case this.tw_coordinate[this.tw_coordinate.length-1]:
                        this.blocks.push({type:"tw",content:null,index:pos,})       
                        this.tw_coordinate.pop();
                        break;
                    case this.dw_coordinate[this.dw_coordinate.length-1]:
                        this.blocks.push({type:"dw",content:null,index:pos})   
                        this.dw_coordinate.pop();
                        break;
                    case this.dl_coordinate[this.dl_coordinate.length-1]:
                        this.blocks.push({type:"dl",content:null,index:pos})   
                        this.dl_coordinate.pop();
                        break;
                    case this.tl_coordinate[this.tl_coordinate.length-1]:
                        this.blocks.push({type:"tl",content:null,index:pos})   
                        this.tl_coordinate.pop();
                        break;
                    case this.st_coordinate[this.st_coordinate.length-1]:
                        this.blocks.push({type:"st",content:null,index:pos})   
                        this.st_coordinate.pop();
                        break;
                    default:
                        this.blocks.push({type:"default",content:null,index:pos})   
                        break;
                } 
                pos+=1
            }
        }
        delete this.tw_coordinate
        delete this.dw_coordinate
        delete this.dl_coordinate
        delete this.tl_coordinate
        delete this.st_coordinate
    }
}




function Board(values) {
    const websocket=useContext(SocketContext)
    const {profile,setprofile}=useContext(UserContext)
    const {gameState,setgameState}=useContext(GamesContext)
    const {boardState,setboardState}=useContext(BlocksContext)
    const {playerlistState,setplayerlistState}=useContext(PlayerListContext)
    const socket2=useRef()
    socket2.current=io.connect("http://localhost:5500")
    const playerlistRef=useRef(null);
    const gamestateRef=useRef(null);
    const boardstateRef=useRef(null);
    playerlistRef.current=playerlistState
    gamestateRef.current=gameState
    boardstateRef.current=boardState

    function container_board_state(drag_container,drop_block,just_added){
      setboardState((prevblockstate=>{
        let tempblockstate={...prevblockstate}
        tempblockstate.blocks[drop_block.index]=drop_block
        return tempblockstate
        }))
      setgameState(prevgamestate=>({
          ...prevgamestate,
          just_added:just_added,      
      }))
      setplayerlistState((prevplayerlist=>{
          let temp_playerlist=[...prevplayerlist]
          temp_playerlist[gamestateRef.current.player_turn].tiles=drag_container
          return temp_playerlist
      }))
    }

    function board_board_state(drag_block,drop_block,just_added){
      setboardState((prevblockstate=>{
        let tempblockstate={...prevblockstate}
        tempblockstate.blocks[drag_block.index]=drag_block
        tempblockstate.blocks[drop_block.index]=drop_block
        return tempblockstate
        }))
      setgameState(prevgamestate=>({
        ...prevgamestate,
        just_added:just_added,      
      }))
    }
    
    useEffect(()=>{
        websocket.current.on("drop_tile_block",(socket_out)=>{
          console.log("SOCKET OUT DROP TILE BLOCK",socket_out)
          if(socket_out.drag_container){
            container_board_state(socket_out.drag_container,socket_out.drop_block,socket_out.just_added)
          }else{
            board_board_state(socket_out.drag_block,socket_out.drop_block,socket_out.just_added)
          } 
        })
      
    },[])

    return (
    <div className="board_holder">
    <div className="board">
        {values.blocks_class.blocks.map((block,pos)=>(
    <Block block={block} 
           container_board={container_board_state} 
           board_board={board_board_state} 
           key={pos}/>
    ))}
    </div>
    </div>)
     
  }

export {Board,Blocks}
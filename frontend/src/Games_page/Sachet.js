import React,{useContext,useEffect,useRef} from 'react';
import './Sachet.css';
import {Invisible_tile_context,GamesContext,PlayerListContext,BlocksContext,TileDropContext} from './GamesContext.js';
import {useDrag,useDrop} from 'react-dnd'
import { games_sachet } from './Gamespage';
import {SocketContext} from '../UserContext.js';
import _ from "lodash";



const alphabet_data = [["A",9,1],["B",2,3],["C",2,3],["D",4,2],["E",12,1],["F",2,4],["G",3,2],
                        ["H",2,4],["I",9,1],["J",1,8],["K",1,5],["L",4,1],["M",2,3],["N",6,1],
                        ["O",8,1],["P",2,3],["Q",1,10],["R",6,1],["S",4,1],["T",6,1],["U",4,1],
                        ["V",2,4],["W",2,4],["X",1,8],["Y",2,4],["Z",1,10],[" ",2,0]]

function Tile (values){
    const {tile_visibility,set_tile_visibility}=useContext(Invisible_tile_context)
    const {playerlistState,setplayerlistState}=useContext(PlayerListContext)
    const {gameState,setgameState}=useContext(GamesContext)   
    const {boardState,setboardState}=useContext(BlocksContext)
    const {board_container_state,container_container_state}=useContext(TileDropContext)
    const websocket=useContext(SocketContext)
    const playerlistRef=useRef(null);
    const gamestateRef=useRef(null);
    const boardstateRef=useRef(null);
    playerlistRef.current=playerlistState
    gamestateRef.current=gameState
    boardstateRef.current=boardState

    playerlistRef.current=playerlistState


    const ref = useRef(null)
   
    const [{isDragging},drag]=useDrag({
        type: (values.tile.active) ? "active":"inactive",
        item:{
            type:(values.tile.active) ? "active":"inactive",
            id:values.tile.id,
            container_index: values.tile.container_index,
            board_index: values.tile.board_index
        },
        canDrag:()=>values.tile.canDrag,
        collect: monitor => ({
            isDragging: !! monitor.isDragging()
        })
    })
    
    const [,drop]=useDrop({
        accept: ["active","inactive"],
        canDrop:()=>values.tile.canDrop,
        drop(item, monitor) {
            if (!ref.current || item.id==values.tile.id) {
                return;
            }
            let dragIndex=item.container_index;
            let hoverIndex = values.tile.container_index;

            let drop_container=playerlistRef.current[gamestateRef.current.your_index].tiles;
            let drag_container;
            let drag_block;
            let update_just_added;

            let drag_coordinate;
            let hover_coordinate;
            let drag_tile;

            const hoverBoundingRect = ref.current?.getBoundingClientRect();            
            const clientOffset = monitor.getClientOffset();
            if(values.orientation=="horizontal"){
                drag_coordinate=clientOffset.x;
                hover_coordinate=hoverBoundingRect.left+hoverBoundingRect.width/2
            }else{
                drag_coordinate=clientOffset.y;
                hover_coordinate=hoverBoundingRect.top-hoverBoundingRect.height/2
            }
            if(item.container_index || item.container_index==0){
                let hoverTile=playerlistRef.current[gamestateRef.current.your_index].tiles[hoverIndex]
                drag_tile=playerlistRef.current[gamestateRef.current.your_index].tiles[dragIndex]
                
                drop_container.splice(dragIndex,1)
                hoverIndex=drop_container.findIndex(tile=>tile.id==hoverTile.id)
                
                if(drag_coordinate<hover_coordinate){
                    drop_container.splice(hoverIndex,0,drag_tile)
                }else{
                    drop_container.splice(hoverIndex+1,0,drag_tile)
                }

                for (let i=0;i<drop_container.length;i++){drop_container[i].container_index=i}
                container_container_state(gamestateRef.current.your_index,drop_container)
                
            }else{
                drag_tile=boardstateRef.current.blocks[item.board_index].content

                

                if(drag_tile.score==0){drag_tile.alphabet=" "};
                drag_tile.canDrop=true;
                drag_tile.placed=false
                drag_tile.just_added=false;
                drag_tile.board_index=undefined;

                drag_block=boardstateRef.current.blocks[item.board_index]
                drag_block.content=null

                if(drag_coordinate<hover_coordinate){
                    drop_container.splice(hoverIndex,0,drag_tile)
                }else{
                    drop_container.splice(hoverIndex+1,0,drag_tile)
                }
                for (let i=hoverIndex;i<drop_container.length;i++){drop_container[i].container_index=i}
                update_just_added=gamestateRef.current.just_added.filter(index=>index!=item.board_index)
                board_container_state(gamestateRef.current.your_index,drag_block,drop_container,update_just_added)
                
            }
            let tempdropcontainer=_.cloneDeep(drop_container)

            for (let i=0;i<tempdropcontainer.length;i++){
                tempdropcontainer[i].canDrag=false
                tempdropcontainer[i].canDrop=false
            }
            websocket.current.emit("emit_drop_container",{
                room_id:gamestateRef.current.room_id,
                player_index:gamestateRef.current.your_index,
                drag_block:(item.board_index==0 || item.board_index) ? drag_block : item.board_index,
                drop_container:tempdropcontainer,
                just_added:(item.board_index==0 || item.board_index) ? update_just_added: item.board_index
            })
        },
    })
    
    let tile_name="game_tile"
    if(values.tile.placed){tile_name = tile_name + " placed"}
    const content_style={visibility:tile_visibility}
    const dragstyle={opacity:(isDragging) ? 0.5 : 1}
    drop(drag(ref))
    return(
        <div className={tile_name} ref={ref} style={dragstyle}>
        <p style={content_style}>{values.tile.alphabet}</p>
        <p style={content_style}>{values.tile.score}</p>
        </div>
    )
}

class Sachet{
    constructor(){
        this.tiles=[]
        this.initialize()
    }
    initialize(){
        let tile_id=0
        for (let i=0;i<alphabet_data.length;i++){
            for (let j=0;j<alphabet_data[i][1];j++){
                this.tiles.push({
                    alphabet:alphabet_data[i][0],
                    score:alphabet_data[i][2],
                    id:tile_id,
                    placed:false,
                    just_added:false,
                    challenge:false,
                    active:true,
                    canDrag:false,
                    canDrop:false,
                    container_index:undefined,
                    board_index:undefined
                }) 
                tile_id+=1 
            } 
        }
    }
    remove_by_tiles(tiles){    
        this.tiles=this.tiles.filter(function(e) {return this.findIndex(tile=>tile.id==e.id) < 0;},tiles)
    }
    add_by_tiles(tiles){
        this.tiles=this.tiles.concat(tiles)
    }
} 
const analytics_data = []
for (let i=0;i<alphabet_data.length;i++){
    analytics_data.push({alphabet:alphabet_data[i][0],num:alphabet_data[i][1]})
}
export {analytics_data,Tile}

export default Sachet;


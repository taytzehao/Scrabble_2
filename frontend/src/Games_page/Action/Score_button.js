import React, {useState,useContext,useEffect,useRef} from 'react';
import {UserContext,SocketContext} from '../../UserContext.js'
import {GamesContext,BlocksContext,PlayerListContext,AnalyticsDataContext,SachetContext} from '../GamesContext.js'
import sachet, { analytics_data } from '../Sachet.js';
import {games_sachet} from '../Gamespage.js'
import './Actionbar.css'

function Score_button(values){
  const {profile,setprofile}=useContext(UserContext)
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
  playerlistRef.current=playerlistState
  gamestateRef.current=gameState
  boardstateRef.current=boardState
  sachetstateRef.current=sachetState
  const [scoreActive,setscoreActive]=useState(false)
  const scorestyle={opacity:(scoreActive) ? 1 : 0.5}
    useEffect(()=>{ 
        if(gameState.player_turn==gameState.your_index && !playerlistState[gameState.your_index].delete_list.length && gamestateRef.current.just_added.length){
          setscoreActive(true)
        }else{
          setscoreActive(false)
        }
      },[,gameState])
    
    function fail_return(player_turn){
      let return_tiles=[]
      for (let i=0;i<gamestateRef.current.just_added.length;i++){
        return_tiles.push(boardstateRef.current.blocks[gamestateRef.current.just_added[i]].content)
        return_tiles[i].just_added=false
        return_tiles[i].placed=false
        return_tiles[i].canDrop=true
        return_tiles[i].container_index=playerlistRef.current[player_turn].tiles.length+i
      }
      websocket.current.emit("emit_fail_return",{
        return_tiles:return_tiles,
        room_id:gamestateRef.current.room_id,
        just_added:gamestateRef.current.just_added,
        player_turn:gamestateRef.current.player_turn
      })
      values.fail_return_funct(gamestateRef.current.player_turn,return_tiles,gamestateRef.current.just_added)
      
    }
    function tile_coordinate(index){
      let row = Math.floor(index / boardstateRef.current.column_length)
      let column=index%boardstateRef.current.column_length
      return [row,column]
    }
    function tile_index(coordinate){
      return coordinate[0]*boardstateRef.current.column_length+coordinate[1];
    }
    function check_board(coordinate){
      if (coordinate[0]<0 || coordinate[0]>=boardstateRef.current.row_length || coordinate[1]<0 || coordinate[1]>=boardstateRef.current.column_length){
        return false
    }
      let index=tile_index(coordinate)
      if(boardstateRef.current.blocks[index].content){
        if(boardstateRef.current.blocks[index].content.placed){return true}
      }
      return false

    }

    function check_validity(){
      if (gamestateRef.current.turn_num==0){
        let start_block=boardstateRef.current.blocks.find(block=>block.type=="st")
        if(!start_block.content){
          alert("Please place the tile on the start block.")
          fail_return(gamestateRef.current.player_turn)
          return false
        }
      }else{
        let attached=false;
        for(let i=0;i<gamestateRef.current.just_added.length;i++){
          let coor=tile_coordinate(gamestateRef.current.just_added[i])
          let up,down,left,right;
          up=down=left=right=coor;

          up[0]=up[0]-1;
          down[0]=down[0]+1;
          left[1]=left[1]-1;
          right[1]=right[1]+1;

            if (check_board(up)||check_board(down)||check_board(left)||check_board(right)){
                attached=true;
                break;
            }    
        }
        if (attached==false){
          alert ("Please place your tiles adjacent to an existing tile.")
          fail_return(gamestateRef.current.player_turn)
          return false;
        }
      }
      if(gamestateRef.current.just_added.length>1){
        let first_coordinate=tile_coordinate(gamestateRef.current.just_added[0]);
        let second_coordinate=tile_coordinate(gamestateRef.current.just_added[1]);

        if (first_coordinate[0]==second_coordinate[0] ){
          var direction ="horizontal";
      } else if (first_coordinate[1]==second_coordinate[1]){
          var direction ="vertical";
      } else {
          alert ("Your sequence of tiles must either be in horizontal or vertical form, adjacent to each other.")
          fail_return(gamestateRef.current.player_turn)
          return false;
      }
      for (let i =1 ; i<gamestateRef.current.just_added;i++){
        if (direction=="horizontal"){
             if ((first_coordinate[1]+1)!=second_coordinate[1] && first_coordinate[0]==second_coordinate[0]){
                
                let temp_second_coord=first_coordinate;
                temp_second_coord[1]=temp_second_coord[1]+1;
                while(temp_second_coord[1]<=second_coordinate[1]){
                    if (!check_board(temp_second_coord)){
                        alert("Please do not skip");
                        fail_return(gamestateRef.current.player_turn)
                        return false;
                        }
                    temp_second_coord[1]=temp_second_coord[1]+1;
                    }
                    
                }

             else if(first_coordinate[0]!=second_coordinate[0]){
                alert("Please place all in horizontal")
                fail_return(gamestateRef.current.player_turn)
                return false;
            } 
        } else if (direction=="vertical"){
            if((first_coordinate[0]+1)!=second_coordinate[0] && first_coordinate[1]==second_coordinate[1]){
                
                let temp_second_coord=first_coordinate;
                temp_second_coord[0]=temp_second_coord[0]+1;
                while(temp_second_coord[0]<=second_coordinate[0]){
                    if (!check_board(temp_second_coord)){
                        alert("Please do not skip");
                        fail_return(gamestateRef.current.player_turn)
                        return false;
                        }
                    temp_second_coord[0]=temp_second_coord[0]+1;
                    }
                    
                }
            } else if ((first_coordinate[1])!=second_coordinate[1]){
                alert("Please place all in vertical")
                fail_return(gamestateRef.current.player_turn)
                return false;
            }
        
        
        first_coordinate=second_coordinate;
        if ((i+1)!=gamestateRef.current.just_added.length){
            second_coordinate=tile_coordinate(gamestateRef.current.just_added[i+1])
            }
        }
      }
      return true
    }

    function vertical_words(new_tile,up,down){

      let vertical_word_tile=[];
      let prepend_up=false;
  
      if (check_board(up)){
          prepend_up=true
          vertical_word_tile.push([boardstateRef.current.blocks[new_tile]])
              while(check_board(up)){
                  vertical_word_tile[vertical_word_tile.length-1].unshift(boardstateRef.current.blocks[tile_index(up)])
                  up[0]=up[0]-1;
          }
          
      } 
      if (check_board(down)){
          if (prepend_up==false){
              vertical_word_tile.push([boardstateRef.current.blocks[new_tile]])}
  
          while(check_board(down)){
              vertical_word_tile[vertical_word_tile.length-1].push(boardstateRef.current.blocks[tile_index(down)])
              down[0]=down[0]+1;
          }
      }
      return vertical_word_tile
  }
  function horizontal_words(new_tile,left,right){
  
      let horizontal_word_tile=[];
      let prepend_left=false;
      
      if (check_board(left)) {
          prepend_left=true
          horizontal_word_tile.push([boardstateRef.current.blocks[new_tile]])
          while(check_board(left)){
              horizontal_word_tile[horizontal_word_tile.length-1].unshift(boardstateRef.current.blocks[tile_index(left)])
              left[1]=left[1]-1;
              }
          }
          
      if (check_board(right)){
  
          if (prepend_left==false){
          horizontal_word_tile.push([boardstateRef.current.blocks[new_tile]])}
  
          while(check_board(right)){
              horizontal_word_tile[horizontal_word_tile.length-1].push(boardstateRef.current.blocks[tile_index(right)])
              right[1]=right[1]+1;
              }
          }
      return horizontal_word_tile
          
      }

    function set_words_block(new_tiles){
      let words=[];
  
      let coor=tile_coordinate(gamestateRef.current.just_added[0])
      let up,down,left,right
      up=coor.slice(0);
      down=coor.slice(0);
      left=coor.slice(0);
      right=coor.slice(0);
  
      up[0]=up[0]-1;
      down[0]=down[0]+1;
      left[1]=left[1]-1;
      right[1]=right[1]+1;
      
      if(new_tiles.length==1){      
  
          horizontal_words(gamestateRef.current.just_added[0],left,right).forEach(horizontal_word=>words.push(horizontal_word));
          vertical_words(gamestateRef.current.just_added[0],up,down).forEach(vertical_word=>words.push(vertical_word));
          
      }else{
       
          if (tile_coordinate(gamestateRef.current.just_added[0])[0]==tile_coordinate(gamestateRef.current.just_added[1])[0]){
              //horizontal
              horizontal_words(gamestateRef.current.just_added[0],left,right).forEach(horizontal_word=>words.push(horizontal_word));
              for (let i =0 ; i<new_tiles.length;i++){
                  
                  vertical_words(new_tiles[i],up,down).forEach(vertical_word=>words.push(vertical_word));
          
              }
          }else{
              //vertical
              vertical_words(new_tiles[0],up,down).forEach(vertical_word=>words.push(vertical_word));
              for (let i =0 ; i<new_tiles.length;i++){
                  horizontal_words(new_tiles[i],left,right).forEach(horizontal_word=>words.push(horizontal_word));       
              }
          } 
          }
  
      return words
  }

  function new_block_score(new_block){
    let new_block_s=0
    let double_word=0;
    let triple_word=0;
    
    if (new_block.type=="dw" || new_block.type=="st"){
        new_block_s += new_block.content.score;
        double_word += 1;
    } else if (new_block.type=="tw"){
        new_block_s += new_block.content.score;
        triple_word += 1;
    } else if (new_block.type=="dl"){
        new_block_s += new_block.content.score*2
    } else if (new_block.type=="tl"){
        new_block_s += new_block.content.score*3
    }else{
        new_block_s += new_block.content.score
    }
    return [new_block_s,double_word,triple_word]
}
function old_block_score(old_block){  
    let old_tile_s=0;
    old_tile_s += old_block.content.score
    return old_tile_s

}

function word_score(word_blocks){

    let individual_word_score=0;
    var double_word=0;
    var triple_word=0;
  
    for (let z=0; z<word_blocks.length; z++){

        if (word_blocks[z].content.just_added==true){
            let scores=new_block_score(word_blocks[z])
            individual_word_score+=scores[0];
            double_word+=scores[1];
            triple_word+=scores[2]
        } else{
            individual_word_score+=old_block_score(word_blocks[z]);
        }}
    
    if (double_word!=0){
        individual_word_score = individual_word_score * 2 * double_word;
    }

    if (triple_word!=0){
        individual_word_score = individual_word_score * 3 * triple_word;
    }

    
    return individual_word_score 
}

  function additionalscore(words){
  
    let extra_score=0; 
    
    for (let y=0;y<words.length;y++){
        extra_score+=word_score(words[y])
    }

    if (gamestateRef.current.just_added.length==7){
        extra_score+=50;
    }  
    return extra_score
}

    function Score(){
      
      if(check_validity()){
          let words_block=set_words_block(gamestateRef.current.just_added)
          let updated_score=playerlistRef.current[gamestateRef.current.player_turn].score+additionalscore(words_block);
          let sachet={...sachetstateRef.current}
          Object.setPrototypeOf( sachet,sachetstateRef.current )
          let drawn_tiles=playerlistRef.current[gamestateRef.current.player_turn].draw(sachet)   

          setplayerlistState(prevplayerlistState=>{
            let newplayerlistState=[...prevplayerlistState]
            newplayerlistState[gamestateRef.current.player_turn].score=updated_score
            newplayerlistState[gamestateRef.current.player_turn].draw_by_tiles(drawn_tiles);
            return newplayerlistState
          })
          let words_alphabet=[]
          for (let i=0;i<words_block.length;i++){
            words_alphabet.push([""])
            for(let y=0;y<words_block[i].length;y++){
              words_alphabet[i]+=words_block[i][y].content.alphabet
            }
          }
          values.next_funct(sachet,words_alphabet,gamestateRef.current.player_turn)
          
          websocket.current.emit("emit_updated_score",{
            room_id:gamestateRef.current.room_id,
            player_turn:gamestateRef.current.player_turn,
            score:updated_score,
            challenge_words:words_alphabet,
            challenge_index:gamestateRef.current.player_turn,
            drawn_tiles:drawn_tiles})
      }

    }
    useEffect(()=>{
      websocket.current.on("update_player_score",(socket_out)=>{
        
        let sachet2={...sachetstateRef.current}
       
        Object.setPrototypeOf( sachet2,sachetstateRef.current )
        

        sachet2.remove_by_tiles(socket_out.drawn_tiles)
        setplayerlistState(prevplayerlistState=>{
          let newplayerlistState=[...prevplayerlistState]
          newplayerlistState[socket_out.player_turn].score=socket_out.score
          newplayerlistState[gamestateRef.current.player_turn].draw_by_tiles(socket_out.drawn_tiles)
          return newplayerlistState
        })

        values.next_funct(sachet2,socket_out.challenge_words,socket_out.challenge_index)
      })
    },[])
    return(
        <div>
            <button type="button" className="score_button gamesbtn" style={scorestyle} onClick={Score} disabled={!scoreActive}>Score</button> 
        </div>)
}

export default Score_button
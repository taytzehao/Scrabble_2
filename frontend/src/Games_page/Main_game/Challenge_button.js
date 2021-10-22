import React,{useContext,useState,useEffect,useRef} from 'react';
import {useDrag} from 'react-dnd';
import axios from 'axios';
import './Tile_container.css'
import {DndProvider,useDrop} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {GamesContext,PlayerListContext,BlocksContext} from '../GamesContext.js'
import {Tile} from '../Sachet.js'
import {SocketContext, UserContext} from '../../UserContext.js';
import _ from "lodash";


function Challenge_button(value){

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
    const challengestyle={
        opacity:(playerlistState[value.player_num].challenge_active) ?  1: 0.5 
    }

    function challenge(){
        websocket.current.emit('emit_challenge_player',
        {
            room_id:gamestateRef.current.room_id,
            challenger_username:playerlistRef.current[gamestateRef.current.your_index].username,
            challenge_index:gamestateRef.current.challenge_index,
            challenge_words:gamestateRef.current.challenge_words,
        })
    }

    useEffect(()=>{
        websocket.current.on("challenge_player",(socket_out)=>{
            let alert_string
            if(socket_out.result.find(element=>element.result==false)){
                alert_string=playerlistRef.current[gamestateRef.current.challenge_index].username +" cannot play for the next turn. The following words are invalid: \n"
                for (let false_word of socket_out.result){alert_string+= false_word.word+"\n"}
                alert(alert_string)
                setgameState(prevgamestate=>({...prevgamestate,
                    challenge_index:undefined,
                    challenge_words:[],
                    skip_indexes:[...prevgamestate.skip_indexes,prevgamestate.challenge_index]
                }))
            }else{
                alert_string="Challenge attempted on "+
                            playerlistRef.current[gamestateRef.current.challenge_index].username +" by "+
                            socket_out.challenger_username+". All words placed by "+
                            playerlistRef.current[gamestateRef.current.challenge_index].username + " are correct."
                alert(alert_string)
                setgameState(prevgamestate=>({...prevgamestate,
                    challenge_index:undefined,
                    challenge_words:[],
                }))
            }
        })
    },[])

    useEffect(()=>{
        let your_index_challenge = (gamestateRef.current.your_index==playerlistState.length-1) ? 0 :
                                    gamestateRef.current.your_index+1
        let temp_playerlist=[...playerlistRef.current]
        console.log("CHANGE CHALLENGE STATE",temp_playerlist)
        if(gamestateRef.current.your_index!=gamestateRef.current.challenge_index && 
            (gamestateRef.current.challenge_index || gamestateRef.current.challenge_index==0)){ 
            temp_playerlist[gamestateRef.current.your_index].challenge_active=true
            setplayerlistState(temp_playerlist)
          }else{
            temp_playerlist[gamestateRef.current.your_index].challenge_active=false
            setplayerlistState(temp_playerlist)
          }
    },[,gameState])
    
    return(
        <div>
            <button type="button" 
                    className="challengebtn gamesbtn" 
                    onClick={challenge}
                    style={challengestyle} 
                    disabled={!playerlistState[value.player_num].challenge_active} >
            Challenge</button> 
        </div>
    )
}

export default Challenge_button
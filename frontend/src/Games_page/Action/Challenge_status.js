import React, {useState,useContext,useEffect,useRef} from 'react';
import {UserContext,SocketContext} from '../../UserContext.js'
import {GamesContext,BlocksContext,PlayerListContext,AnalyticsDataContext,SachetContext} from '../GamesContext.js'
import Draw_button from "./Draw_button.js";
import Score_button from "./Score_button.js";

function Faulty_word(value){

  return(
    <div>{value.word}</div>
  )
}

function Challenge_status() {
  const {playerlistState,setplayerlistState}=useContext(PlayerListContext)
  const {gameState,setgameState}=useContext(GamesContext)   

  const playerlistRef=useRef(null);
  const gamestateRef=useRef(null);

  playerlistRef.current=playerlistState
  gamestateRef.current=gameState

  let challenged_username=(gamestateRef.current.challenge_index || gamestateRef.current.challenge_index==0)&&
                            playerlistRef.current[gamestateRef.current.challenge_index].username

  return (
    <div className="Challenge_status">
      Challenged player: {challenged_username} <br />
      Words placed: {gameState.challenge_words.map((word,index)=>(
          <Faulty_word key={index} word={word} /> 
      ))}
    </div>)
     
}

export default Challenge_status
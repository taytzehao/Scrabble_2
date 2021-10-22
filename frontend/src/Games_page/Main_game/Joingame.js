import {UserContext,SocketContext} from '../../UserContext.js'
import io from 'socket.io-client'
import React, {useState,useContext,useEffect,useRef} from 'react';
import {useParams} from "react-router-dom";

function usePrevious(value) {
    // The ref object is a generic container whose current property is mutable ...
    // ... and can hold any value, similar to an instance property on a class
    const ref = useRef();
  
    // Store current value in ref
    useEffect(() => {
      if (value.length){
        ref.current = value
      }else{
        ref.current = [1]
        ref.current.pop()
        
        
      }
      ;
    }, [value]); // Only re-run if value changes
    
    // Return previous value (happens before update in useEffect above)
    return ref.current;
  }

function Joingame() {
    const {profile,setprofile}=useContext(UserContext)
    const [other_player,set_other_player] = useState([])
    const room_id=useParams().room_id
    let prev_other_player = usePrevious(other_player);
    const websocket=useContext(SocketContext)


    useEffect(() => {
        websocket.current.emit("emit_join_game",profile.username,room_id)
        websocket.current.on("join_game", username=>{set_other_player(oldArray => [...oldArray,username + " has joined the game"])})
    },[])
    
    useEffect(() => {
      
        if(prev_other_player){
        if (other_player.length > prev_other_player.length) {
          setTimeout(() => {
            set_other_player(prevActions => (
              // Filter out the item with the matching index
              prevActions.filter((value, i) => i !== 0)))
          }, 3000);
        }}
      }, [other_player]);
    
    if(other_player){
      return (
        <div className="Joingame">
              {other_player.map((Sentence)=><span>{Sentence}</span>)}              
        </div>
      )}else{return(null)}
  }

export default Joingame;
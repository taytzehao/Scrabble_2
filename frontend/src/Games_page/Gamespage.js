import './Gamespage.css';
import React, {useState,useContext,useEffect,useRef,useMemo} from 'react';
import axios from 'axios';
import Popup from 'reactjs-popup';
import {SocketContext, UserContext} from '../UserContext.js';
import {Player} from './Player.js'
import {Link,useParams} from 'react-router-dom';
import io from 'socket.io-client';
import Joingame from './Main_game/Joingame.js'
import Action_bar from './Action/Actionbar.js'
import Alphabet_analytics from './Alphabet_analytics/Alphabet_analytics.js'
import Main_game from './Main_game/Main_game.js' 
import Sachet, { analytics_data } from './Sachet.js'
import {GamesContext,BlocksContext,PlayerListContext,AnalyticsDataContext,SachetContext} from './GamesContext.js'
import {Blocks} from './Main_game/Board.js'

function Gamespage() {
    const {profile,setprofile}=useContext(UserContext)
    const websocket=useContext(SocketContext)
    const [boardState,setboardState]=useState(new Blocks())
    const [renderAction,setrenderAction]=useState(false)
    const [gameState,setgameState]=useState({
      room_id:useParams().room_id,
      gamestarted:false,
      turn_num:0,
      player_turn:0,
      player_num:0, 
      your_index:0,
      skip_indexes:[],
      challenge_index:undefined,
      challenge_words:[],
      endgame:false,
      just_added:[]
    })
    const [playerlistState,setplayerlistState]=useState([])
    const [analyticsdataState,setanalyticsdataState]=useState(analytics_data)
    const [sachetState,setsachetState]=useState(new Sachet())
    const playerlistRef=useRef(null);
    const gamestateRef=useRef(null);
    const boardstateRef=useRef(null);
    const sachetstateRef=useRef(null);
    playerlistRef.current=playerlistState
    gamestateRef.current=gameState
    boardstateRef.current=boardState
    sachetstateRef.current=sachetState
    useEffect(()=>{
      
      axios.get('http://localhost:5500/get_added_players',{params: {room_id:gameState.room_id,username:profile.username}}).then((res)=>{
        let sachet={...sachetstateRef.current}
        Object.setPrototypeOf( sachet,sachetstateRef.current )

        let temp_player_list=[]
        for (let i=0;i<res.data.length;i++){
          let temp_player=new Player(res.data[i].Username)
          temp_player.draw_by_tiles(res.data[i].Tiles)
          sachet.remove_by_tiles(res.data[i].Tiles)
          temp_player_list.push(temp_player)
        }

        const your_player=new Player(profile.username,true)
        let drawn_tiles=your_player.draw(sachet)
        your_player.tiles=drawn_tiles
        axios.put("http://localhost:5500/add_player",{
          username:your_player.username,
          tiles:drawn_tiles,
          room_id:gamestateRef.current.room_id
        })
        temp_player_list.push(your_player)
        
        
        websocket.current.emit("emit_new_player",{
          username:your_player.username,
          tiles:your_player.tiles,
          room_id:gamestateRef.current.room_id})
        
        websocket.current.on("incoming_new_player", (res)=>{
          let sachet2={...sachetstateRef}
          Object.setPrototypeOf( sachet2,sachetstateRef.current )
          console.log("INCOMING NEW PLAYER",res)
          let temp_player=new Player(res.username)
          temp_player.draw_by_tiles(res.tiles)
          sachet2.remove_by_tiles(res.tiles)
          
          let lis=[...playerlistRef.current,temp_player]
          console.log("TEMP PLAYER",lis)

          setplayerlistState(lis)
          setgameState(prevgamestate=>({...prevgamestate,
            player_num: prevgamestate.player_num+1
          }))
          setsachetState(sachet2)
        })
        
        setgameState(prevgamestate=>({...prevgamestate,
          player_num: prevgamestate.player_num+temp_player_list.length,
          your_index:temp_player_list.length-1,
          player_turn:prevgamestate.turn_num%(prevgamestate.player_num+temp_player_list.length)
        }))
        
        setplayerlistState(prevplayerlist=>[...prevplayerlist,...temp_player_list])
        setsachetState(sachet)
        setrenderAction(true)
        
    
    })},[])

    useEffect(()=>{
      setgameState( prevgamestate=>({...prevgamestate,
      player_turn:prevgamestate.turn_num%prevgamestate.player_num
    }))}
    ,[,gameState.turn_num])
    
    useEffect(()=>{
      if (gamestateRef.current.skip_indexes.includes(gamestateRef.current.player_turn)){
        setgameState(prevgamestate=>({...prevgamestate,
          turn_num:prevgamestate.turn_num+1,
          skip_indexes:prevgamestate.skip_indexes.filter(index=>index!=prevgamestate.player_turn)
        }))
      }else{
      setplayerlistState(prevplayerlist=>{
        let newplayerlist=[...prevplayerlist]
        for (let i=0;i<newplayerlist.length;i++){
          (i==gameState.player_turn) ? newplayerlist[i].active=true : newplayerlist[i].active=false
        }
        return newplayerlist
    })}}
    ,[gamestateRef.current.player_turn])

    
    
      return (     
        <div className="Games_page">
            <Joingame/>
            <SachetContext.Provider value={{sachetState,setsachetState}}>
              <AnalyticsDataContext.Provider value={{analyticsdataState,setanalyticsdataState}}>
                <GamesContext.Provider value={{gameState,setgameState}}>
                  <PlayerListContext.Provider value={{playerlistState,setplayerlistState}}>
                    <BlocksContext.Provider value={{boardState,setboardState}}>
                      <div className="Main_divider">
                        <Alphabet_analytics />
                        <Main_game />
                        {renderAction && <Action_bar />}
                      </div> 
                    </BlocksContext.Provider>
                  </PlayerListContext.Provider>   
                </GamesContext.Provider>   
              </AnalyticsDataContext.Provider>  
              </SachetContext.Provider>                
        </div>
      );
  }

  
export default Gamespage;
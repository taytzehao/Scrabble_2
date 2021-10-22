import './Mainpage.css';
import React, {useState,useContext,useEffect} from 'react';
import axios from 'axios';
import Popup from 'reactjs-popup';
import {UserContext} from '../UserContext.js'
import Rooms from './Rooms.js';
import {Link, useParams, useHistory} from 'react-router-dom';



function Mainpage() {
  const {profile,setprofile}=useContext(UserContext)
  const history=useHistory()
  const [rooms,setrooms] =useState([])

  useEffect(()=>{
    axios.get('http://localhost:5500/search_rooms').then((res)=>{
        console.log(res)
        setrooms(res.data)})
  },[])
  function create_new_game(){
    console.log("NEW GAME")
    axios.post('http://localhost:5500/new_game',{username:profile.username}).then((res)=>{
    history.push('/Gamespage/'+res.data) })
  }

function random_room(){
  let room_selected=rooms[rooms.length*Math.random()<<0].Room_id
  axios.put('http://localhost:5500/join_room',{username:profile.username,room_id:room_selected}).then(history.push('/Gamespage/'+room_selected))
}

function logout(){
  setprofile(null)
  history.push("/")
}

    return (
      <div className="main">
            <div className="main-section">
                <div id="menu">
                  <div className="pageitem" onClick={create_new_game}>New Game</div>
                  <div className="pageitem" onClick={random_room}>Random Room</div>
                  <Rooms history={history}/>
                  <div className="pageitem" onClick={logout}>Logout</div>
              </div>
            </div>
        </div>
    );
}
  
  export default Mainpage;
  
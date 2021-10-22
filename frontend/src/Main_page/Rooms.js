import React, {useState,useContext,useRef,useEffect} from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import {UserContext} from '../UserContext.js';
import './Rooms.css'
import './Mainpage.css'
import Draggable from 'react-draggable';

const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

function Rooms(prop) {
    const [room_modal_open,set_room_modal_open] = useState(false)
    const {profile,setprofile}=useContext(UserContext)
    const [rooms,setrooms] =useState([])
    let [room_selected,setroom_selected] =useState('')
    const [fresh,setfresh] =useState(true)
    let room_focus =useRef()
    
    useEffect(()=>{
        axios.get('http://localhost:5500/search_rooms').then((res)=>{
            console.log(res)
            setrooms(res.data)})
    },[fresh])

    function room_select(server_element){
        if (room_focus.current) 
          room_focus.current.style.backgroundColor="white"
        room_focus.current = server_element.target
        setroom_selected(room_focus.current.innerHTML)
       
        room_focus.current.style.backgroundColor="green"       
    }

    function join_room(){
        if (room_selected){
            axios.put('http://localhost:5500/join_room',{username:profile.username,room_id:room_selected}).then(prop.history.push('/Gamespage/'+room_selected))
                    
        }else{
            alert("Please select a room to join first!")
        }
    }

      return (
        <div>
        <div className="pageitem" onClick={()=> set_room_modal_open(true)}> Join server </div>
        
        <Modal 
            
            style={customStyles}
            isOpen={room_modal_open}
            shouldCloseOnOverlayClick={false}
            ariaHideApp={false}
            onRequestClose={()=>set_room_modal_open(false)
            
            }>
            
            <div className="Room_container">
                <div onClick={()=>set_room_modal_open(false)} className="close_modal" title="Close Modal">&times;</div>
                <div className="Room_holder">
                    {rooms.map((room,pos)=>(
                        <div className="room" key={pos} onClick={(e)=>room_select(e)}>{room.Room_id}</div>
                    ))} 
                </div>
                <button type="button" className="refreshbtn" onClick={()=>{setfresh(!fresh)}}>Refresh</button> 
                <button type="submit" className="joinbtn" onClick={join_room}>Join Room</button> 
                <button type="button" className="cancelbtn mainpage" onClick={()=>set_room_modal_open(false)}>Cancel</button>   
            </div>
            
        </Modal>
        
        </div>
      );
  }
    
    export default Rooms;
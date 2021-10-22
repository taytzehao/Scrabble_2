import React, {useContext} from 'react';
import {UserContext} from './UserContext.js'

function Header(){
    const {profile,setprofile}=useContext(UserContext)

    return (<div className="Header">
        <p>{profile.username}</p>
    </div>   
  )
}

export default Header;
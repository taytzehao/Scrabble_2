import './Login.css';
import React, {useState, useContext,useEffect} from 'react';
import {title,Titlerender} from "./Title_div.js"
import Signup from "./Signup.js"
import axios from 'axios';
import GoogleLogin from 'react-google-login';
import {useHistory,useParams} from 'react-router-dom';
import * as Yup from 'yup';

function Resetpassword(){
    const [password,setpassword]=useState({password:"",repeatpassword:""})
    const [submitactive,setsubmitactive]=useState(false)
    const userid=useParams().userid
    const tokenid=useParams().token_id
    const history=useHistory()
    const submitstyle={
        opacity:(submitactive) ?  1: 0.5 
    }
    let schema = Yup.object().shape({
        password:Yup.string().min(6,"Password is too short - should be 6 chars minimum.").required('Password required'),
        repeatpassword:Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Required'),
      });

    function handlechange(e){
        const { name, value } = e.target;
        setpassword(prevpasswords=>({
            ...prevpasswords,
            [name]: value
          }));
        
    }
    useEffect(()=>{schema.isValid({password:password.password,repeatpassword:password.repeatpassword}).then(function(valid)
        {
            setsubmitactive(valid)
        })
    },[password])
    
    function handleresetpassword(e){
        e.preventDefault();
        let post_input={userid:userid,tokenid:tokenid,password:password.password}
        axios.post('http://localhost:5000/forgotpassword/reset',post_input).then((res)=>{
            alert("Your password has been reset. Please login with the new password")    
            history.push('/')
        })
    }

    return(
        <div className="main">
            <div className="main-section">
            <div className="login-form">
                <div className="log-content">
                    <form onSubmit={handleresetpassword}> 
                        <input type="password" name="password" id="resetpassword" placeholder="Password" onChange={handlechange} />
                        <input type="password" name="repeatpassword" id="repeatresetpassword" placeholder="Retype password" onChange={handlechange} />
                        <input type="submit" value="Submit" disabled={!submitactive} style={submitstyle}/>
                    </form>  
                    </div>
                </div>
                </div>
        </div>
    )
}

export default Resetpassword
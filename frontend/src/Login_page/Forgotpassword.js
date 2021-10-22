import './Login.css';
import React, {useState, useContext} from 'react';
import {title,Titlerender} from "./Title_div.js"
import Signup from "./Signup.js"
import axios from 'axios';
import GoogleLogin from 'react-google-login';
import {useHistory} from 'react-router-dom';
import * as Yup from 'yup';

import {UserContext} from '../UserContext.js'

function Forgotpassword(){
  const [error,seterror]=useState(false)
  let schema =Yup.object().shape({
    email:Yup.string().email('Invalid email address'),
  }) 
  const [values,setValues] =useState({email:'',})
  const history=useHistory()

  function handleChange(e){
    const { name, value } = e.target;
    setValues({[name]:value})
  }
    const handleforgotpassword = (e)=>{
      e.preventDefault()

        schema.isValid(values).then(function(valid){
          if(valid){
            seterror(false)
            axios.post('http://localhost:5000/forgotpassword/forgot',values).then((res)=>{
              console.log(res)
              alert("An email with a reset token would be sent to your email if your email is already in our database.")
              history.push('/')})
          }else{
            seterror(true)
          }
      })
    }

    return(
      <div className="main">
        <div className="main-section">
          <div className="login-form">
              <div className="log-content">
                <form onSubmit={handleforgotpassword}> 
                  <div className="Forgot_header">Forgot Password</div>
                  <input type="text" name="email" id="email" placeholder="Email" onChange={handleChange} />
                  {error ? (<div className="error">Please use a valid email</div>) : null}
                  <input type="submit" value="Submit" />
                </form>  
              </div>
            </div>
          </div>
        </div>
    )
}

export default Forgotpassword
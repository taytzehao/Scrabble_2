import './Login.css';
import React, {useState, useContext} from 'react';
import {title,Titlerender} from "./Title_div.js"
import Signup from "./Signup.js"
import axios from 'axios';
import GoogleLogin from 'react-google-login';
import {useHistory} from 'react-router-dom';
import {UserContext} from '../UserContext.js'

function validatelogin(val){
  let err={};
  if (!val.username){
    err.username="Username or Email is required"
  }
  if (!val.password){
    err.password="Password is required"
  }
  return err
}

function Login() {
  const {profile,setprofile}=useContext(UserContext)
  const [state, setstate] = useState();
  const [err, setErr] = useState({
    username:undefined,
    password:undefined,
    mismatch:undefined,
  });
  
  const history=useHistory()
  const [values,setValues] =useState({
    username:'',
    password:''
  })
  const handleChange = e => {
    const { name, value } = e.target;
    
    setValues({
      ...values,
      [name]: value
    });
  };



  const handleSubmit = (e)=>{
    
    const errors=validatelogin(values)
    
    setErr({...err,
      
      
      username:errors.username,
      password:errors.password,
      mismatch:undefined
      
    })
    
    e.preventDefault();
    
   
    if(!errors.username && !errors.password){
      axios.get('http://localhost:5000/login',{params: {values}}).
      then(res => {
        if(res.data.logged){ 
          setprofile(res.data.profile)
          history.push('/Mainpage') 
          
        }else{
            setErr({...err,
          username:undefined,
          password:undefined,
          mismatch:"Username or password do not match"          
        })    
    }})
    }
  }

  function googlelogin(res){
    axios.post('http://localhost:5000/api/v1/auth/google',{token:res.tokenId}).then(res=>{
        setprofile(res.data.profile)
        history.push('/Mainpage')     
      })
    } 

  return (
    <div className="main">
          <div className="main-section">
            <Titlerender tiles={title} />                 
              <div className="login-form">
                  <div className="log-content">
                      <form onSubmit={handleSubmit}>

                          {err.mismatch && <div className="error">{err.mismatch}</div>}
                          <input type="text" name="username" id="email" placeholder="E-mail address or username" onChange={handleChange} />
                          {err.username && <div className="error">{err.username}</div>}
                          <input type="password" name="password" id="password" placeholder="Password" onChange={handleChange}/>
                          {err.password && <div className="error">{err.password}</div>}
                          
                          <input type="submit" value="Log In" />
                          <GoogleLogin
                            className="Google_login"
                            clientId="366620039547-pd2s861cglf27p3iiu5f8epr840jbfb4.apps.googleusercontent.com"
                            buttonText="Continue with Google"
                            onSuccess={(res)=>googlelogin(res)}
                            onFailure={(res)=>googlelogin(res)}
                            cookiePolicy={'single_host_origin'}
                          />
                          <a href="http://localhost:3000/forgotpassword">Forgotten password?</a>
                          <hr />
         
                      </form>  
                      <Signup/> 
                  </div>
              </div>
            </div>
      </div>
  );
}

export default Login;

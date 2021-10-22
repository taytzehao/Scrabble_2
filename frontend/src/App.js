import React,{useState, useMemo,useRef} from 'react';
import './index.css';
import Login from './Login_page/Login.js';
import Forgotpassword from './Login_page/Forgotpassword.js';
import Resetpassword from './Login_page/Resetpassword.js';
import Mainpage from './Main_page/Mainpage.js';
import Gamespage from './Games_page/Gamespage.js';
import {BrowserRouter as Router,Route,Switch,Redirect} from 'react-router-dom';
import Header from './Header.js'
import {UserContext,SocketContext} from './UserContext.js'
import io from 'socket.io-client';



const AuthorizedRoute = ({ component: Comp, loggedIn, path, ...rest }) => {
    return (
      <Route
        path={path}
        {...rest}
        render={(props) => {
          return loggedIn ? <Comp {...props} /> : <Redirect to="/" />;
        }}
      />
    );
  };

function App(){

    const [profile,setprofile]=useState(null)
    const socket =useRef()
    socket.current=io.connect("http://localhost:5500")
    const Memoizedprofile =useMemo(()=>({profile,setprofile}),[profile,setprofile])
    return (
    <Router>
      <SocketContext.Provider value={socket}>
          <UserContext.Provider value={Memoizedprofile}>
            {profile && <Header/>}
            <Switch>
              <Route exact path="/" component={Login}/>
              <Route exact path="/forgotpassword" component={Forgotpassword}/>
              <Route exact path="/forgotpassword/reset/:userid/:token_id" component={Resetpassword}/>
              <AuthorizedRoute path="/Mainpage" loggedIn={profile} component={Mainpage} />
              <AuthorizedRoute path="/Gamespage/:room_id" loggedIn={profile} component={Gamespage} />
            </Switch>
          </UserContext.Provider>
        </SocketContext.Provider>
      </Router>)
}
//<Route path="/Mainpage" component={Mainpage} />

export default App;
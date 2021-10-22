import React from 'react';
import "./Signup.css"
import Popup from 'reactjs-popup';
import {Formik,useField,Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const MyInput = ({ label, ...props }) => {
 
  const [field, meta] = useField(props);
  
  return (
    <>
      <label htmlFor={props.id || props.name}>{label}</label>
      <input className="text-input" {...field} {...props} />
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
    </>
  );
};

function Signup(){

    return (

      <Popup
      trigger={<button className="button"> Create a new account </button>}
      modal 
      nested    
    >
      {close=>(
        <div id="id01" className="modal " >
          
          <Formik 
            initialValues={{
            username: '',
            email: '',
            password:'',
            repeatpassword:'',
          }}
          validationSchema={Yup.object({
            username: Yup.string().max(15, 'Must be 15 characters or less').required('Username Required'),
            email: Yup.string().email('Invalid email address').test('Unique Email','Email already in use', 
            function(value){return new Promise((resolve, reject) => {
                  axios.get('http://localhost:5000/signup', {params:{email:value}}).then(res => {
                  resolve(res.data)}) })
            }).required('Email Required'),
            password:Yup.string().min(6,"Password is too short - should be 6 chars minimum.").required('Password required'),
            repeatpassword:Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Required'),
          })}
          onSubmit=  {(values, { setSubmitting }) => {
            setTimeout(() => {
              alert(JSON.stringify(values, null, 2));
                axios.post("http://localhost:5000/signup",values).then(response=>{
              }).catch(error=>{
                console.log(error)
              })
              setSubmitting(false);
            }, 1000);
          }}>
          <Form className="modal-content" >
            <div className="container">
              <div className="signup_title">
              <h1>Sign Up</h1>
              <span onClick={close} className="close" title="Close Modal">&times;</span>
              </div>
              <p>Please fill in this form to create an account.</p>
              <hr />
              <MyInput label="Username" name="username" type="text" placeholder="Enter Username"/>
              <MyInput label="Email" name="email" type="text" placeholder="Enter Email"/>
              <MyInput label="Password" name="password" type="password" placeholder="Enter Password"/>
              <MyInput label="Repeat Password" name="repeatpassword" type="password" placeholder="Repeat Password"/>
        
              <p>By creating an account you agree to our <a className="legal_agreement" href="https://www.google.com/" >Terms & Privacy</a>.</p>
        
              <div className="clearfix">
                <button type="button" className="cancelbtn" onClick={close} >Cancel</button>
                <button type="submit" className="signupbtn">Sign Up</button>
              </div>
            </div>
        </Form>
        </Formik>
      </div>)}
  </Popup>
  )
}

export default Signup
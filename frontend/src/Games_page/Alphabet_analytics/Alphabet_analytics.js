import {analytics_data} from '../Sachet.js'
import React,{useRef,useContext} from 'react';
import './Alphabet_analytics.css'
import { AnalyticsDataContext } from '../GamesContext.js';

function Alphabet_analytics(){
    const {analyticsdataState,setanalyticsdataState}=useContext(AnalyticsDataContext)
    const analyticsdataRef=useRef(null);
    analyticsdataRef.current=analyticsdataState

    const analytics_style={
        display:"grid",
        gridTemplateColumns:"repeat(2,1fr)",
        gridTemplateRows:"repeat("+analyticsdataRef.length/2+",1fr)",
        gridColumn:"1",
        gridRow:"1",
        height:"95%",
        width:"100%",
        alignItems: "center",
        justifyItems: "center",
      }
    
    return(<div className="analytics_container" style={analytics_style}>
        {analyticsdataRef.current.map((alphabet_data,pos)=>(
            <div className="remainder_holder" key={pos}>{alphabet_data.alphabet} - {alphabet_data.num}</div>
        ))}
    </div>)
}

export default Alphabet_analytics
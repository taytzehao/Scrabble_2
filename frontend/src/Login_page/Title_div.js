import React from "react"

const title = [
    {letter:"S",score:"1"},
    {letter:"C",score:"3"},
    {letter:"R",score:"1"},
    {letter:"A",score:"1"},
    {letter:"B",score:"3"},
    {letter:"B",score:"3"},
    {letter:"L",score:"1"},
    {letter:"E",score:"1"}
];

function Titlerender({tiles}){
    return (
        <div>
            {tiles.map((tile,pos)=>(
        <div className="tile" key={pos}>
            <p>{tile.letter}</p>
            <p>{tile.score}</p>
        </div>
        ))}</div>
    );
}

export {title,Titlerender}

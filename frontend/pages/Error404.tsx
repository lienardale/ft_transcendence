import React from "react";
import Body from "../components/body";

function Error404(){
  return (
    <Body
    content={
      <div>
        <h1>404 - Not Found!</h1>
      </div>
    }/>
  )
}
 
export default Error404;
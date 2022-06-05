import React from "react";
import { useParams } from "react-router-dom";

function Tx() {
  const { hash } = useParams();

  return (
    <>
      <p>This is the tx page</p>
      <p>{hash}</p>
    </>
  );
}
export default Tx;

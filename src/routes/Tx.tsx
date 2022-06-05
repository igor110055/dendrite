import React from "react";
import { useSearchParams } from "react-router-dom";

function Tx() {
  const [search] = useSearchParams();

  return (
    <>
      <p>This is the tx page</p>
      <p>{search.get("hash")}</p>;
    </>
  );
}
export default Tx;

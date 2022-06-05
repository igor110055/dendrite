import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import { id as makeKappa } from "@ethersproject/hash";
import axios from "axios";

import {
  Container,
  Divider,
  UnorderedList,
  ListItem,
  Box,
  Button,
} from "@chakra-ui/react";

import { Bridge, supportedChainIds } from "@synapseprotocol/sdk";
import { id as makeKappa } from "@ethersproject/hash";

import apis from "../constants/apis.json";

const makeTable = () => {
  // const tableValues = [
  //   "Source Hash", // Hash
  //   "Dest Hash",
  //   "Source Chain",
  //   "Dest Chain",
  //   "From",
  //   "To",
  //   "Date",
  //   "CoinType",
  //   "Send Value",
  //   "Receive Value",
  //   "Status",
  // ];
  return (
    <UnorderedList mt={10}>
      <ListItem className="tableListItem">
        <span className="label">Source Hash</span>
        <span className="value">0xfff12123</span>
      </ListItem>
      <Divider />
    </UnorderedList>
  );
};

const sendRequest = async (hash: string) => {
  const kappa = makeKappa(hash);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Bridges: any = {};
  supportedChainIds().forEach((chainId: number) => {
    // skip if we don't have an API for this chain
    if (!(chainId in apis)) return;

    Bridges[chainId] = new Bridge.SynapseBridge({
      network: chainId,
    });
  });

  // Set up the requests
  const req = Object.keys(Bridges).map((chainId: string) => {
    const { bridgeAddress: address } = Bridges[chainId];
    const { url, apikey } = apis[chainId as keyof typeof apis];

    return axios.get(url, {
      params: {
        module: "logs",
        action: "getLogs",
        address,
        topic2: kappa,
        apikey,
      },
    });
  });
  // wait for the requests to complete
  const res = await Promise.all(req);
  // post processing
  const data = res.map((x) => x.data.result);
  console.log("data", data[1]);
  return data;
};

function Tx() {
  const { hash } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    if (!hash) return;
    sendRequest(hash).then((data) => {
      setData(data);
    });
  }, []);

  return (
    <Container mt={20} maxW="container.md">
      <p>This is the tx page</p>
      <p>{hash}</p>
      <Box mt={20}>{makeTable()}</Box>
      <Box mt={20}>{JSON.stringify(data)}</Box>
      <Button color="primary" onClick={() => navigate("/")}>
        Go back
      </Button>
    </Container>
  );
}
export default Tx;

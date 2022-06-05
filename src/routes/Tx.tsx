import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Container,
  Divider,
  UnorderedList,
  ListItem,
  Box,
  Button,
} from "@chakra-ui/react";

import { id as makeKappa } from "@ethersproject/hash";
import { ethers } from "ethers";

import { Bridges } from "../utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeTable = (arr: any) => {
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
      {arr.map(([key, val]: [string, string]) => (
        <React.Fragment key={key}>
          <ListItem className="tableListItem">
            <span className="label">{key}</span>
            <span className="value">{val}</span>
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </UnorderedList>
  );
};

const toChain = async (fromTxHash: string, toChainId: string) => {
  const kappa = makeKappa(fromTxHash);
  const { url, apikey, bridge } = Bridges[toChainId];
  const { bridgeAddress: address } = bridge;
  const result = (
    await axios.get(url, {
      params: {
        module: "logs",
        action: "getLogs",
        address,
        topic2: kappa,
        apikey,
      },
    })
  ).data.result;
  return result.length > 0 ? result[0] : null;
};

const fromChain = async (txHash: string) => {
  const res = await Promise.all(
    Object.keys(Bridges).map((chainId: string) => {
      const { url, apikey } = Bridges[chainId];
      return axios.get(url, {
        params: {
          module: "proxy",
          action: "eth_getTransactionReceipt",
          txHash,
          apikey,
        },
      });
    })
  );

  const abi = [
    "event TokenDeposit(address indexed to, uint256 chainId, address token, uint256 amount)",
  ];
  const iface = new ethers.utils.Interface(abi);

  const data = res.map((x) => x.data.result);
  for (let i = 0; i < data.length; i++) {
    if (data[i] !== null) {
      const log = data[i].logs.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (x: any) =>
          x.topics[0] ===
          makeKappa("TokenDeposit(address,uint256,address,uint256)")
      );
      console.log("log", log);
      return [Object.keys(Bridges)[i], data[i], iface.parseLog(log)];
    }
  }

  return [null, null];
};

function Tx() {
  const { hash } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    if (!hash) return;
    (async function () {
      // get data about transaction from chain
      const [fromChainId, fromChainData, fromChainTx] = await fromChain(hash);
      if (!fromChainId || !fromChainTx) {
        throw new Error("TODO: Transaction not found");
      }
      const from = fromChainData.from;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const to = (fromChainTx as any).args[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toChainId = (fromChainTx as any).args[1].toString(10);
      const date = fromChainTx.timeStamp;
      console.log(date);

      // get data about transaction to chain
      const toChainTx = await toChain(hash, toChainId);
      console.log(toChainTx);

      const arr = [
        ["Source Hash", hash],
        ["Target Hash", toChainTx.transactionHash],
        ["Source Chain", Bridges[fromChainId as keyof typeof Bridges].name],
        ["Target Chain", Bridges[toChainId].name],
        ["From", from],
        ["To", to],
      ];
      setData(arr);
    })();
  }, []);
  return (
    <Container mt={20} maxW="container.md">
      <p>This is the tx page</p>
      <Box mt={20}>{makeTable(data ?? [])}</Box>
      <Box mt={20}>{JSON.stringify(data)}</Box>
      <Button color="primary" onClick={() => navigate("/")}>
        Go back
      </Button>
    </Container>
  );
}
export default Tx;

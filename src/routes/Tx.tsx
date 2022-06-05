import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

import {
  Container,
  Divider,
  UnorderedList,
  ListItem,
  Box,
  Button,
  Spinner,
  Heading,
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

// Destination Chain
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
  console.log(result);
  return result.length > 0 ? result[0] : null;
};

// Original Chain
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
      // console.log("log", log);
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

      // get data about transaction to chain
      const toChainTx = await toChain(hash, toChainId);

      const arr = [
        [
          "Source Hash",
          <Link to={`/`} key={hash}>
            {hash}
          </Link>,
        ],
        ["Target Hash", toChainTx ? toChainTx.transactionHash : "N/A"],
        ["Source Chain", Bridges[fromChainId as keyof typeof Bridges].name],
        ["Target Chain", Bridges[toChainId].name],
        ["From", from],
        ["To", to],
        ["Status", toChainTx ? "Success" : "Pending"],
      ];
      setData(arr);
    })();
  }, []);
  return (
    <Container mt={20} maxW="container.lg">
      <Heading>Transaction</Heading>
      <Box mt={20}>{data ? makeTable(data) : <Spinner />}</Box>
      <Button color="primary" onClick={() => navigate("/")} mt={10}>
        Go back
      </Button>
    </Container>
  );
}
export default Tx;

export { fromChain, toChain };

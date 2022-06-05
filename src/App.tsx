import * as React from "react";
import { useEffect } from "react";
import { Field, Formik } from "formik";
import {
  Heading,
  Button,
  Container,
  Input,
  FormControl,
  FormLabel,
  VStack,
  FormErrorMessage,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import "./App.css";
import axios from "axios";
import { Bridge, supportedChainIds } from "@synapseprotocol/sdk";
import apis from "./constants/apis.json";

import { fromChain } from "./routes/Tx";

import { ethers } from "ethers";

import chains from "./data/chains.json";

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";

import { ReactComponent as DendriteSvg } from "./dendrite.svg";

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeTable = (arr: any, onSubmit: any) => {
  return (
    <TableContainer mt={10}>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Source Hash</Th>
            <Th>From</Th>
            <Th>Source Chain</Th>
            <Th>Target Chain</Th>
            <Th>Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            arr.map((item: any) => (
              <Tr
                key={item.sourceHash}
                onClick={() => onSubmit({ hash: item.sourceHash })}
              >
                <Td>{item.sourceHash.slice(0, 10)}...</Td>
                <Td>{item.from.slice(0, 10)}...</Td>
                <Td>{item.sourceChain}</Td>
                <Td>{item.targetChain}</Td>
                <Td>{item.date}</Td>
              </Tr>
            ))
          }
        </Tbody>
      </Table>
      {arr.length == 0 && (
        <Center mt={10}>
          <Spinner />
        </Center>
      )}
    </TableContainer>
  );
};

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// function sortByKey(array: any, key: string) {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   console.log(array);
//   return array.sort(function (a: any, b: any) {
//     const x = a[key];
//     const y = b[key];
//     return x < y ? -1 : x > y ? 1 : 0;
//   });
// }

const getTxs = async (startIndex: number, endIndex: number) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Bridges: any = {};
  supportedChainIds().forEach((chainId: number) => {
    // skip if we don't have an API for this chain
    if (!(chainId in apis)) return;

    Bridges[chainId] = new Bridge.SynapseBridge({
      network: chainId,
    });
  });

  // Bridges an array of Bridge objects

  const req = Object.keys(Bridges).map((chainId: string) => {
    const { bridgeAddress: address } = Bridges[chainId];
    const { url, apikey } = apis[chainId as keyof typeof apis];

    // Define function event to look for
    const functionEvent = "TokenDeposit(address,uint256,address,uint256)";
    const topic0 = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(functionEvent)
    );

    return axios.get(url, {
      params: {
        module: "logs",
        action: "getLogs",
        topic0: topic0,
        address,
        apikey,
      },
    });
  });
  // wait for the requests to complete
  const res = await Promise.all(req);
  const data = res.map((x) => x.data.result);

  // Convert hexadecimal to decimal
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataConverted = data[0].map((x: any) => {
    x.timeStamp = parseInt(x.timeStamp, 16) * 1000;
    return x;
  });

  // const dataSorted = sortByKey(dataConverted, "timeStamp");
  const sample = dataConverted.slice(startIndex, endIndex);
  const ret = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sample.map(async (x: any) => {
      const txHash = x.transactionHash;
      const [fromChainId, fromChainData, fromChainTx] = await fromChain(txHash);
      const from = fromChainData.from;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toChainId = (fromChainTx as any).args[1].toString(10);

      const sourceChain = chains.find(
        (x) => x.chainId === parseInt(fromChainId)
      );
      // const abiEncoding = x.data;
      // const typesArrayTokenDeposit = ["uint256", "address", "uint256"]; // chainId, token, amount

      // const amount = parseInt(
      //   ethers.utils.defaultAbiCoder.decode(
      //     typesArrayTokenDeposit,
      //     abiEncoding
      //   )[2],
      //   16
      // );
      // const nativeCoinDecimal = sourceChain?.nativeCurrency.decimals;
      // console.log(sourceChain?.nativeCurrency.name);
      // console.log(amount * 1e-18);

      const date = new Date(x.timeStamp).toString();
      const arr = {
        sourceHash: txHash,
        sourceChain: sourceChain?.name,
        targetChain: chains.find((x) => x.chainId === parseInt(toChainId))
          ?.name,
        from: from,
        date: date,
      };
      return arr;
    })
  );

  return ret;
};

function App() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [txs, setTxs] = React.useState<any[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (values: any) => {
    navigate(`/tx/${values.hash}`);
  };

  useEffect(() => {
    const delayGetTxs = async function () {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let fullArray: any = [];
      for (let i = 0; i < 6; i++) {
        getTxs(2 * i, 2 * i + 1).then((x) => {
          fullArray = fullArray.concat(x);
          console.log("fullArray", fullArray); // printArray
        });
        await timer(1000);
      }
      setTxs(fullArray);
    };

    delayGetTxs();
  }, []);

  useEffect(() => {
    // console.log("txs", txs);
  });

  return (
    <Container mt={20} maxW="container.md">
      <Center mb={10}>
        <DendriteSvg />
        <Heading ml={3} size="4xl">
          Dendrite
        </Heading>
      </Center>
      <Formik initialValues={{ hash: "" }} onSubmit={onSubmit}>
        {({ isSubmitting, errors, handleSubmit, touched }) => (
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="flex-start">
              <FormControl isInvalid={!!errors.hash && touched.hash}>
                <FormLabel htmlFor="hash">Transaction Hash</FormLabel>
                <Field
                  as={Input}
                  id="hash"
                  name="hash"
                  placeholder="Hash"
                  size="lg"
                  isDisabled={isSubmitting}
                  validate={(value: string) => {
                    let error;
                    if (!/^0x([A-Fa-f0-9]{64})$/.test(value)) {
                      error = "Invalid transaction hash";
                    }
                    return error;
                  }}
                />
                <FormErrorMessage>{errors.hash}</FormErrorMessage>
              </FormControl>
              <Button type="submit" disabled={isSubmitting}>
                Submit
              </Button>
            </VStack>
          </form>
        )}
      </Formik>
      {makeTable(txs, onSubmit)}
    </Container>
  );
}

export default App;

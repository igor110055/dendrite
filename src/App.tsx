import * as React from "react";

import { Field, Formik } from "formik";
import {
  Heading,
  Button,
  ChakraProvider,
  Container,
  Input,
  FormControl,
  FormLabel,
  VStack,
  FormErrorMessage,
  Center,
} from "@chakra-ui/react";

import { Bridge, supportedChainIds } from "@synapseprotocol/sdk";
import { id as makeKappa } from "@ethersproject/hash";

import apis from "./constants/apis.json";
import axios from "axios";

function App() {
  const [success, setSuccess] = React.useState<boolean | undefined>(undefined);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Bridges: any = {};
  supportedChainIds().forEach((chainId: number) => {
    // skip if we don't have an API for this chain
    if (!(chainId in apis)) return;

    Bridges[chainId] = new Bridge.SynapseBridge({
      network: chainId,
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (values: any, { setSubmitting }: any) => {
    setSubmitting(false);
    const hash = values.hash;
    const kappa = makeKappa(hash);

    // set up the requests
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
    console.log("data", data);

    setSuccess(data.some((x) => x.length > 0));
  };
  console.log("success", success);

  return (
    <ChakraProvider>
      <Container mt={20} maxW="container.md">
        <Center mb={10}>
          <Heading size="4xl">Dendrite</Heading>
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
        <p>{success?.toString()}</p>
      </Container>
    </ChakraProvider>
  );
}

export default App;

import * as React from "react";

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
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import "./App.css";

function App() {
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (values: any, { setSubmitting }: any) => {
    setSubmitting(false);
    navigate(`/tx/${values.hash}`);
  };

  return (
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
    </Container>
  );
}

export default App;

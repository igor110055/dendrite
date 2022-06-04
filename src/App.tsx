import * as React from "react";

import { Field, Formik } from "formik";
import {
  Button,
  ChakraProvider,
  Container,
  Input,
  FormControl,
  FormLabel,
  VStack,
  FormErrorMessage,
} from "@chakra-ui/react";

function App() {
  return (
    <ChakraProvider>
      <Container mt={20}>
        <Formik
          initialValues={{ hash: "" }}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              alert(JSON.stringify(values, null, 2));
              setSubmitting(false);
            }, 400);
          }}
        >
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
    </ChakraProvider>
  );
}

export default App;

import * as React from "react";

import { Formik } from "formik";
import {
  Button,
  ChakraProvider,
  Container,
  Input,
  FormControl,
  FormLabel,
  VStack,
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
          {({ values, isSubmitting, handleChange, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="flex-start">
                <FormControl>
                  <FormLabel htmlFor="hash">Transaction Hash</FormLabel>
                  <Input
                    name="hash"
                    placeholder="Hash"
                    type="text"
                    size="lg"
                    isDisabled={isSubmitting}
                    onChange={handleChange}
                    value={values.hash}
                  />
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

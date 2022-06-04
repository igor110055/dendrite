import * as React from "react";

import { ChakraProvider, Container, Input } from "@chakra-ui/react";

function App() {
  return (
    <ChakraProvider>
      <Container>
        <Input placeholder="tx hash" size="lg" mt={20} />
      </Container>
    </ChakraProvider>
  );
}

export default App;

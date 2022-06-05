import { Bridge } from "@synapseprotocol/sdk";
import apis from "./constants/apis.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Bridges: any = {};

Object.keys(apis).forEach((chainId: string) => {
  Bridges[chainId] = {
    ...apis[chainId as keyof typeof apis],
    bridge: new Bridge.SynapseBridge({
      network: +chainId,
    }),
  };
});

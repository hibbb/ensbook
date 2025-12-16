// TestBox.tsx - 修正后

import { mainnet } from "wagmi/chains";
import { createPublicClient, http } from "viem";
import { normalize } from "viem/ens";
import { parseAndClassifyLabels } from "./utils/parseLabels";
import { fetchLabels } from "./utils/fetchLabels";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

async function fetchEnsAddress() {
  const ensAddress = await publicClient.getEnsAddress({
    name: normalize("ur.gtest.eth"),
  });

  console.log(ensAddress);
}

async function handleInputs() {
  // Add your logic here
  const parsedLabels = parseAndClassifyLabels("@ens.eth");
  const labelResults = await fetchLabels(parsedLabels);
  console.log(labelResults);
}

export const TestBox = () => {
  return (
    <div>
      <button
        onClick={() => {
          fetchEnsAddress();
        }}
      >
        fetch ens address!
      </button>
      <button
        onClick={() => {
          handleInputs();
        }}
      >
        handle inputs!
      </button>
    </div>
  );
};

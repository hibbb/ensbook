// TestBox.tsx - 修正后

import { mainnet } from "wagmi/chains";
import { createPublicClient, http } from "viem";
import { normalize } from "viem/ens";
import { parseAndClassifyInputs } from "./utils/parseInputs";
import { fetchLabels } from "./utils/fetchLabels";
import { fetchNameRecords } from "./utils/fetchNameRecords";

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
  const parsedInputs = parseAndClassifyInputs("@ens.eth");
  const labelResults = await fetchLabels(parsedInputs);
  const nameRecords = await fetchNameRecords(labelResults);

  console.log(nameRecords);
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

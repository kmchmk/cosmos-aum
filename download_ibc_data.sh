#!/bin/bash

# Download JSON file to /tmp
wget -O /tmp/ibc_data.json "https://raw.githubusercontent.com/PulsarDefi/IBC-Token-Data-Cosmos/main/ibc_data.min.json"

# Check if the download was successful
if [ $? -ne 0 ]; then
    echo "Error downloading JSON file."
    exit 1
fi

# Filter JSON using jq
IBC_DATA=$(jq 'reduce to_entries[] as $item ({}; if ($item.key | endswith("__archway")) then . + {($item.key): {chain: $item.value.origin.chain, denom: $item.value.origin.denom}} else . end)' /tmp/ibc_data.json)

echo "export const IBCData: any = " $IBC_DATA > ./data/ibc_data.tsx



# Check if jq filtering was successful
if [ $? -ne 0 ]; then
    echo "Error filtering JSON file with jq."
    exit 1
fi

echo "Filtered JSON file has been saved to ./data/ibc_data.tsx"
echo "Please format the file using Prettier before committing it to the repository."

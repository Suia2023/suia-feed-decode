import {client, NftFeed} from "./common";
import {DisplayFieldsResponse, SuiTransactionBlock} from "@mysten/sui.js/src/client/types/generated";

const suiaMainPackages = [
  "0xbb1531504c9c3235d3cd637ed9573cbe18461255b4175a1cb1e1b07b8aa8e11b"
];

const FunctionShowMap: Record<string, string> = {
  "create_medal": "create_suia",
  "claim_medal": "claim_suia",
};

export async function DecodeSuiaProject(tx: string): Promise<NftFeed> {
  let txResp = await client.getTransactionBlock(
      {
        digest: tx,
        options: {
          showInput: true,
          showEffects: false,
          showEvents: false,
          showObjectChanges: false,
        }
      }
  );
  let transaction = ((txResp.transaction as SuiTransactionBlock).data.transaction as any);
  if (!suiaMainPackages.includes(transaction.transactions[0].MoveCall.package)) {
    return {Sender: "", ActionName: "", ImgUrl: "", NftName: "",};
  }

  let actionName = FunctionShowMap[transaction.transactions[0].MoveCall.function.toString()];
  if (actionName == "create_suia") {
    return {
      Sender: (txResp.transaction as SuiTransactionBlock).data.sender,
      ActionName: actionName,
      ImgUrl: transaction.inputs[5].value,
      NftName: transaction.inputs[1].value,
    };
  } else if (actionName == "claim_suia") {
    let objInfo = await client.getObject({
      id: transaction.inputs[0].objectId,
      options: {"showContent": true, "showDisplay": true, "showOwner": true, "showPreviousTransaction": true, "showStorageRebate": true, "showType": true}
    });
    return {
      Sender: (txResp.transaction as SuiTransactionBlock).data.sender,
      ActionName: actionName,
      ImgUrl: (objInfo.data?.display as DisplayFieldsResponse).data?.image_url ?? "",
      NftName: (objInfo.data?.display as DisplayFieldsResponse).data?.name ?? "",
    };
  }
  return {Sender: "", ActionName: "", ImgUrl: "", NftName: "",};
}

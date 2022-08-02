import React from 'react'
import { withRouter } from "react-router";
import {
  DisplayFarms,
} from "@cryption/dapp-factory-sdk";
import useActiveWeb3React from "../../hooks";

function Home(props: any) {
  const { chainId, account } = useActiveWeb3React();
  const getServiceId = (id: any) => {
    if (id) {
      props.history.push(`/farms/${id}`)
    }
  }
  console.log({ chainId, account })
  return (
    <div>
      <DisplayFarms account={account?.toString()} chainId={chainId || 80001} getServiceId={getServiceId} />
    </div>
  )
}
export default withRouter(Home)
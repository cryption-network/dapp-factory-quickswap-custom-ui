import React from 'react'
import { withRouter } from "react-router";
import { Button, Stack } from '@mui/material';
import styled from 'styled-components';
import {
  DisplayFarms,
} from "@cryption/dapp-factory-sdk";
import useActiveWeb3React from "../../hooks";

const TitleText = styled.p`
  color: #c7cad9;
  margin: 0;
  font-size: 25px;
  font-weight: 700;
  line-height: 1.43;
  text-align: center;
`;
const Card = styled.div`
  width: 100%;
  margin: 40px 0px;
  border-radius: 10px;
  padding: 20px 20px;
  background-color: #1b1e29;
`;
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
      <Card>
        <Stack spacing={3} alignItems="center" justifyContent="center"> 
          <TitleText>
            Click on button below to create Quickswap Single Reward Farm Powered by DappFactoy
          </TitleText>
          <Button
            onClick={() => props.history.push('/create')}
            sx={{
              background: '#448aff',
              color: '#ffffff',
              height: '48px',
              padding: '6px 18px',
              marginBottom: '20px',
              borderRadius: '30px',
            }}
          >
            Create Farm
          </Button>
        </Stack>
      </Card>
      <DisplayFarms account={account?.toString()} chainId={chainId || 80001} getServiceId={getServiceId} />
    </div>
  )
}
export default withRouter(Home)
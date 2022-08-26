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
  font-family: Inter;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.43;
  text-align: center;
`;
const Card = styled.div`
  width: 100%;
  margin: 40px 0px;
  border-radius: 10px;
  font-family: Inter;
  padding: 20px 20px;
  position: relative;
  z-index:2
`;
function Home(props: any) {
  const { chainId, account } = useActiveWeb3React();
  // const getServiceId = (id: any) => {
  //   if (id) {
  //     props.history.push(`/farms/${id}`)
  //   }
  // }
  // console.log({ chainId, account })
  return (
    <div>
      <div className='heroBkg'>
        <img src="https://quickswap.exchange/static/media/heroBkg.fbe399ae.svg" alt="heroimage" />
      </div>
      <Card>
        <Stack spacing={3} alignItems="center" justifyContent="center">
          <TitleText>
            Create a Single Reward Farm
          </TitleText>
          <Button
            onClick={() => props.history.push('/create')}
            sx={{
              backgroundImage: 'linear-gradient(105deg,#448aff 3%,#004ce6)',
              color: '#ffffff',
              height: '48px',
              fontFamily: 'Inter',
              fontWeight:'700',
              padding: '6px 18px',
              marginBottom: '20px',
              borderRadius: '30px',
            }}
          >
            Create Farm
          </Button>
        </Stack>
      </Card>
      <DisplayFarms 
        customgradient="linear-gradient(105deg,#448aff 3%,#004ce6)"
        customPrimaryColor="#448aff"
        account={account?.toString()} 
        chainId={chainId || 80001} 
        implementationid={1}
        // getServiceId={getServiceId} 
      />
    </div>
  )
}
export default withRouter(Home)
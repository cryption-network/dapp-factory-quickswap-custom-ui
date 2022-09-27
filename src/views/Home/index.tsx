/* eslint-disable array-callback-return */
import React, { useEffect, useState } from 'react'
import { withRouter } from "react-router";
import BigNumber from "bignumber.js";
import styled from "styled-components";
import { Text, Toggle, Flex } from 'cryption-uikit-v2';
import { styled as muiStyled } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from "@mui/material/Box";
import { Button, Stack } from '@mui/material';
import {
  fetchFarms
} from "@cryption/dapp-factory-sdk";
import useActiveWeb3React from "../../hooks";
import FarmRow from '../../components/FarmRow';
import PoweredByCryptionNetwork from '../../images/PoweredByDappfactory.png';
import { QUICKSWAP_TOKE_URL } from '../../config/index';

const TitleText = styled.p`
  color: #c7cad9;
  font-family: Inter;
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
const FarmRowsContainer = styled.div`
  border-radius: 20px;
  padding: 32px;
  position: relative;
  font-family: Inter;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.card};
`;
const FarmRowContainer = styled(Box)`
  width: 100%;
  border-radius: 10px;
  display: flex;
  font-family: Inter;
  align-items: center;
  cursor: pointer;
`;
const SubTitle = styled.p`
  color: #ffffff;
  font-size: 18px;
  font-weight: 500;
  font-family: Inter;
  line-height: 1.43;
  text-align: left;
  margin-top: 25px;
  margin-bottom: 20px;
`;
const LinkTitle = styled.a`
  color: #4489FF;
  font-size: 20px;
  font-weight: 500;
  margin-left: 5px;
  margin-right: 5px;
  font-family: Inter;
  line-height: 1.43;
  text-align: left;
`;
const StyledToggleButtonGroup = muiStyled(ToggleButtonGroup)(() => ({
  '& .MuiToggleButtonGroup-grouped': {
    border: '1px solid #3E4252',
    fontSize: '14px',
    fontFamily: 'Inter',
    borderRadius: '8px',
    color: '#626680',
    '&.Mui-disabled': {
      border: 0,
    },
    '&.Mui-selected': {
      background: '#3E4252',
      color: '#B6B9CC',
    },
  },
}));

function Home(props: any) {
  const currentDate = Math.floor(new Date().getTime() / 1000);
  const { chainId, account } = useActiveWeb3React();
  const [allFarms, setAllFarms] = useState<any>([]);
  const [activeFarms, setActiveFarms] = useState([]);
  const [finishedFarms, setFinishedFarms] = useState([]);
  const [stakedFarms, setStakedFarms] = useState([]);
  const [stakedOnly, setIsStake] = useState(false);
  const [alignment, setAlignment] = React.useState('active');
  // const getServiceId = (id: any) => {
  //   if (id) {
  //     props.history.push(`/farms/${id}`)
  //   }
  // }
  // console.log({ chainId, account })
  const handleTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string,
  ) => {
    setAlignment(newAlignment);
  };
  useEffect(() => {
    const getFarms = async () => {
      const allFarms = await fetchFarms(chainId || 137, 1, [], account || undefined)
      if (allFarms.success) {
        const getTokens = await fetch(QUICKSWAP_TOKE_URL)
        const tokenList = await getTokens.json()
        if (tokenList && tokenList.tokens) {
          let getTokensForChain = tokenList.tokens.filter((eachToken: { chainId: number | undefined; }) => eachToken.chainId === chainId)
          if (chainId === 80001) {
            const testTokens = [
              {
                name: 'Cryption Network Token',
                symbol: 'CNT',
                address: '0x766f03e47674608cccf7414f6c4ddf3d963ae394',
                decimals: 18,
                logoURI: "https://cryption-network-local.infura-ipfs.io/ipfs/QmceihNozdFNThRJiP2X93X2LXmSb5XWzsTaNsVBA7GwTZ"
              },
              {
                name: 'Tether USD',
                symbol: 'USDT',
                address: '0xD89a2E56B778AEfe719fc86E122B7db752Bb6B41',
                decimals: 6,
                logoURI: "https://cryption-network-local.infura-ipfs.io/ipfs/QmTXHnF2hcQyqo7DGGRDHMizUMCNRo1CNBJYwbXUKpQWj2"
              },
              {
                name: 'WETH',
                symbol: 'WETH',
                address: '0x2b5db7D98669be1242F62469214048cFe35d1a17',
                decimals: 18,
                logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"
              },
              {
                name: 'Wrapped Matic',
                symbol: 'WMATIC',
                address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
                decimals: 18,
                logoURI: "https://cryption-network-local.infura-ipfs.io/ipfs/QmQnnPC9FKVdC2qnvHdDE45cz6q8grpeBLwBWNETVwzi5Q"
              },
              {
                name: 'USDC Stablecoin',
                symbol: 'USDC',
                address: '0x06B761Ea0c0EA5674743A184bB826960f6f6cFa0',
                decimals: 6,
                logoURI: "https://cryption-network-local.infura-ipfs.io/ipfs/QmV17MDKrb3aCQa2a2SzBZaCeAeAFrpFmqCjn351cWApGS"
              },
            ]
            getTokensForChain = [
              ...getTokensForChain,
              ...testTokens
            ]
          }
          const filteredFarms = allFarms.data.filter(eachFarm => {
            const isToken0Exist = getTokensForChain.find((eachToken: { address: string; }) => eachToken.address.toLowerCase() === eachFarm.token0.toLowerCase());
            const isToken1Exist = getTokensForChain.find((eachToken: { address: string; }) => eachToken.address.toLowerCase() === eachFarm.token1.toLowerCase());
            const isRewardTokenExist = getTokensForChain.find((eachToken: { address: string; }) => eachToken.address.toLowerCase() === eachFarm.rewardToken.address.toLowerCase());
            if (isToken0Exist && isRewardTokenExist && isToken1Exist) {
              return eachFarm;
            }
          })
          setAllFarms(filteredFarms)
        }
      }
    }
    getFarms()
  }, [account, chainId]);
  useEffect(() => {
    if (allFarms.length > 0) {
      const active = allFarms.filter(
        (farm: { periodFinish: any; }) => farm.periodFinish && currentDate < Number(farm.periodFinish)
      );
      const finished = allFarms.filter(
        (farm: { isquickswapSingleReward: any; rewardToken: { rewardBalInFarm: any; }; }) => parseFloat(farm.rewardToken.rewardBalInFarm) <= 0
      );

      const staked = allFarms.filter((farm: { stakedBalance: BigNumber.Value; }) =>
        new BigNumber(farm.stakedBalance).isGreaterThan(0)
      );

      setActiveFarms(() => active);
      setFinishedFarms(() => finished);
      setStakedFarms(() => staked);
    }
  }, [allFarms, currentDate]);
  return (
    <div>
      <div className='heroBkg'>
        <img src="https://quickswap.exchange/static/media/heroBkg.fbe399ae.svg" alt="heroimage" />
      </div>
      <Card style={{ marginBottom: '0px' }}>
        <Stack spacing={3} alignItems="center" justifyContent="center">
          <TitleText>
            Create a Single Reward Farm
          </TitleText>
          <Button
            onClick={() => props.history.push('/create')}
            sx={{
              backgroundImage: 'linear-gradient(105deg,#448aff 3%,#448AFF)',
              color: '#ffffff',
              height: '48px',
              fontFamily: 'Inter',
              fontWeight: '700',
              padding: '6px 18px',
              marginBottom: '20px',
              borderRadius: '10px',
            }}
          >
            Create a Farm
          </Button>
        </Stack>
      </Card>
      <FarmRowsContainer style={{ marginBottom: '20px', background: 'transparent', padding: '10px' }}>
        <Stack alignItems="center" spacing={2}>
          <SubTitle style={{ fontSize: '20px', marginTop: '20px', textAlign: 'center', marginBottom: '0px' }}>
            Visit
            <LinkTitle href='https://app.dappfactory.xyz/' target="_blank">
              DappFactory
            </LinkTitle>
            to create a farm if you can't find your token
          </SubTitle>
          <img src={PoweredByCryptionNetwork} alt="Dapp factory" width="200px" />
        </Stack>
      </FarmRowsContainer>
      <FarmRowsContainer>
        <Box mb="24px" style={{ display: 'flex' }}>
          <Box width={0.6}>
            <Text fontWeight="800" fontSize="20px" fontFamily="Inter">
              Earn Rewards
            </Text>
            <Text fontWeight="500" fontSize="16px" fontFamily="Inter">
              Stake LP tokens to earn reward tokens
            </Text>
          </Box>
          <Box width={0.4}>
            <Flex justifyContent="space-between" alignItems="center">
              <StyledToggleButtonGroup
                color="primary"
                value={alignment}
                exclusive
                onChange={handleTypeChange}
                aria-label="Platform"
              >
                <ToggleButton value="active">Active</ToggleButton>
                {/* <ToggleButton value="upcoming">Upcoming</ToggleButton> */}
                <ToggleButton value="ended">Ended</ToggleButton>
              </StyledToggleButtonGroup>
              <Flex marginLeft="15x" alignItems="center">
                <Text style={{ color: '#626680' }} fontSize="16px" fontWeight="800" marginRight="10px" fontFamily="Inter">
                  Staked Only
                </Text>
                <Toggle checked={stakedOnly} onChange={() => setIsStake(!stakedOnly)} scale="sm" />
              </Flex>
            </Flex>
          </Box>
        </Box>
        <FarmRowContainer>
          <Box width={0.3} style={{ paddingLeft: '16px' }}>
            <Text fontFamily="Inter">
              Pool
            </Text>
          </Box>
          <Box width={0.2} textAlign='center' fontFamily="Inter">
            <Text fontFamily="Inter">
              TVL
            </Text>
          </Box>
          <Box width={0.15} textAlign='center' fontFamily="Inter">
            <Text fontFamily="Inter">
              APR
            </Text>
          </Box>
          <Box width={0.35} textAlign='right' style={{ padding: '0px 16px' }}>
            <Text fontFamily="Inter">
              Earned
            </Text>
          </Box>
        </FarmRowContainer>
        {stakedOnly &&
          stakedFarms &&
          stakedFarms.length > 0 &&
          stakedFarms.map((eachFarm) => (
            <FarmRow
              account={account || undefined}
              farm={eachFarm}
            />
          ))}
        {!stakedOnly && alignment === 'active' &&
          activeFarms &&
          activeFarms.length > 0 &&
          activeFarms.map((eachFarm) => (
            <FarmRow
              account={account || undefined}
              farm={eachFarm}
            />
          ))}
        {!stakedOnly && alignment === 'ended' &&
          finishedFarms &&
          finishedFarms.length > 0 &&
          finishedFarms.map((eachFarm) => (
            <FarmRow
              account={account || undefined}
              farm={eachFarm}
            />
          ))}
      </FarmRowsContainer>
    </div>
  )
}
export default withRouter(Home)
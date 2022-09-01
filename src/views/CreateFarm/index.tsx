// @ts-nocheck
import React, { forwardRef, useState, useEffect } from 'react'
import { withRouter } from 'react-router';
import { Container, Grid, TextField, Stack, Button, Box, IconButton } from '@mui/material';
import BigNumber from "bignumber.js";
import { ethers, Contract } from "ethers";
import { styled as muiStyled } from '@mui/material/styles';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import styled from 'styled-components';
import { useCreateFarm, LP_IMAGE_SEPERATOR_STRING } from "@cryption/dapp-factory-sdk";
import DatePicker from "react-datepicker";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import "react-datepicker/dist/react-datepicker.css";
import {
  // useQuikcswapSingleRewardContract,
  useFactoryContract
} from "../../hooks/useContract";
import tokenAbi from "../../config/constants/abi/token.json";
import { getERC20Contract } from '../../utils/contractHelpers';
import useWeb3 from "../../hooks/useWeb3";
import {
  getQuickswapSingleRewardFactory,
  getRouterAddress
} from "../../utils/addressHelpers";
import useActiveWeb3React from "../../hooks";
import TokenList from '../../components/TokenList';
import getCoinGeckoIds from "../../utils/getCoinGeckoIds";
import getCoinGeckoPrice from "../../utils/getCoinGeckoPrice";
import PoweredByCryptionNetwork from '../../images/PoweredByDappfactory.png';
import Modal from '../../components/Modal';
import './index.css';
import calendarIcon from '../../images/calendar.png';
import pairIcon from '../../images/toggle.png';
import rewardIcon from '../../images/reward.png';
import rewardAmountIcon from '../../images/rewardAmount.png';
import addIcon from '../../images/addIcon.png';
import { MIN_REWARDS } from '../../config';

const TitleText = styled.p`
  color: #c7cad9;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  font-family: Inter;
  line-height: 1.43;
  text-align: center;
`;
const SubTitle = styled.p`
  color: #c7cad9;
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
const Card = styled.div`
  width: fit-content;
  margin-top: 30px;
  font-family: Inter;
  border-radius: 10px;
  padding: 20px 20px;
  background-color: #1C1E29;
`;

const CssTextField = muiStyled(TextField)({
  '& MuiInputBase-input': {
    fontFamily: 'Inter',
    color: '#c7cad9',
    background: '#12131A'
  },
  '& label.Mui-focused': {
    color: '#c7cad9',
    borderColor: '#12131A !important',
  },
  '& label.MuiFormLabel-root': {
    color: '#c7cad9',
    fontFamily: 'Inter',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: '#c7cad9',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    color: '#c7cad9 !important',
    background: '#12131A',
    '& fieldset': {
      borderColor: '#12131A !important',
    },
    '&:hover fieldset': {
      borderColor: '#12131A !important',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#c7cad9d !important',
    },
  },
  '& .Mui-disabled': {
    '-webkit-text-fill-color': '#c7cad9 !important',
    '& fieldset': {
      borderColor: '#c7cad9 !important',
    },
    '&:hover fieldset': {
      borderColor: '#c7cad9 !important',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#c7cad9d !important',
    },
  },
});

const InputWrapper = styled.div`
  position: relative;
  margin: 0;
  margin-top: 10px;
  fontFamily: 'Inter',

  ${({ theme }) => theme.mediaQueries.sm} {
    width: 234px;
    display: block;
  }

  > div {
    margin: 0;
  }

  > .react-datepicker__tab-loop
    > .react-datepicker-popper
    > div
    > .react-datepicker {
    display: flex !important;
  }
`;
const CustomButton = styled.button`
  background-color: #12131A;
  border: 1px solid #12131A;
  border-radius: 10px;
  padding: 10px;
  width: 100%;
  color: #ffffff;
  font-size: 18px;
  min-width: 300px;
`;
const TokenTitle = styled.span`
  font-size: 14px;
  line-height: 1.57;
  font-weight: 700;
  color: #c7cad9;
`;
const TokenContainer = styled.div`
  background: #404557;
  padding: 6px 12px;
  border-radius: 8px;
`;

const ExampleCustomInput = forwardRef(({ value, onClick }: any, ref: any) => {
  let split = value
  if (value) {
    split = value.split(' ');
  }
  return (
    <CustomButton className="example-custom-input" onClick={onClick} ref={ref}>
      <Stack direction="row" justifyContent="space-between">
        <span>{split[0]}</span>
        <span>{split[1]} UTC</span>
      </Stack>
    </CustomButton>
  )
});
function CreateFarm(props: any) {
  const web3 = useWeb3();
  const [isValidPair, toggleValidPairAddress] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [pendingTxn, togglePendingTx] = useState(false);
  const [showInputtoken0Modal, toggleInputtoken0Modal] = useState(false);
  const [successModal, toggleSuccessModal] = useState(false);
  const [showInputtoken1Modal, toggleInputtoken1Modal] = useState(false);
  const [showRewardTokenModal, toggleRewardTokenModal] = useState(false);
  const [allowanceAmount, setAllowanceAmount] = useState(0);
  const [farmData, setFarmData] = useState({
    amount: "",
    rewardDuration: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    minRewardAmount: 0,
    feeAddress: "",
    referrer: "",
    inputToken0: {
      address: "",
      name: "",
      decimals: "",
      symbol: "",
      logoURI: "",
    },
    inputToken1: {
      address: "",
      name: "",
      decimals: "",
      symbol: "",
      logoURI: "",
    },
    rewardToken: {
      address: "",
      name: "",
      decimals: "",
      symbol: "",
      balance: "0",
      logoURI: "",
    },
    inputToken: {
      address: "",
      name: "",
      decimals: "",
      symbol: "",
      lpBal: "0",
    },
  });

  const { launchFarmOrPool, txnHash } = useCreateFarm(1);
  const { chainId, account } = useActiveWeb3React();
  const factoryContractAddress = getQuickswapSingleRewardFactory(chainId || 80001);
  // const factoryContract = useQuikcswapSingleRewardContract();
  const quickswapFactoryContract = useFactoryContract()
  const launchFarm = async () => {
    try {
      togglePendingTx(true)
      const rewardToken = {
        address: farmData.rewardToken.address,
        symbol: farmData.rewardToken.symbol,
        decimals: parseInt(farmData.rewardToken.decimals),
        imgUrl: farmData.rewardToken.logoURI,
      }
      const inputToken = {
        address: farmData.inputToken.address,
        symbol: farmData.inputToken.symbol,
        decimals: parseInt(farmData.inputToken.decimals),
        imgUrl: `${farmData.inputToken0.logoURI}${LP_IMAGE_SEPERATOR_STRING}${farmData.inputToken1.logoURI}`
      }
      console.log({ inputToken })
      const rewardTokenAmountWei = new BigNumber(
        farmData.amount ? farmData.amount : "0"
      )
        .multipliedBy(10 ** parseFloat(farmData.rewardToken.decimals))
        .toString();
      const differenceInSecondsForRewardDuration = Math.floor(
        (farmData.rewardDuration.valueOf() -
          new Date(Date.now()).valueOf()) /
        1000
      );
      const routerAddress = getRouterAddress(chainId || 80001)
      try {
        await launchFarmOrPool(rewardToken, inputToken, "", 0, 0, "0", "0", "", "0", routerAddress, rewardTokenAmountWei, null, 0, differenceInSecondsForRewardDuration, null, 1, true);
        togglePendingTx(false)
        toggleSuccessModal(true)
      } catch (error) {
        togglePendingTx(false)
        console.error('error', error)
      }
    } catch (error) {
      togglePendingTx(false)
      console.error(error);
    }
  }
  const onCreateFarm = async () => {
    try {
      togglePendingTx(true)
      const { rewardToken } = farmData;
      let approvalAmount = new BigNumber(
        farmData.amount ? farmData.amount : "0"
      )
        .multipliedBy(10 ** parseFloat(farmData.rewardToken.decimals))
        .toString();
      approvalAmount = Number(approvalAmount).toLocaleString("fullwide", {
        useGrouping: false,
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new Contract(
        rewardToken.address,
        tokenAbi.abi,
        signer
      );
      if (new BigNumber(allowanceAmount).isLessThan(approvalAmount)) {
        try {
          const approvalTx = await tokenContract.approve(
            factoryContractAddress,
            approvalAmount
          );
          await approvalTx.wait();
          launchFarm()
        } catch (e) {
          console.error(e);
        }
      } else if (
        new BigNumber(allowanceAmount).isGreaterThanOrEqualTo(approvalAmount)
      ) {
        launchFarm()
      }
    } catch (error) {
      togglePendingTx(false)
      console.error(error);
    }
  }
  const formatUTC = (dateInt: Date | number, addOffset = false) => {
    const date =
      !dateInt || dateInt.toString().length < 1
        ? new Date()
        : new Date(dateInt);
    if (typeof dateInt === "string") {
      return date;
    }
    const offset = addOffset
      ? date.getTimezoneOffset()
      : -date.getTimezoneOffset();
    const offsetDate = new Date();
    offsetDate.setTime(date.getTime() + offset * 60000);
    return offsetDate;
  };
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    title: string
  ) => {
    setFarmData({
      ...farmData,
      [title]: event.target.value,
    });
  }
  const convertWeiToEther = (
    etherValue: string,
    decimals: number | string
  ): string => {
    return new BigNumber(etherValue)
      .dividedBy(new BigNumber(10).pow(decimals))
      .toJSON();
  };
  const checkPair = async (token0, token1) => {
    try {
      console.log({ token0, token1 })
      const getPair = await quickswapFactoryContract.methods.getPair(token0, token1).call()
      console.log({ getPair })
      if (getPair && getPair !== '0x0000000000000000000000000000000000000000') {
        const contractDetails = getERC20Contract(getPair, web3);
        const balance = await contractDetails.methods.balanceOf(account).call();
        const balanceToEth = await web3.utils.fromWei(balance, 'ether');
        setFarmData(currentfarmData => ({
          ...currentfarmData,
          inputToken: {
            address: getPair,
            lpBal: balanceToEth,
            decimals: '18',
            symbol: 'UNI-V2',
            name: "Uniswap V2"
          },
        }));
        toggleValidPairAddress(true)
      } else {
        toggleValidPairAddress(false)
      }
    } catch (error) {
      console.log({ error })
      toggleValidPairAddress(false)
    }
  }
  const selectToken = async (token, title) => {
    const defaultValues = {
      address: "",
      name: "",
      decimals: "",
      symbol: "",
      balance: "0",
      logoURI: "",
    }
    if (title === 'inputToken0' || title === 'inputToken1') {
      setFarmData(currentfarmData => ({
        ...currentfarmData,
        [title]: token ? token : defaultValues,
      }));
      if (title === 'inputToken0' && farmData.inputToken1.address && farmData.inputToken1.address.length > 0) {
        checkPair(token.address, farmData.inputToken1.address)
      } else if (title === 'inputToken1' && farmData.inputToken0.address && farmData.inputToken0.address.length > 0) {
        checkPair(farmData.inputToken0.address, token.address)
      }
    } else if (token && title === 'rewardToken') {
      setFarmData(currentfarmData => ({
        ...currentfarmData,
        [title]: token ? token : defaultValues,
      }));
      const contractDetails = getERC20Contract(token.address, web3);
      const balance = await contractDetails.methods.balanceOf(account).call();
      setFarmData(currentfarmData => ({
        ...currentfarmData,
        [title]: {
          ...token ? token : defaultValues,
          balance: convertWeiToEther(balance, token?.decimals)
        },
      }));
      const allowance = await contractDetails.methods
        .allowance(account, factoryContractAddress)
        .call();
      setAllowanceAmount(allowance);
      const coingeckoIds = await getCoinGeckoIds();
      const token0USD = await getCoinGeckoPrice(
        token.symbol.toLowerCase(),
        token.name,
        coingeckoIds
      );
      const minimumRewards = MIN_REWARDS / token0USD;
      setFarmData(currentfarmData => ({
        ...currentfarmData,
        minRewardAmount: minimumRewards
      }));
    }
  }
  useEffect(() => {
    const getToknList = async () => {
      const getTokens = await fetch('https://unpkg.com/quickswap-default-token-list@latest/build/quickswap-default.tokenlist.json')
      const tokenList = await getTokens.json()
      if (tokenList && tokenList.tokens) {
        let getTokensForChain = tokenList.tokens.filter(eachToken => eachToken.chainId === chainId)
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
        setTokens(getTokensForChain)
      }
    }
    getToknList()
  }, [chainId])
  let disabledButton = true;
  if (farmData.inputToken.address.length > 0 && farmData.rewardToken.address.length > 0 && parseFloat(farmData.amount) > 0 && parseFloat(farmData.amount) >= parseFloat(farmData.minRewardAmount)) {
    disabledButton = false
  }
  return (
    <div>
      <div className='heroBkg'>
        <img src="https://quickswap.exchange/static/media/heroBkg.fbe399ae.svg" alt="heroimage" />
      </div>
      <Modal open={successModal} title="Transcation Successfull" onClose={() => toggleSuccessModal(false)}>
        <Stack alignItems="center" justifyContent="center">
          <CheckCircleRoundedIcon sx={{ color: '#11A569', fontSize: '50px' }} />
          <TitleText style={{ fontSize: '18px', marginTop: '10px', marginBottom: '20px' }}>
            Farm Created Successfully !
          </TitleText>
          <Stack alignItems="center" direction="row" spacing={3} justifyContent="space-evenly">
            <Button
              fullWidth
              onClick={() => window.open(`https://mumbai.polygonscan.com/tx/${txnHash}`, '_blank')}
              sx={{
                background: '#282D3D',
                color: '#ffffff',
                width: '200px',
                height: '48px',
                padding: '6px 8px',
                borderRadius: '10px',
                fontFamily: 'Inter',
                fontWeight: '700',
              }}
            >
              View Transcation
            </Button>
            <Button
              fullWidth
              onClick={() => toggleSuccessModal(false)}
              sx={{
                background: '#EBECF2',
                color: '#1C1E29',
                width: '200px',
                height: '48px',
                padding: '6px 8px',
                borderRadius: '10px',
                fontFamily: 'Inter',
                fontWeight: '700',
              }}
            >
              Close
            </Button>
          </Stack>
        </Stack>
      </Modal>
      <Container maxWidth="lg"
        sx={{
          paddingTop: '30px', position: 'relative', zIndex: 2
        }}>
        <TokenList tokens={tokens} selectedCurrency={farmData.inputToken0} isOpen={showInputtoken0Modal}
          onSelect={(token) => {
            toggleInputtoken0Modal(false);
            selectToken(token, 'inputToken0')
          }}
          onDismiss={() => toggleInputtoken0Modal(false)}
        />
        <TokenList tokens={tokens} selectedCurrency={farmData.inputToken1} isOpen={showInputtoken1Modal}
          onSelect={(token) => {
            toggleInputtoken1Modal(false);
            selectToken(token, 'inputToken1')
          }}
          onDismiss={() => toggleInputtoken1Modal(false)}
        />
        <TokenList tokens={tokens} selectedCurrency={farmData.rewardToken} isOpen={showRewardTokenModal}
          onSelect={(token) => {
            toggleRewardTokenModal(false);
            selectToken(token, 'rewardToken')
          }}
          onDismiss={() => toggleRewardTokenModal(false)}
        />
        <Stack justifyContent="center" alignItems="center">
          <Card style={{ background: 'transparent'}}>
            <Stack alignItems="center" spacing={2}>
              <SubTitle style={{ fontSize: '20px', color: '#ffffff', marginTop: '20px', textAlign: 'center', marginBottom: '0px' }}>
                Visit
                <LinkTitle href='https://app.dappfactory.xyz/' target="_blank">
                  DappFactory
                </LinkTitle>
                to create a farm if you can't find your token
              </SubTitle>
              <img src={PoweredByCryptionNetwork} alt="Dapp factory" width="200px" />
            </Stack>
          </Card>
          <Card>
            <Stack spacing={5} alignItems="center" justifyContent="start" direction="row" sx={{ marginBottom: '20px' }}>
              <IconButton onClick={() => props.history.push('/')}>
                <ArrowBackIcon sx={{ color: '#636780' }} />
              </IconButton>
              <TitleText style={{ fontSize: '20px' }}>
                Build a Farm
              </TitleText>
              {/* <img src={PoweredByCryptionNetwork} alt="Dapp factory" width="200px" /> */}
            </Stack>
            <TitleText style={{ marginBottom: '30px' }}>
              Create Quickswap Single Reward Farm Powered by DappFactoy
            </TitleText>
            <Stack direction="row" alignItems="center">
              <img src={pairIcon} width="24px" alt="calendar" style={{ marginRight: '10px' }} />
              <SubTitle style={{ textAlign: 'left' }}>Select Pair</SubTitle>
            </Stack>
            <Stack spacing={2} alignItems="center" justifyContent="space-between" direction="row" sx={{ marginBottom: '40px', margintop: '20px' }}>
              <Box
                className={`currencyButton ${farmData.inputToken0.address.length > 0 ? 'currencySelected' : 'noCurrency'
                  }`}
                onClick={() => toggleInputtoken0Modal(true)}
              >
                {farmData.inputToken0.address.length > 0 ? (
                  <>
                    <img src={farmData.inputToken0.logoURI} alt={farmData.inputToken0.symbol} width="28px" height="28px" style={{ marginRight: '10px' }} />
                    <p className='token-symbol-container'>{farmData.inputToken0?.symbol}</p>
                  </>
                ) : (
                  <p>Select Token</p>
                )}
              </Box>
              <img src={addIcon} alt="add" width="32px" />
              <Box
                className={`currencyButton ${farmData.inputToken1.address.length > 0 ? 'currencySelected' : 'noCurrency'
                  }`}
                onClick={() => toggleInputtoken1Modal(true)}
              >
                {farmData.inputToken1.address.length > 0 ? (
                  <>
                    <img src={farmData.inputToken1.logoURI} alt={farmData.inputToken1.symbol} width="28px" height="28px" style={{ marginRight: '10px' }} />
                    <p className='token-symbol-container'>{farmData.inputToken1?.symbol}</p>
                  </>
                ) : (
                  <p>Select Token</p>
                )}
              </Box>
            </Stack>
            <div style={{ marginTop: '25px' }}>
              {(farmData.inputToken0.address.length > 0 || farmData.inputToken1.address.length > 0) && <SubTitle>Selected Pair of Tokens</SubTitle>}
              <div>
                {isValidPair &&
                  <TokenContainer style={{ borderRadius: '8px' }}>
                    <Stack direction="row" justifyContent="center" alignItems="center">
                      <img src={farmData.inputToken0.logoURI} alt="CNT" width="28px" height="28px" style={{ objectFit: 'contain' }} />
                      <img src={farmData.inputToken1.logoURI} alt="CNT" width="28px" height="28px" style={{ objectFit: 'contain' }} />
                    </Stack>
                    <Stack>
                      <TokenTitle style={{ fontSize: '18px', textAlign: 'center' }}>
                        Pair: {farmData.inputToken.address}
                      </TokenTitle>
                      <TokenTitle style={{ color: '#448aff', textAlign: 'center', fontSize: '16px' }}>
                        Balance: {farmData.inputToken.lpBal} LP
                      </TokenTitle>
                    </Stack>
                  </TokenContainer>
                }
                {isValidPair === false &&
                  <TokenContainer style={{ borderRadius: '60px', border: '1px solid #ff5252', background: 'rgba(255,82,82,.1)' }}>
                    <TokenTitle style={{ color: '#ff5252', textAlign: 'center', fontSize: '16px' }}>
                      Given Set of Pairs doesn't contain any valid Pair
                    </TokenTitle>
                  </TokenContainer>
                }
              </div>
            </div>
            <Stack direction="row" alignItems="center">
              <img src={rewardIcon} width="24px" alt="calendar" style={{ marginRight: '10px' }} />
              <SubTitle>Enter Reward Token Address</SubTitle>
            </Stack>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={12} md={6} lg={6}>
                <Box
                  className={`currencyButton ${farmData.rewardToken.address.length > 0 ? 'currencySelected' : 'noCurrency'
                    }`}
                  onClick={() => toggleRewardTokenModal(true)}
                >
                  {farmData.rewardToken.address.length > 0 ? (
                    <>
                      <img src={farmData.rewardToken.logoURI} alt={farmData.rewardToken.symbol} width="28px" height="28px" style={{ marginRight: '10px' }} />
                      <p className='token-symbol-container'>{farmData.rewardToken?.symbol}</p>
                    </>
                  ) : (
                    <p>Select Token</p>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12}>
                {farmData.rewardToken.address && farmData.rewardToken.address.length > 0 &&
                  <TokenContainer style={{ width: 'fit-content', padding: '10px 20px', borderRadius: '8px' }}>
                    <Stack direction="row" spacing={2}>
                      <img src={farmData.rewardToken.logoURI} alt="CNT" width="28px" height="28px" style={{ objectFit: 'contain' }} />
                      <Stack>
                        <TokenTitle style={{ fontSize: '16px' }}>
                          {`${farmData.rewardToken.name} ( ${farmData.rewardToken.symbol.toUpperCase()} )`}
                        </TokenTitle>
                        <TokenTitle style={{ color: '#448aff', fontSize: '16px' }}>
                          Balance: {farmData.rewardToken.balance} {farmData.rewardToken.symbol.toUpperCase()}
                        </TokenTitle>
                        <TokenTitle>
                          {farmData.rewardToken.address}
                        </TokenTitle>
                      </Stack>
                    </Stack>
                  </TokenContainer>
                }
              </Grid>
            </Grid>
            <div>
              <Stack direction="row" alignItems="center">
                <img src={rewardAmountIcon} width="24px" alt="calendar" style={{ marginRight: '10px' }} />
                <SubTitle>Enter Reward Amount</SubTitle>
              </Stack>
              <CssTextField
                fullWidth
                onChange={(event) => handleChange(event, "amount")}
                value={farmData.amount}
                type="number" id="outlined-basic"
                placeholder="Reward Amount"
                variant="outlined" />
              <SubTitle style={{ fontSize: '12px', color: '#696C80', marginTop: '10px' }}>*Min. Reward amount ${MIN_REWARDS} {farmData.minRewardAmount > 0 && `( ${farmData.minRewardAmount} ${farmData.rewardToken.symbol} )`}</SubTitle>
            </div>
            <div>
              <Stack direction="row" alignItems="center">
                <img src={calendarIcon} width="24px" alt="calendar" style={{ marginRight: '10px' }} />
                <SubTitle>Select Start Date and Time</SubTitle>
              </Stack>
              <InputWrapper>
                <DatePicker
                  selected={formatUTC(farmData.rewardDuration, true)}
                  wrapperClassName="display-flex"
                  showTimeSelect
                  minDate={new Date(Date.now())}
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  onChange={(date: any) => {
                    setFarmData({
                      ...farmData,
                      rewardDuration: formatUTC(date),
                    });
                  }}
                  customInput={<ExampleCustomInput />}
                />
              </InputWrapper>
            </div>
            <Stack sx={{ marginTop: '20px' }} justifyContent="center" alignItems="center">
              <Button
                fullWidth
                disabled={pendingTxn || disabledButton}
                onClick={onCreateFarm}
                sx={{
                  background: (pendingTxn || disabledButton) ? '#3E4252' : '#448aff',
                  color: '#ffffff',
                  width: '200px',
                  height: '48px',
                  padding: '6px 8px',
                  borderRadius: '10px',
                  fontFamily: 'Inter',
                  fontWeight: '700',
                }}
              >
                {pendingTxn ? 'Processing...' : 'Create Farm'}
              </Button>
            </Stack>
          </Card>
        </Stack >
      </Container >
    </div>
  )
}
export default withRouter(CreateFarm)
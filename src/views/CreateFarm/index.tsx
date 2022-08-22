// @ts-nocheck
import React, { forwardRef, useState, useEffect } from 'react'
import { withRouter } from 'react-router';
import Autocomplete from '@mui/material/Autocomplete';
import { Container, Grid, TextField, Stack, Button, Box } from '@mui/material';
import BigNumber from "bignumber.js";
import { ethers, Contract } from "ethers";
import { styled as muiStyled } from '@mui/material/styles';
import styled from 'styled-components';
import { useCreateFarm } from "@cryption/dapp-factory-sdk";
import DatePicker from "react-datepicker";
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
import previousIcon from '../../images/previous.png';

const TitleText = styled.p`
  color: #c7cad9;
  margin: 0;
  font-size: 35px;
  font-weight: 700;
      font-family: Inter;
  line-height: 1.43;
  text-align: center;
`;
const SubTitle = styled.p`
  color: #c7cad9;
  font-size: 20px;
  font-weight: 700;
      font-family: Inter;
  line-height: 1.43;
  text-align: center;
  margin-top: 25px;
  margin-bottom: 20px !important;
`;
const Card = styled.div`
  width: 100%;
  margin-top: 30px;
      font-family: Inter;
  border-radius: 10px;
  padding: 20px 20px;
  background-color: #1b1e29;
`;

const StyledInput = styled.input`
  font-size: 16px;
  font-weight: 800;
  color: rgb(199, 202, 217);
  background: transparent;
  border: none;
  padding: 6px 12px;
  min-height: 48px;
  cursor: pointer;
  &::placeholder {
       color: #c7cad9;
   }
   &:focus-visible {
    border: none;
    outline: none;
   }
`;
const CssTextField = muiStyled(TextField)({
  '& MuiInputBase-input': {
    fontFamily: 'Inter',
    color: '#c7cad9',
  },
  '& label.Mui-focused': {
    color: '#c7cad9',
  },
  '& label.MuiFormLabel-root': {
    color: '#c7cad9',
    fontFamily: 'Inter',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: '#c7cad9',
  },
  '& .MuiOutlinedInput-root': {
    color: '#c7cad9 !important',
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
  background-color: #448aff;
  border: 1px solid #448aff;
  border-radius: 14px;
  padding: 10px;
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

const ExampleCustomInput = forwardRef(({ value, onClick }: any, ref: any) => (
  <CustomButton className="example-custom-input" onClick={onClick} ref={ref}>
    {value}
  </CustomButton>
));
function CreateFarm(props: any) {
  const web3 = useWeb3();
  const [isValidPair, toggleValidPairAddress] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [pendingTxn, togglePendingTx] = useState(false);
  const [allowanceAmount, setAllowanceAmount] = useState(0);
  const [farmData, setFarmData] = useState({
    amount: "",
    rewardDuration: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
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

  const { launchFarmOrPool } = useCreateFarm(1);
  const { chainId, account } = useActiveWeb3React();
  const factoryContractAddress = getQuickswapSingleRewardFactory(chainId || 80001);
  // const factoryContract = useQuikcswapSingleRewardContract();
  const quickswapFactoryContract = useFactoryContract()
  const launchFarm = async () => {
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
      imgUrl: ""
    }
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
    } catch (error) {
      togglePendingTx(false)
      console.error('error', error)
    }
  }
  const onCreateFarm = async () => {
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
    console.log({ allowanceAmount, approvalAmount })
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
    }
  }
  useEffect(() => {
    const getToknList = async () => {
      const getTokens = await fetch('https://unpkg.com/quickswap-default-token-list@latest/build/quickswap-default.tokenlist.json')
      const tokenList = await getTokens.json()
      if (tokenList && tokenList.tokens) {
        const getTokensForChain = tokenList.tokens.filter(eachToken => eachToken.chainId === chainId)
        // if (chainId === 80001) {
        //   const testTokens = [
        //     {
        //       name: 'Cryption Network Token',
        //       symbol: 'CNT',
        //       address: '0x766f03e47674608cccf7414f6c4ddf3d963ae394',
        //       decimals: 18
        //     },
        //     {
        //       name: 'Tether USD',
        //       symbol: 'USDT',
        //       address: '0xD89a2E56B778AEfe719fc86E122B7db752Bb6B41',
        //       decimals: 6
        //     },
        //     {
        //       name: 'WETH',
        //       symbol: 'WETH',
        //       address: '0x2b5db7D98669be1242F62469214048cFe35d1a17',
        //       decimals: 18
        //     },
        //     {
        //       name: 'Wrapped Matic',
        //       symbol: 'WMATIC',
        //       address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
        //       decimals: 18
        //     },
        //     {
        //       name: 'USDC Stablecoin',
        //       symbol: 'USDC',
        //       address: '0x06B761Ea0c0EA5674743A184bB826960f6f6cFa0',
        //       decimals: 6
        //     },
        //   ]
        //   getTokensForChain = [
        //     ...getTokensForChain,
        //     ...testTokens
        //   ]
        // }
        setTokens(getTokensForChain)
      }
    }
    getToknList()
  }, [chainId])
  return (
    <Container maxWidth="lg" sx={{ paddingTop: '30px' }}>
      <div>
        <Button
          onClick={() => props.history.push('/')}
          startIcon={<img src={previousIcon} alt="img" width="30px" />}
          sx={{
            background: '#448aff',
            color: '#ffffff',
            height: '48px',
            fontFamily: 'Inter',
            fontWeight: '700',
            padding: '6px 8px',
            marginBottom: '20px',
            borderRadius: '30px'
          }}
        >
          Go Back to Farms
        </Button>
        <TitleText>
          Create Quickswap Single Reward Farm Powered by DappFactoy
        </TitleText>
        <Card>
          <SubTitle>Select Pair Of Input Tokens</SubTitle>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <Autocomplete
                id="country-select-demo"
                sx={{ width: 300 }}
                onChange={(event, newValue) => selectToken(newValue, 'inputToken0')}
                options={tokens}
                autoHighlight
                getOptionLabel={(option) => option.name}
                renderOption={(props, option) => (
                  <Stack {...props} style={{ padding: '6px 18px', cursor: 'pointer' }} direction="row" alignItems="center">
                    <img src={option.logoURI} alt={option.symbol} width="28px" height="28px" style={{ marginRight: '10px' }} />
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '800'
                    }}>
                      {`${option.name} ( ${option.symbol} )`}
                    </p>
                  </Stack>
                )}
                renderInput={(params) => (
                  <Box
                    ref={params.InputProps.ref}
                    className={`currencyButton ${farmData.inputToken0.address.length ? 'currencySelected' : 'noCurrency'
                      }`}
                  // onClick={handleOpenModal}
                  >
                    {farmData.inputToken0.address.length > 0 ? (
                      <>
                        <img src={farmData.inputToken0.logoURI} alt={farmData.inputToken0.symbol} width="28px" height="28px" style={{ marginRight: '10px' }} />
                        <StyledInput
                          placeholder={farmData.inputToken0?.symbol}
                          type="text"
                          {...params.inputProps}
                          style={{
                            fontSize: '16px',
                            fontWeight: '800',
                            background: 'transparent',
                            border: 'none',
                            color: '#c7cad9',
                          }}
                        />
                      </>
                    ) : (
                      <StyledInput
                        placeholder='Select Token 0'
                        type="text"
                        {...params.inputProps}
                        style={{
                          fontSize: '16px',
                          fontWeight: '800',
                          background: 'transparent',
                          border: 'none',
                          color: '#c7cad9',
                        }}
                      />
                    )}
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <Autocomplete
                id="country-select-demo"
                sx={{ width: 300 }}
                onChange={(event, newValue) => selectToken(newValue, 'inputToken1')}
                options={tokens}
                autoHighlight
                getOptionLabel={(option) => option.name}
                renderOption={(props, option) => (
                  <Stack {...props} style={{ padding: '6px 18px', cursor: 'pointer' }} direction="row" alignItems="center">
                    <img src={option.logoURI} alt={option.symbol} width="28px" height="28px" style={{ marginRight: '10px' }} />
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '800'
                    }}>
                      {`${option.name} ( ${option.symbol} )`}
                    </p>
                  </Stack>
                )}
                renderInput={(params) => (
                  <Box
                    ref={params.InputProps.ref}
                    className={`currencyButton ${farmData.inputToken1.address.length ? 'currencySelected' : 'noCurrency'
                      }`}
                  // onClick={handleOpenModal}
                  >
                    {farmData.inputToken1.address.length > 0 ? (
                      <>
                        <img src={farmData.inputToken1.logoURI} alt={farmData.inputToken1.symbol} width="28px" height="28px" style={{ marginRight: '10px' }} />
                        <StyledInput
                          placeholder={farmData.inputToken1?.symbol}
                          type="text"
                          {...params.inputProps}
                          style={{
                            fontSize: '16px',
                            fontWeight: '800',
                            background: 'transparent',
                            border: 'none',
                            color: '#c7cad9',
                          }}
                        />
                      </>
                    ) : (
                      <StyledInput
                        placeholder='Select Token 1'
                        type="text"
                        {...params.inputProps}
                        style={{
                          fontSize: '16px',
                          fontWeight: '800',
                          background: 'transparent',
                          border: 'none',
                          color: '#c7cad9',
                        }}
                      />
                    )}
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={12}>
              {(farmData.inputToken0.address.length > 0 || farmData.inputToken1.address.length > 0) && <SubTitle>Selected Pair of Tokens</SubTitle>}
              <Grid container spacing={3} justifyContent="center">
                {farmData.inputToken0.address && farmData.inputToken0.address.length > 0 &&
                  <Grid item xs={12} sm={12} md={6} lg={6}>
                    <TokenContainer>
                      <Stack direction="row" spacing={2}>
                        <img src={farmData.inputToken0.logoURI} alt="CNT" width="28px" height="28px" style={{ objectFit: 'contain' }} />
                        <Stack>
                          <TokenTitle>
                            {`${farmData.inputToken0.name} ( ${farmData.inputToken0.symbol.toUpperCase()} )`}
                          </TokenTitle>
                          <TokenTitle>
                            {farmData.inputToken0.address}
                          </TokenTitle>
                        </Stack>
                      </Stack>
                    </TokenContainer>
                  </Grid>
                }
                {farmData.inputToken1.address && farmData.inputToken1.address.length > 0 &&
                  <Grid item xs={12} sm={12} md={6} lg={6}>
                    <TokenContainer>
                      <Stack direction="row" spacing={2}>
                        <img src={farmData.inputToken1.logoURI} alt="CNT" width="28px" height="28px" style={{ objectFit: 'contain' }} />
                        <Stack>
                          <TokenTitle>
                            {`${farmData.inputToken1.name} ( ${farmData.inputToken1.symbol.toUpperCase()} )`}
                          </TokenTitle>
                          <TokenTitle>
                            {farmData.inputToken1.address}
                          </TokenTitle>
                        </Stack>
                      </Stack>
                    </TokenContainer>
                  </Grid>
                }
                <Grid item xs={12} sm={12} md={6} lg={6}>
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
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <SubTitle>Enter Reward Token Address</SubTitle>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <Autocomplete
                id="country-select-demo"
                sx={{ width: 300 }}
                onChange={(event, newValue) => selectToken(newValue, 'rewardToken')}
                options={tokens}
                autoHighlight
                getOptionLabel={(option) => option.name}
                renderOption={(props, option) => (
                  <Stack {...props} style={{ padding: '6px 18px', cursor: 'pointer' }} direction="row" alignItems="center">
                    <img src={option.logoURI} alt={option.symbol} width="28px" height="28px" style={{ marginRight: '10px' }} />
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '800'
                    }}>
                      {`${option.name} ( ${option.symbol} )`}
                    </p>
                  </Stack>
                )}
                renderInput={(params) => (
                  <Box
                    ref={params.InputProps.ref}
                    className={`currencyButton ${farmData.rewardToken.address.length ? 'currencySelected' : 'noCurrency'
                      }`}
                  // onClick={handleOpenModal}
                  >
                    {farmData.rewardToken.address.length > 0 ? (
                      <>
                        <img src={farmData.rewardToken.logoURI} alt={farmData.rewardToken.symbol} width="28px" height="28px" style={{ marginRight: '10px' }} />
                        <StyledInput
                          placeholder={farmData.rewardToken?.symbol}
                          type="text"
                          {...params.inputProps}
                          style={{
                            fontSize: '16px',
                            fontWeight: '800',
                            background: 'transparent',
                            border: 'none',
                            color: '#c7cad9',
                          }}
                        />
                      </>
                    ) : (
                      <StyledInput
                        placeholder='Select Reward Token'
                        type="text"
                        {...params.inputProps}
                        style={{
                          fontSize: '16px',
                          fontWeight: '800',
                          background: 'transparent',
                          border: 'none',
                          color: '#c7cad9',
                        }}
                      />
                    )}
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
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
          <SubTitle>Enter Reward Details</SubTitle>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <CssTextField
                fullWidth
                onChange={(event) => handleChange(event, "amount")}
                value={farmData.amount}
                type="number" id="outlined-basic"
                label="Reward Amount"
                variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
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
            </Grid>
          </Grid>
          <Stack sx={{ marginTop: '20px' }} justifyContent="center" alignItems="center">
            <Button
              disabled={pendingTxn}
              onClick={onCreateFarm}
              sx={{
                background: '#448aff',
                color: '#ffffff',
                width: '200px',
                height: '48px',
                padding: '6px 8px',
                borderRadius: '30px',
                fontFamily: 'Inter',
                fontWeight: '700',
              }}
            >
              {pendingTxn ? 'Processing...' : 'Create Farm'}
            </Button>
          </Stack>
        </Card>
      </div >
    </Container >
  )
}
export default withRouter(CreateFarm)
// @ts-nocheck
import React, { useEffect, forwardRef, useState } from 'react'
import { withRouter } from 'react-router';
import { Container, Grid, TextField, Stack, Button } from '@mui/material';
import BigNumber from "bignumber.js";
import { ethers, Contract } from "ethers";
import { styled as muiStyled } from '@mui/material/styles';
import styled from 'styled-components';
import { getFeeManagerDetails, getFeeManagerAccountDetails, useCreateFarm } from "@cryption/dapp-factory-sdk";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  useQuikcswapSingleRewardContract,
} from "../../hooks/useContract";
import tokenAbi from "../../config/constants/abi/token.json";
import { getERC20Contract, getPolydexLpContract } from '../../utils/contractHelpers';
import useWeb3 from "../../hooks/useWeb3";
import {
  getQuickswapSingleRewardFactory,
  getRouterAddress
} from "../../utils/addressHelpers";
import { IPFS_DEFAULT_IMAGES } from '../../config';
import useActiveWeb3React from "../../hooks";
import previousIcon from '../../images/previous.png';

const TitleText = styled.p`
  color: #c7cad9;
  margin: 0;
  font-size: 35px;
  font-weight: 700;
  line-height: 1.43;
  text-align: center;
`;
const SubTitle = styled.p`
  color: #c7cad9;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.43;
  text-align: center;
  margin-top: 25px;
  margin-bottom: 20px !important;
`;
const Card = styled.div`
  width: 100%;
  margin-top: 30px;
  border-radius: 10px;
  padding: 20px 20px;
  background-color: #1b1e29;
`;

const CssTextField = muiStyled(TextField)({
  '& MuiInputBase-input': {
    color: '#c7cad9',
  },
  '& label.Mui-focused': {
    color: '#c7cad9',
  },
  '& label.MuiFormLabel-root': {
    color: '#c7cad9',
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

const ExampleCustomInput = forwardRef(({ value, onClick }: any, ref: any) => (
  <CustomButton className="example-custom-input" onClick={onClick} ref={ref}>
    {value}
  </CustomButton>
));
function CreateFarm(props: any) {
  const web3 = useWeb3();
  const [isFarmLpAddress, toggleFarmLpAddress] = useState(true);
  const [allowanceAmount, setAllowanceAmount] = useState(0);
  const [feeManagerDetails, setFeeManagerDetails] = useState({
    name: "",
    symbol: "",
    decimals: "",
    address: "",
    feeAmount: "",
    allowance: "",
    isFeeManagerEnabled: false,
    userBalance: "",
  });
  const [farmData, setFarmData] = useState({
    amount: "",
    rewardDuration: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    feeAddress: "",
    referrer: "",
    rewardToken: {
      address: "",
      tokenName: "",
      decimals: "",
      symbol: "",
    },
    inputToken: {
      address: "",
      tokenName: "previousIcon",
      decimals: "",
      symbol: "",
    },
  });
  const { launchFarmOrPool, txnHash, txnError, pendingTxn } = useCreateFarm(1);
  const { chainId, account } = useActiveWeb3React();
  const factoryContractAddress = getQuickswapSingleRewardFactory(chainId || 80001);
  const factoryContract = useQuikcswapSingleRewardContract();
  console.log({ txnHash, txnError, pendingTxn })
  const launchFarm = async () => {
    const rewardToken = {
      address: farmData.rewardToken.address,
      symbol: farmData.rewardToken.symbol,
      decimals: parseInt(farmData.rewardToken.decimals),
      imgUrl: ""
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
      const check = await launchFarmOrPool(rewardToken, inputToken, "", 0, 0, "", "", "", "", routerAddress, rewardTokenAmountWei, null, 0, differenceInSecondsForRewardDuration);
      console.log({ check })
    } catch (error) {
      console.log('error', error)
    }
  }
  const onCreateFarm = async () => {
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
  const handleTokenAddress = async (address: string, type: string) => {
    setFarmData({
      ...farmData,
      [type]: {
        address: address,
      },
    });
  };
  const handleOnBlur = async (address: string, type: string) => {
    try {
      const isValidAddress = web3.utils.isAddress(address);
      if (isValidAddress) {
        if (type === "inputToken") {
          try {
            const lpContract = getPolydexLpContract(address, web3);
            const token0 = await lpContract.methods.token0().call();
            if (token0) {
              toggleFarmLpAddress(true);
            }
          } catch (error) {
            console.error(error);
            toggleFarmLpAddress(false);
          }
        }
        const contractDetails = getERC20Contract(address, web3);
        const name = await contractDetails.methods.name().call();
        const symbol = await contractDetails.methods.symbol().call();
        const decimal = await contractDetails.methods.decimals().call();
        if (type === "rewardToken") {
          const allowance = await contractDetails.methods
            .allowance(account, factoryContractAddress)
            .call();
          setAllowanceAmount(allowance);
        }
        setFarmData({
          ...farmData,
          [type]: {
            tokenName: name,
            address: address,
            symbol: symbol,
            decimals: decimal,
          },
        });
      } else {
        console.error("Not a valid Token address")
      }
    } catch (e) {
      console.error("error is", e);
    }
  };
  const convertWeiToEther = (
    etherValue: string,
    decimals: number | string
  ): string => {
    return new BigNumber(etherValue)
      .dividedBy(new BigNumber(10).pow(decimals))
      .toJSON();
  };
  useEffect(() => {
    const getFees = async () => {
      const feeManagerDetails = await getFeeManagerDetails(
        factoryContract,
        factoryContractAddress,
        chainId || 80001,
        web3
      );
      const feeManagerAccountDetails = await getFeeManagerAccountDetails(
        feeManagerDetails.isFeeManagerEnabled,
        account,
        web3,
        chainId || 80001,
        factoryContractAddress,
        feeManagerDetails.address
      );
      console.log({ feeManagerAccountDetails })
      setFeeManagerDetails({
        name: feeManagerDetails.name,
        symbol: feeManagerDetails.symbol,
        decimals: feeManagerDetails.decimals,
        address: feeManagerDetails.address,
        feeAmount: feeManagerDetails.feeAmount,
        allowance: feeManagerAccountDetails.feeTokenAllowance || "0",
        isFeeManagerEnabled: feeManagerDetails.isFeeManagerEnabled,
        userBalance: feeManagerAccountDetails.feeTokenUserBalance || "0",
      });
    }
    if (account && chainId) {
      getFees();
    }
  }, [account, chainId, factoryContract, factoryContractAddress, web3])
  console.log({ allowanceAmount });
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
          <SubTitle>Enter Input Token Address</SubTitle>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <CssTextField
                onBlur={(event) => handleOnBlur(event.target.value, "inputToken")}
                onChange={(event) => handleTokenAddress(event.target.value, "inputToken")}
                value={farmData.inputToken.address}
                fullWidth id="outlined-basic"
                label="Token Address"
                variant="outlined"
                error={!isFarmLpAddress}
                helperText={!isFarmLpAddress && 'Not an Valid LP Address'}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <CssTextField value={farmData.inputToken.tokenName} fullWidth id="outlined-basic" label="Token name" variant="outlined" disabled />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <CssTextField value={farmData.inputToken.symbol} fullWidth id="outlined-basic" label="Token symbol" variant="outlined" disabled />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <CssTextField value={farmData.inputToken.decimals} fullWidth id="outlined-basic" label="Token Decimals" variant="outlined" disabled />
            </Grid>
          </Grid>
          <SubTitle>Enter Reward Token Address</SubTitle>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <CssTextField
                onBlur={(event) => handleOnBlur(event.target.value, "rewardToken")}
                onChange={(event) => handleTokenAddress(event.target.value, "rewardToken")}
                value={farmData.rewardToken.address} fullWidth id="outlined-basic" label="Token Address" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <CssTextField value={farmData.rewardToken.tokenName} fullWidth id="outlined-basic" label="Token name" variant="outlined" disabled />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <CssTextField value={farmData.rewardToken.symbol} fullWidth id="outlined-basic" label="Token symbol" variant="outlined" disabled />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <CssTextField value={farmData.rewardToken.decimals} fullWidth id="outlined-basic" label="Token Decimals" variant="outlined" disabled />
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
          {feeManagerDetails.isFeeManagerEnabled && (
            <Stack spacing={2} style={{ width: '100%', marginTop: '20px' }}>
              <Stack spacing={5} direction="row" justifyContent="space-around">
                <SubTitle>Launch Fees</SubTitle>
                <Stack spacing={2} direction="row" alignItems="center" justifyContent="center">
                  <SubTitle>{new BigNumber(
                    convertWeiToEther(
                      feeManagerDetails.feeAmount,
                      feeManagerDetails.decimals
                    )
                  ).toFixed(3)}{" "}
                  </SubTitle>
                  <img
                    src={
                      IPFS_DEFAULT_IMAGES[
                      feeManagerDetails.symbol.toUpperCase()
                      ]
                    }
                    alt={feeManagerDetails.symbol}
                    width="20px"
                    style={{ objectFit: 'contain' }}
                  />
                </Stack>
              </Stack>
              {feeManagerDetails.address !== "0x0000000000000000000000000000000000000000" &&
                <Stack spacing={5} direction="row" justifyContent="space-around">
                  <SubTitle>Current Allowance</SubTitle>
                  <Stack spacing={2} direction="row" alignItems="center" justifyContent="center">
                    <SubTitle>{new BigNumber(
                      convertWeiToEther(
                        feeManagerDetails.allowance,
                        feeManagerDetails.decimals
                      )
                    ).toFixed(3)}{" "}
                    </SubTitle>
                    <img
                      src={
                        IPFS_DEFAULT_IMAGES[
                        feeManagerDetails.symbol.toUpperCase()
                        ]
                      }
                      alt={feeManagerDetails.symbol}
                      width="20px"
                      style={{ objectFit: 'contain' }}
                    />
                  </Stack>
                </Stack>}
              <Stack spacing={5} direction="row" justifyContent="space-around">
                <SubTitle>{feeManagerDetails.symbol} Balance</SubTitle>
                <Stack spacing={2} direction="row" alignItems="center" justifyContent="center">
                  <SubTitle>{new BigNumber(
                    convertWeiToEther(
                      feeManagerDetails.userBalance,
                      feeManagerDetails.decimals
                    )
                  ).toFixed(3)}
                  </SubTitle>
                  <img
                    src={
                      IPFS_DEFAULT_IMAGES[
                      feeManagerDetails.symbol.toUpperCase()
                      ]
                    }
                    alt={feeManagerDetails.symbol}
                    width="20px"
                    style={{ objectFit: 'contain' }}
                  />
                </Stack>
              </Stack>
            </Stack>
          )}
          {feeManagerDetails.isFeeManagerEnabled ? (
            <Stack direction="row" justifyContent="space-around" spacing={5} alignItems="center" sx={{ marginTop: '25px' }}>
              <Button
                disabled={new BigNumber(
                  feeManagerDetails.feeAmount
                ).isLessThanOrEqualTo(feeManagerDetails.allowance)}
                sx={{
                  color: '#448aff',
                  width: '200px',
                  height: '48px',
                  padding: '6px 8px',
                  borderRadius: '30px',
                  border: '1px solid #448aff'
                }}
              >
                Approve Fee Manager
              </Button>
              <Button
                disabled={
                  new BigNumber(
                    feeManagerDetails.feeAmount
                  ).isGreaterThanOrEqualTo(
                    feeManagerDetails.allowance
                  ) || pendingTxn
                }
                onClick={onCreateFarm}
                sx={{
                  background: '#448aff',
                  color: '#ffffff',
                  width: '200px',
                  height: '48px',
                  padding: '6px 8px',
                  borderRadius: '30px'
                }}
              >
                {pendingTxn ? 'Processing...' : 'Create Farm'}
              </Button>
            </Stack>
          )
            :
            <Button
              disabled={pendingTxn}
              onClick={onCreateFarm}
              sx={{
                background: '#448aff',
                color: '#ffffff',
                width: '200px',
                height: '48px',
                padding: '6px 8px',
                borderRadius: '30px'
              }}
            >
              {pendingTxn ? 'Processing...' : 'Create Farm'}
            </Button>
          }
        </Card>
      </div >
    </Container >
  )
}
export default withRouter(CreateFarm)
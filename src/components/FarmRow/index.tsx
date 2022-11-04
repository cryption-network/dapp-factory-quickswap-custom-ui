// @ts-nocheck
import {
  Flex,
  Text,
  Button,
} from "cryption-uikit-v2";
import React, { useState, useMemo, useEffect, useCallback, forwardRef } from "react";
import { Stack, TextField, Grid } from '@mui/material';
import { ethers, Contract } from "ethers";
import { styled as muiStyled } from '@mui/material/styles';
import { LP_IMAGE_SEPERATOR_STRING } from '@cryption/dapp-factory-sdk';
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import styled from "styled-components";
import BigNumber from "bignumber.js";
import DatePicker from "react-datepicker";
import CountUp from "react-countup";
import useWeb3 from '../../hooks/useWeb3';
import { Box } from '@mui/material';
import { getFullDisplayBalance, getBalanceNumber } from "../../utils/formatBalance";
import getCoinGeckoPrice from "../../utils/getCoinGeckoPrice";
import TokenInput from '../../components/TokenInput';
import { useQuickswapSingleRewardContract } from "../../hooks/useContract";
import tokenAbi from "../../config/constants/abi/token.json";
import { getApollo } from "../../apollo";
import { getTokenPrice } from '../../apollo/queries'

const SECONDS_PER_YEAR = new BigNumber(31536000);
const setMetamaskGasPrice = {
  maxPriorityFeePerGas: null,
  maxFeePerGas: null,
};
const CustomCard = styled(Box)`
  width: 100%;
  border-radius: 10px;
  font-family:'Inter';
  padding: 16px 0;
  padding-bottom: 50px;
  position: relative;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.cardBg};
`;
const SubTitle = styled.p`
  color: #c7cad9;
  font-size: 18px;
  font-weight: 500;
  font-family: Inter;
  line-height: 1.43;
  text-align: left;
  margin-bottom: 10px;
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
  height: 56px;
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
const InputWrapper = styled.div`
  position: relative;
  margin: 0;
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
const CustomCardInner = styled(Box)`
  display: flex;
  align-items: center;
  font-family:'Inter';
  padding: '0px'
`;
const FarmDetails = styled(Box)`
  width: 100%;
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  font-family:'Inter';
  border-top: 1px solid #444;
  align-items: center;
  justify-content:space-between;
`;
const ImageContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  justify-content: center;
  font-family:'Inter';
  align-items: center;
  padding: 10px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
`;
const BottomRow = styled.div`
  background: #3E4252;
  padding: 5px 16px;
  border-radius: 0px 0px 10px 10px;
  position: absolute;
  bottom: 0px;
  width: 100%;
`;
interface IFarmCard {
  farm: any;
  account?: string;
  getServiceId?: (id: string) => void;
  customgradient?: string;
  customPrimaryColor?: string;
  chainId?: any;
  coingeckoids?: any
  ethPrice?:any
}

export default function FarmRow({ farm, account, getServiceId, customgradient, customPrimaryColor, chainId, coingeckoids, ethPrice }: IFarmCard) {
  const quickswapSingleReward = useQuickswapSingleRewardContract(farm.id);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [isToken0ImgExists, setToken0ImgStatus] = useState(true);
  const [notifyRewardData, setNotifyReward] = useState({
    amount: "",
    startTime: new Date(parseFloat(farm.periodFinish) * 1000),
  });
  const client = getApollo(chainId);
  const [pendingTx, setPendingTx] = useState(false);
  const [pendingStakeTx, setPendingStakeTx] = useState(false);
  const [pendingUnstakeTx, setPendingUnstakeTx] = useState(false);
  const [userAllowance, setUserAllowance] = useState(
    farm?.allowance ? new BigNumber(farm.allowance) : new BigNumber("0")
  );
  const [depositVal, setDepositVal] = useState("");
  const [withdrawVal, setWithdrawVal] = useState("");
  const [pendingNotifyRewardsTx, setPendingNotifyRewardsTx] = useState(false);
  const [isSingleLpImg, setIsSingleLpImg] = useState(false);
  const [isToken1ImgExists, setToken1ImgStatus] = useState(true);
  const [token0Img, setToken0Img] = useState("");
  const [token1Img, setToken1Img] = useState("");
  const [isRewardImgExists, setRewardImgStatus] = useState(true);
  const [liquidity, setLiquidity] = useState(new BigNumber(0));
  const [isExpandCard, setExpandCard] = useState(false);
  const [apy, setApy] = useState(new BigNumber(0));
  const web3 = useWeb3();
  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(new BigNumber(farm.tokenBalance), 18);
  }, [farm.tokenBalance]);
  const stakedBalance = useMemo(() => {
    return getFullDisplayBalance(new BigNumber(farm.stakedBalance), 18);
  }, [farm.stakedBalance]);
  const earned = getBalanceNumber(
    farm?.earnings ? new BigNumber(farm.earnings) : new BigNumber("0")
  );
  const handleDepositChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setDepositVal(e.currentTarget.value);
    },
    [setDepositVal]
  );
  const handleSelectMax = useCallback(() => {
    const bal = getBalanceNumber(new BigNumber(farm.tokenBalance), 18)
    setDepositVal(bal.toString());
  }, [farm.tokenBalance]);
  const handleWithdrawChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setWithdrawVal(e.currentTarget.value);
    },
    [setWithdrawVal]
  );
  const handleSelectMaxForWithdraw = useCallback(() => {
    const bal = getBalanceNumber(new BigNumber(farm.stakedBalance), 18)
    setWithdrawVal(bal.toString());
  }, [farm.stakedBalance]);
  const handleApprove = async () => {
    try {
      setApprovalLoading(true);
      const approvalAmount = ethers.utils.parseUnits(depositVal.toString(), 18);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new Contract(farm.inputToken, tokenAbi.abi, signer);
      const approvalTx = await tokenContract.approve(farm.id, approvalAmount);
      await approvalTx.wait();
      const allowanceAmount = await tokenContract.allowance(account, farm.id);
      setUserAllowance(new BigNumber(allowanceAmount.toString()));
      setApprovalLoading(false);
    } catch (error) {
      console.error(error);
      setApprovalLoading(false);
    }
  };
  const onHarvest = async () => {
    try {
      setPendingTx(true);
      // toastInfo("Processing...", `You requested to Harvest `);
      await quickswapSingleReward.methods.getReward().send({ from: account, ...setMetamaskGasPrice });
      // toastSuccess("Success", ` Harvested successfully`);
      setPendingTx(false);
    } catch (error) {
      console.error(error);
      setPendingTx(false);
      // toastError("Error", "Failed to Harvest");
    }
  };
  const onStake = async () => {
    try {
      setPendingStakeTx(true)
      // toastInfo("Processing...", `You requested to Deposited `);
      await quickswapSingleReward.methods.stake(new BigNumber(depositVal)
        .times(new BigNumber(10).pow(18))
        .toString()).send({ from: account, ...setMetamaskGasPrice });
      setPendingStakeTx(false)
      // toastSuccess("Success", ` Deposited successfully`);
    } catch (error) {
      setPendingStakeTx(false)
      console.error(error);
      // toastError("Error", "Failed to Deposit");
    }
  }
  const onUnstake = async () => {
    try {
      setPendingUnstakeTx(true)
      // toastInfo("Processing...", `You requested to withdraw `);
      await quickswapSingleReward.methods
        .withdraw(
          new BigNumber(withdrawVal)
            .times(new BigNumber(10).pow(farm.rewardToken.decimal))
            .toString()
        )
        .send({ from: account, ...setMetamaskGasPrice });
      setPendingUnstakeTx(false)
      // toastSuccess("Success", `Withdrew successfully`);
    } catch (error) {
      setPendingUnstakeTx(false)
      console.error(error);
      // toastError("Error", "Failed to withdraw");
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
  const notifyRewards = async () => {
    if (farm) {
      const differenceInSeconds = Math.floor(
        (notifyRewardData.startTime.valueOf() -
          new Date(Date.now()).valueOf()) /
        1000
      );
      try {
        const approvalAmount = ethers.utils.parseUnits(
          notifyRewardData.amount.toString(),
          farm.rewardToken.decimal
        );
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new Contract(
          farm?.rewardToken.address,
          tokenAbi.abi,
          signer
        );
        setPendingNotifyRewardsTx(true);
        const allowanceAmount = await tokenContract.allowance(account, farm.id);
        if (
          new BigNumber(allowanceAmount.toString()).isLessThan(
            new BigNumber(approvalAmount.toString())
          )
        ) {
          const approvalTx = await tokenContract.approve(farm.id, approvalAmount);
          await approvalTx.wait();
          await quickswapSingleReward.methods
            .notifyRewardAmount(approvalAmount, differenceInSeconds)
            .send({ from: account, ...setMetamaskGasPrice });
        } else {
          await quickswapSingleReward.methods
            .notifyRewardAmount(approvalAmount, differenceInSeconds)
            .send({ from: account, ...setMetamaskGasPrice });
        }
        setPendingNotifyRewardsTx(false);
      } catch (error) {
        setPendingNotifyRewardsTx(false);
        console.error("Error while Starting Rewards: ", error);
      }
    }
  };
  useEffect(() => {
    const getLiquidity = async () => {
      const token0Price = await client.query({
        query: getTokenPrice,
        variables: {
          first: 1000,
          skip: 0,
          id: farm.token0Data.address.toLowerCase(),
          // where: { symbol: "CNT" },
        },
        context: {
          clientName: "tokenprice",
        },
      });
      const token1Price = await client.query({
        query: getTokenPrice,
        variables: {
          first: 1000,
          skip: 0,
          id: farm.token1Data.address.toLowerCase(),
          // where: { symbol: "CNT" },
        },
        context: {
          clientName: "tokenprice",
        },
      });
      const rewardTokens = await client.query({
        query: getTokenPrice,
        variables: {
          first: 1000,
          skip: 0,
          id: farm.rewardToken.address.toLowerCase(),
          // where: { symbol: "CNT" },
        },
        context: {
          clientName: "tokenprice",
        },
      });
      let token0PriceInUSD = '1'
      let token1PriceInUSD = "1"
      let rewardTokenPrice = "1"
      if (token0Price.data && token0Price.data.tokens && token0Price.data.tokens.length > 0) {
        token0PriceInUSD = new BigNumber(token0Price.data.tokens[0].derivedETH).multipliedBy(ethPrice).toFixed(4).toString();
        if (parseFloat(token0PriceInUSD) <= 0) {
          token0PriceInUSD = await getCoinGeckoPrice(farm.token0Data.symbol.toLowerCase(), farm.token0Data.name, coingeckoids);
        }
      } else {
        token0PriceInUSD = await getCoinGeckoPrice(farm.token0Data.symbol.toLowerCase(), farm.token0Data.name, coingeckoids);
      }
      if (token1Price.data && token1Price.data.tokens && token1Price.data.tokens.length > 0) {
        token1PriceInUSD = new BigNumber(token1Price.data.tokens[0].derivedETH).multipliedBy(ethPrice).toFixed(4).toString();
        if (parseFloat(token1PriceInUSD) <= 0) {
          token1PriceInUSD = await getCoinGeckoPrice(farm.token1Data.symbol.toLowerCase(), farm.token1Data.name, coingeckoids);
        }
      } else {
        token1PriceInUSD = await getCoinGeckoPrice(farm.token1Data.symbol.toLowerCase(), farm.token1Data.name, coingeckoids);
      }
      if (rewardTokens.data && rewardTokens.data.tokens && rewardTokens.data.tokens.length > 0) {
        rewardTokenPrice = new BigNumber(rewardTokens.data.tokens[0].derivedETH).multipliedBy(ethPrice).toFixed(4).toString();
        if (parseFloat(rewardTokenPrice) <= 0) {
          rewardTokenPrice = await getCoinGeckoPrice(farm.rewardToken.symbol.toLowerCase(), farm.rewardToken.name, coingeckoids);
        }
        rewardTokenPrice = await getCoinGeckoPrice(farm.rewardToken.symbol.toLowerCase(), farm.rewardToken.name, coingeckoids);
      }
      let liquidityUsd = new BigNumber(token0PriceInUSD)
        .multipliedBy(farm.tokenAmount)
        .plus(
          new BigNumber(token1PriceInUSD).multipliedBy(
            new BigNumber(farm.quoteTokenAmount)
          )
        );
      if (token0PriceInUSD) {
        liquidityUsd = new BigNumber(token0PriceInUSD)
          .multipliedBy(farm.tokenAmount)
          .plus(
            new BigNumber(token0PriceInUSD).multipliedBy(
              new BigNumber(farm.tokenAmount)
            )
          );
      } else if (token1PriceInUSD) {
        liquidityUsd = new BigNumber(token1PriceInUSD)
          .multipliedBy(farm.quoteTokenAmount)
          .plus(
            new BigNumber(token1PriceInUSD).multipliedBy(
              new BigNumber(farm.quoteTokenAmount)
            )
          );
      }
      const cakeRewardPerBlock = new BigNumber(
        web3.utils.fromWei(farm.rewardToken.rewardsPerToken.toString())
      );

      const denominator = new BigNumber(
        liquidityUsd
      ).isGreaterThan(0)
        ? liquidityUsd
        : new BigNumber(1);

      const calculatedAPY = new BigNumber(rewardTokenPrice)
        .multipliedBy(SECONDS_PER_YEAR)
        .multipliedBy(cakeRewardPerBlock)
        .dividedBy(denominator).times(100)
        .toFixed(2);
      setApy(new BigNumber(calculatedAPY));
      setLiquidity(liquidityUsd);
    };
    getLiquidity();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farm.lpTotalInQuoteToken, farm.multiplier, farm.quoteTokenAmount, farm.rewardToken.name, farm.rewardToken.rewardsPerToken, farm.rewardToken.symbol, farm.token0Data.name, farm.token0Data.symbol, farm.token1Data.name, farm.token1Data.symbol, farm.tokenAmount, web3.utils]);
  useEffect(() => {
    if (
      farm.allowance &&
      !new BigNumber(farm.allowance).isEqualTo(userAllowance) &&
      userAllowance.isLessThan(farm.allowance)
    ) {
      setUserAllowance(new BigNumber(farm.allowance));
    }
    const checkIfImgExists = async () => {
      try {
        const checkIfExits = farm.inputTokenURL.includes(LP_IMAGE_SEPERATOR_STRING);
        if (checkIfExits) {
          const images = farm.inputTokenURL.split(LP_IMAGE_SEPERATOR_STRING)
          setIsSingleLpImg(true)
          try {
            await fetch(images[0]);
            setToken0Img(images[0])
          }
          catch (error) {
            setToken0ImgStatus(false);
          }
          try {
            await fetch(images[1]);
            setToken1Img(images[1])
          }
          catch (error) {
            setToken1ImgStatus(false);
          }
        } else {
          try {
            const token0ImgLink = farm.inputTokenURL;
            if (token0ImgLink && token0ImgLink.length > 0) {
              await fetch(token0ImgLink);
              setToken0Img(token0ImgLink);
            } else {
              setToken0ImgStatus(false);
            }
          } catch (error) {
            setToken0ImgStatus(false);
          }
        }
      } catch (error) {
        console.error(error);
      }

      if (farm.rewardToken && farm.rewardToken.rewardTokenURL) {
        try {
          await fetch(farm.rewardToken.rewardTokenURL);
        } catch (error) {
          setRewardImgStatus(false);
        }
      } else {
        setRewardImgStatus(false);
      }
    };
    checkIfImgExists();
  }, [
    farm,
    userAllowance,
  ]);
  return (
    <CustomCard style={{ marginTop: '24px', border: isExpandCard ? '1px solid #448aff' : 'none', boxShadow: isExpandCard ? '0 0 5px 5px rgb(68 138 255 / 30%)' : 'none' }}
      className={`${isExpandCard ? 'highlightedCard' : ''}`}
    >
      <CustomCardInner onClick={() => setExpandCard(!isExpandCard)}>
        <Box width={0.3} style={{ paddingLeft: '16px' }}>
          <Flex alignItems="center">
            <Flex style={{ position: 'relative', marginRight: "15px" }}>
              {isToken0ImgExists ? (
                <img
                  src={token0Img}
                  alt={farm.token0Data.symbol}
                  width="30px"
                  height="30px"
                />
              ) : (
                <ImageContainer>
                  <HelpOutlineIcon />
                </ImageContainer>
              )}
              {isSingleLpImg && isToken1ImgExists &&
                <img
                  src={token1Img}
                  style={{ position: 'absolute', left: '20px' }}
                  alt={farm.token0Data.symbol}
                  width="30px"
                  height="30px"
                />
              }
            </Flex>
            <Box ml={1.5}>
              <Text fontFamily="Inter">
                {`${farm.token0Data.symbol} / ${farm.token1Data.symbol} LP`}
              </Text>
            </Box>
          </Flex>
        </Box>
        <Box width={0.2} textAlign='center'>
          <Text bold fontSize="18px" color="primary" fontFamily="Inter">
            <CountUp
              end={liquidity?.toNumber()}
              duration={1}
              decimals={2}
              suffix="$"
            />
          </Text>
        </Box>
        <Box width={0.15} textAlign='center'>
          <Text bold fontSize="18px" color="success" fontFamily="Inter">
            <CountUp
              end={apy?.toNumber()}
              duration={1}
              decimals={2}
              suffix="%"
            />
          </Text>
        </Box>
        <Box width={0.35} textAlign='center' style={{ padding: '0px 16px' }}>
          <Flex flexDirection="column" alignItems="flex-end" pl="16px">
            <Text bold fontSize="18px" fontFamily="Inter">
              {earned.toLocaleString()}
            </Text>
            <Flex alignItems="center">
              {isRewardImgExists ? (
                <img
                  src={farm.rewardToken.rewardTokenURL}
                  alt={farm.rewardToken.symbol}
                  width="16px"
                  height="16px"
                />
              ) : (
                <ImageContainer>
                  <HelpOutlineIcon />
                </ImageContainer>
              )}
              <Text fontSize="14px" color="gray" ml="10px" fontFamily="Inter">
                {farm.rewardToken.symbol}
              </Text>
            </Flex>
          </Flex>
        </Box>
      </CustomCardInner>
      {isExpandCard &&
        <FarmDetails style={{ marginTop: '20px' }}>
          <Box width={0.3}>
            <Flex justifyContent="space-between" mb="20px">
              <Text color="gray" fontWeight="500" fontFamily="Inter">
                In wallet:
              </Text>
              <Text color="text" fontWeight="800" fontFamily="Inter">
                {fullBalance.toLocaleString()} LP
              </Text>
            </Flex>
            <TokenInput value={depositVal} onChange={handleDepositChange} onSelectMax={handleSelectMax} />
            {userAllowance && new BigNumber(userAllowance).dividedBy(10 ** 18).isGreaterThanOrEqualTo(depositVal) ? (
              <Flex justifyContent="center" marginTop="20px">
                <Button
                  scale="md"
                  onClick={onStake}
                  style={{ backgroundImage: "linear-gradient(105deg,#448aff 3%,#448aff)", borderRadius: '10px', width: '100%' }}
                  disabled={pendingStakeTx || new BigNumber(farm.tokenBalance).isLessThanOrEqualTo(0) || parseFloat(depositVal) <= 0}
                >
                  {pendingStakeTx ? 'Processing...' : 'Stake'}
                </Button>
              </Flex>
            ) : (
              <Flex justifyContent="center" marginTop="20px">
                <Button
                  isLoading={approvalLoading}
                  onClick={handleApprove}
                  disabled={depositVal === ""}
                  style={{ backgroundImage: "linear-gradient(105deg,#448aff 3%,#448aff)", width: '100%', borderRadius: '10px' }}
                  scale="md"
                >
                  {approvalLoading ? "Approving..." : "Approve"}
                </Button>
              </Flex>
            )}
          </Box>
          <Box width={0.3}>
            <Flex justifyContent="space-between" mb="20px">
              <Text color="gray" fontWeight="500" fontFamily="Inter">
                My Deposits
              </Text>
              <Text color="text" fontWeight="800" fontFamily="Inter">
                {stakedBalance.toLocaleString()} LP
              </Text>
            </Flex>
            <TokenInput value={withdrawVal} onChange={handleWithdrawChange} onSelectMax={handleSelectMaxForWithdraw} />
            <Flex justifyContent="center" marginTop="20px">
              <Button
                scale="md"
                style={{ backgroundImage: "linear-gradient(105deg,#448aff 3%,#448aff)", borderRadius: '10px', width: '100%' }}
                onClick={onUnstake}
                disabled={new BigNumber(stakedBalance).isLessThanOrEqualTo(0) || pendingUnstakeTx || parseFloat(withdrawVal) <= 0 || withdrawVal === ""}
              >
                {pendingUnstakeTx ? 'Processing...' : 'Unstake'}
              </Button>
            </Flex>
          </Box>
          <Box width={0.3}>
            <Flex flexDirection="column" alignItems="center" justifyContent="center">
              <Text color="gray" fontWeight="500" mb="10px" fontFamily="Inter">
                Unclaimed Rewards:
              </Text>
              {isRewardImgExists ? (
                <img
                  src={farm.rewardToken.rewardTokenURL}
                  alt={farm.rewardToken.symbol}
                  width="16px"
                  height="16px"
                />
              ) : (
                <ImageContainer>
                  <HelpOutlineIcon />
                </ImageContainer>
              )}
              <Text color="text" fontWeight="800" mb="20px" mt="10px" fontFamily="Inter">
                {earned.toLocaleString()} {farm.rewardToken.symbol}
              </Text>
              <Button
                onClick={onHarvest}
                style={{ backgroundImage: "linear-gradient(105deg,#448aff 3%,#448aff)", borderRadius: '10px', width: '100%' }}
                disabled={
                  parseFloat(
                    getBalanceNumber(new BigNumber(earned), 18).toString()
                  ) <= 0 || pendingTx
                }
                scale="md"
              >
                {pendingTx ? "Collecting..." : "Claim"}
              </Button>
            </Flex>
          </Box>
          {false && account?.toLowerCase() === farm.owner.toLowerCase() &&
            <div style={{ width: '100%', marginTop: '20px' }}>
              <Text fontFamily="Inter" fontSize="18px" fontWeight="800" mb="20px">
                Extend Farm Rewards
              </Text>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Flex
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    flexDirection="column"
                  >
                    <SubTitle>
                      Reward Amount
                    </SubTitle>
                    <CssTextField
                      fullWidth
                      onChange={(event) => setNotifyReward(data => ({ ...data, amount: event.target.value }))}
                      value={notifyRewardData.amount}
                      type="number" id="outlined-basic"
                      placeholder="Reward Amount"
                      variant="outlined" />
                  </Flex>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Flex
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    flexDirection="column"
                  >
                    <SubTitle>
                      Extend Rewards Until
                    </SubTitle>
                    <InputWrapper>
                      <DatePicker
                        selected={formatUTC(notifyRewardData.startTime, true)}
                        wrapperClassName="display-flex"
                        showTimeSelect
                        minDate={new Date(parseFloat(farm.periodFinish) * 1000)}
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy HH:mm"
                        onChange={(date: any) => {
                          setNotifyReward(data => ({ ...data, startTime: formatUTC(date) }))
                        }}
                        customInput={<ExampleCustomInput />}
                      />
                    </InputWrapper>
                  </Flex>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Flex justifyContent="center" alignItems="center" style={{ height: '100%' }}>
                    <Button
                      scale="md"
                      style={{ backgroundImage: "linear-gradient(105deg,#448aff 3%,#448aff)", borderRadius: '10px', width: '100%' }}
                      onClick={notifyRewards}
                      disabled={pendingNotifyRewardsTx}
                    >
                      {pendingNotifyRewardsTx ? 'Processing...' : 'Extend Rewards'}
                    </Button>
                  </Flex>
                </Grid>
              </Grid>
            </div>
          }
        </FarmDetails>
      }
      <BottomRow>
        <Text fontFamily="Inter">
          Reward Duration : {new Date(Number(farm.periodFinish) * 1000).toUTCString()}
        </Text>
      </BottomRow>
    </CustomCard>
  )
}
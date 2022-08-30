// @ts-nocheck
import {
  Flex,
  Text,
  Button,
} from "cryption-uikit-v2";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { ethers, Contract } from "ethers";
import { LP_IMAGE_SEPERATOR_STRING } from '@cryption/dapp-factory-sdk';
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import styled from "styled-components";
import BigNumber from "bignumber.js";
import CountUp from "react-countup";
import useWeb3 from '../../hooks/useWeb3';
import { Box } from '@mui/material';
import { getFullDisplayBalance, getBalanceNumber } from "../../utils/formatBalance";
import getCoinGeckoIds from "../../utils/getCoinGeckoIds";
import getCoinGeckoPrice from "../../utils/getCoinGeckoPrice";
import TokenInput from '../../components/TokenInput';
import { useQuickswapSingleRewardContract } from "../../hooks/useContract";
import tokenAbi from "../../config/constants/abi/token.json";

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
}

export default function FarmRow({ farm, account, getServiceId, customgradient, customPrimaryColor }: IFarmCard) {
  const quickswapSingleReward = useQuickswapSingleRewardContract(farm.id);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [isToken0ImgExists, setToken0ImgStatus] = useState(true);
  const [pendingTx, setPendingTx] = useState(false);
  const [pendingStakeTx, setPendingStakeTx] = useState(false);
  const [pendingUnstakeTx, setPendingUnstakeTx] = useState(false);
  const [userAllowance, setUserAllowance] = useState(
    farm?.allowance ? new BigNumber(farm.allowance) : new BigNumber("0")
  );
  const [depositVal, setDepositVal] = useState("");
  const [withdrawVal, setWithdrawVal] = useState("");
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
    return getFullDisplayBalance(new BigNumber(farm.stakedBalance), Number(farm.rewardToken.decimal));
  }, [farm.rewardToken.decimal, farm.stakedBalance]);
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
    console.log({ fullBalance })
    setDepositVal(fullBalance);
  }, [fullBalance, setDepositVal]);
  const handleWithdrawChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setWithdrawVal(e.currentTarget.value);
    },
    [setWithdrawVal]
  );
  const handleSelectMaxForWithdraw = useCallback(() => {
    setWithdrawVal(stakedBalance);
  }, [stakedBalance, setWithdrawVal]);
  const handleApprove = async () => {
    try {
      setApprovalLoading(true);
      const amount = 1000000;
      const approvalAmount = ethers.utils.parseUnits(amount.toString(), 18);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new Contract(farm.inputToken, tokenAbi.abi, signer);
      const approvalTx = await tokenContract.approve(farm.id, approvalAmount);
      await approvalTx.wait();
      const allowanceAmount = await tokenContract.allowance(account, farm.id);
      setUserAllowance(new BigNumber(allowanceAmount));
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
  useEffect(() => {
    const getLiquidity = async () => {
      const coinGeckoIds = await getCoinGeckoIds();
      const token0PriceInUSD = await getCoinGeckoPrice(farm.token0Data.symbol.toLowerCase(), farm.token0Data.name, coinGeckoIds);
      const token1PriceInUSD = await getCoinGeckoPrice(farm.token1Data.symbol.toLowerCase(), farm.token1Data.name, coinGeckoIds);
      const rewardTokenPrice = await getCoinGeckoPrice(farm.rewardToken.symbol.toLowerCase(), farm.rewardToken.name, coinGeckoIds);
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
  }, [
    farm.lpTotalInQuoteToken,
    farm.multiplier,
    farm.quoteTokenAmount,
    farm.rewardToken.name,
    farm.rewardToken.rewardsPerToken,
    farm.rewardToken.symbol,
    farm.token0Data.name,
    farm.token0Data.symbol,
    farm.token1Data.name,
    farm.token1Data.symbol,
    farm.tokenAmount,
    web3.utils,
  ]);
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
            {userAllowance && new BigNumber(userAllowance).isGreaterThan(0) ? (
              <Flex justifyContent="center" marginTop="20px">
                <Button
                  scale="md"
                  onClick={onStake}
                  style={{ backgroundImage: "linear-gradient(105deg,#448aff 3%,#448aff)", borderRadius: '10px', width: '100%' }}
                  disabled={pendingStakeTx || new BigNumber(farm.tokenBalance).isGreaterThan(0)}
                >
                  {pendingStakeTx ? 'Processing...' : 'Stake'}
                </Button>
              </Flex>
            ) : (
              <Flex justifyContent="center" marginTop="20px">
                <Button
                  isLoading={approvalLoading}
                  onClick={handleApprove}
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
                disabled={pendingUnstakeTx}
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
        </FarmDetails>
      }
      <BottomRow>
        <Text fontFamily="Inter">
          Start Time : {new Date(Number(farm.periodFinish) * 1000).toUTCString()}
        </Text>
      </BottomRow>
    </CustomCard>
  )
}
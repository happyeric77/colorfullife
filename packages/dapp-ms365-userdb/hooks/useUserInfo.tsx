import { useWeb3 } from "@colorfullife/evm-web3-hook";
import axios from "axios";
import { useEffect, useState } from "react";
import { IUserInfo } from "../pages/signup";

export const useUserInfo = () => {
  const [userInfo, setUSerInfo] = useState<IUserInfo | null>(null);
  const { web3Data } = useWeb3();
  useEffect(() => {
    if (!web3Data.accounts?.[0]) return;
    axios
      .get("/api/get-user-profile", {
        params: {
          walletAddress: web3Data.accounts[0],
        },
      })
      .then((userInfo) => {
        if (!userInfo.data.userData.Title) {
          setUSerInfo(() => null);
        } else {
          const userData = userInfo.data.userData as IUserInfo;
          const signer = web3Data.web3.eth.accounts.recover(userData.stringifiedBasicInfo, userData.basicInfoSignature);
          if (signer !== web3Data.accounts[0])
            return alert("Your profile data might have been hacked, please reset and contact admin");
          setUSerInfo(() => userData);
        }
      });
  }, [web3Data.accounts?.[0]]);

  return { userInfo };
};

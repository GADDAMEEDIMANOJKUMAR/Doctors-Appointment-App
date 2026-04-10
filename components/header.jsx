import React from 'react'
import { checkAndAllocateCredits } from "@/actions/credits";
import { checkUser } from "@/lib/checkUser";
import { HeaderClient } from "./header-client";

const Header = async () => {
   const user = await checkUser()  
   if (user?.role === "PATIENT") {
    await checkAndAllocateCredits(user);
  }

  return <HeaderClient user={user} />;
}

export default Header;

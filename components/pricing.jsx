"use client";

import React, { useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { PricingTable } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const Pricing = () => {
  const router = useRouter();

  useEffect(() => {
    // Listen for postMessage events from Clerk pricing table
    const handleMessage = (event) => {
      // Check if it's a Clerk pricing table event
      if (event.data?.source === "clerk" && event.data?.event === "checkout_completed") {
        // Revalidate the page to fetch updated credits
        router.refresh();
        
        // Also navigate back to appointments after a short delay
        setTimeout(() => {
          router.push("/appointments");
        }, 1000);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  return (
    <Card className="border-emerald-900/30 shadow-lg bg-linear-to-b from-emerald-950/30 to-transparent">
      <CardContent className="p-6 md:p-8">
        <PricingTable
          checkoutProps={{
            appearance: {
              elements: {
                drawerRoot: {
                  zIndex: 2000,
                },
              },
            },
          }}
        />
      </CardContent>
    </Card>
  );
};

export default Pricing;

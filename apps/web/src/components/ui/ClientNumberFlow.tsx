"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

// Dynamically import NumberFlow with SSR disabled to prevent hydration mismatches.
// NumberFlow renders a container <div> with a fixed height during SSR that gets
// recalculated on the client, causing server/client HTML to differ.
const NumberFlow = dynamic(() => import("@number-flow/react"), {
  ssr: false,
});

export type ClientNumberFlowProps = ComponentProps<typeof NumberFlow>;

export default NumberFlow;

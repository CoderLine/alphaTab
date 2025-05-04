import React from "react";

import Heading, { type Props } from "@theme/Heading";

export type DynHeadingProps = Props & {
  inlined?: boolean;
};

export const DynHeading: React.FC<DynHeadingProps> = (props) => {
  const { inlined, ...headingProps } = props;

  if (inlined) {
    switch (headingProps.as) {
      case "h1":
        headingProps.as = "h2";
        break;
      case "h2":
        headingProps.as = "h3";
        break;
      case "h3":
        headingProps.as = "h4";
        break;
      case "h4":
        headingProps.as = "h5";
        break;
      case "h5":
        headingProps.as = "h6";
        break;
    }
  }

  return <Heading {...headingProps} />;
};


export default DynHeading;
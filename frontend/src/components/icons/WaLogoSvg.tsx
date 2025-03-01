import * as React from "react";
import SVG from "../../../public/icons/wa_logo.svg";

interface WaLogoSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const WaLogoSvg: React.FC<WaLogoSvgProps> = ({ className, ...props }) => {
  return <SVG className={className} {...props} />;
};

export default WaLogoSvg; 
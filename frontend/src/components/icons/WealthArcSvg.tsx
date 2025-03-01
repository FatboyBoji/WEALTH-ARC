import * as React from "react";
import SVG from "../../../public/icons/WealthArc.svg";

// Use the correct type for img elements, not SVG elements
interface WealthArcSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const WealthArcSvg: React.FC<WealthArcSvgProps> = ({ className, ...props }) => {
  return <SVG className={className} {...props} />;
};

export default WealthArcSvg;
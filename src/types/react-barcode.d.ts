declare module "react-barcode" {
  import * as React from "react";

  export interface BarcodeProps extends React.SVGProps<SVGSVGElement> {
    value: string;
    width?: number;
    height?: number;
    format?: string;
    displayValue?: boolean;
    fontOptions?: string;
    font?: string;
    textAlign?: string;
    textPosition?: string;
    textMargin?: number;
    fontSize?: number;
    background?: string;
    lineColor?: string;
    margin?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    renderer?: "svg" | "canvas";
    ean128?: boolean;
  }

  const Barcode: React.ComponentType<BarcodeProps>;
  export default Barcode;
}

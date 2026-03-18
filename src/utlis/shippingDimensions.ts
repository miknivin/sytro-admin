type DimensionInput = {
  length?: number;
  width?: number;
  height?: number;
  unit?: "cm" | "inches";
};

type ShipmentDimensions = {
  length: number;
  width: number;
  height: number;
  unit: "cm";
};

type OrderItemLike = {
  product?: any;
  quantity?: number;
};

const DEFAULT_DIMENSIONS: ShipmentDimensions = {
  length: 30,
  width: 40,
  height: 15,
  unit: "cm",
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return value;
};

const normalizeDimensions = (
  dimensions?: DimensionInput | null,
): { length: number; width: number; height: number } | null => {
  if (!dimensions) return null;
  const length = toNumber(dimensions.length);
  const width = toNumber(dimensions.width);
  const height = toNumber(dimensions.height);
  if (!length || !width || !height) return null;

  if (dimensions.unit === "inches") {
    return {
      length: length * 2.54,
      width: width * 2.54,
      height: height * 2.54,
    };
  }

  return { length, width, height };
};

export const getShipmentDimensionsFromOrderItems = (
  orderItems: OrderItemLike[],
  productsById: Record<string, any>,
  fallback: ShipmentDimensions = DEFAULT_DIMENSIONS,
): ShipmentDimensions => {
  let maxLength = 0;
  let maxWidth = 0;
  let totalHeight = 0;
  let hasDimensions = false;

  for (const item of orderItems || []) {
    const productId =
      typeof item.product?.toString === "function"
        ? item.product.toString()
        : String(item.product || "");
    const product = productsById[productId];
    const rawDimensions: DimensionInput | undefined =
      product?.dimentions || product?.specifications?.dimensions;

    const normalized = normalizeDimensions(rawDimensions);
    if (!normalized) continue;

    const quantity = Number.isFinite(item.quantity) ? Number(item.quantity) : 1;

    hasDimensions = true;
    maxLength = Math.max(maxLength, normalized.length);
    maxWidth = Math.max(maxWidth, normalized.width);
    totalHeight += normalized.height * Math.max(quantity, 1);
  }

  if (!hasDimensions) {
    return fallback;
  }

  return {
    length: Math.max(1, Math.round(maxLength)),
    width: Math.max(1, Math.round(maxWidth)),
    height: Math.max(1, Math.round(totalHeight)),
    unit: "cm",
  };
};


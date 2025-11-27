// utils/delhivery/createShipment.ts

import axios from "axios";
import qs from "qs";

interface DelhiveryResponse {
  success: boolean;
  packages?: Array<{ status: string; waybill?: string; remarks?: string[] }>;
  rmk?: string;
  error?: string;
}

export async function createDelhiveryShipment(
  token: string,
  shipmentData: any,
): Promise<DelhiveryResponse> {
  // Basic validation
  if (!token) throw new Error("Delhivery API token is missing");
  if (!shipmentData?.shipments?.length || !shipmentData.pickup_location) {
    throw new Error(
      "Invalid shipment data: shipments[] and pickup_location required",
    );
  }

  // Optional warning for HSN (bags/backpacks)
  shipmentData.shipments.forEach((s: any) => {
    if (s.hsn_code && !/^4202/.test(s.hsn_code)) {
      console.warn(
        `HSN ${s.hsn_code} used – recommended 4202xx for bags/backpacks`,
      );
    }
  });

  const options = {
    method: "POST" as const,
    url: "https://track.delhivery.com/api/cmu/create.json",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    data: qs.stringify({
      format: "json",
      data: JSON.stringify(shipmentData),
    }),
    timeout: 15000,
  };

  try {
    const { data } = await axios.request(options);

    if (!data.success) {
      console.error("Delhivery API error:", data);
      throw new Error(data.error || "Delhivery returned unsuccessful response");
    }

    return data;
  } catch (error: any) {
    console.error("Delhivery API request failed:", error.message);

    let msg = error.message;
    if (error.response?.data) {
      msg = error.response.data.error || JSON.stringify(error.response.data);
    }

    throw new Error(msg);
  }
}

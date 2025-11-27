export async function triggerAdminShipment(orderId: string): Promise<void> {
  if (!process.env.ADMIN_API_BASE_URL || !process.env.INTERNAL_API_TOKEN) {
    console.warn("Missing ADMIN_API_BASE_URL or INTERNAL_API_TOKEN");
    return;
  }

  const url = `${process.env.ADMIN_API_BASE_URL}/api/orders/webhook/${orderId}/delhivery`;

  try {
    void fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": process.env.INTERNAL_API_TOKEN,
      },
      // No body — admin fetches order and builds shipmentData
      keepalive: true,
    });
  } catch (err) {
    console.debug("triggerAdminShipment error (ignored):", err);
  }
}

const PAYMENT_METHODS = ["COD", "Online", "Partial-COD", "Vendor-Payment"];
const INDIA_UTC_OFFSET_MINUTES = 330;

const hasValue = (value) =>
  value !== undefined && value !== null && value !== "";

const toAmount = (value, fallback = 0) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return fallback;
  }

  return Math.round(amount * 100) / 100;
};

const monthToIndex = (month) => {
  const months = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  return months[month.toLowerCase().slice(0, 3)];
};

export const parseDateValueAsUtc = (
  value,
  defaultUtcOffsetMinutes = INDIA_UTC_OFFSET_MINUTES,
) => {
  if (!hasValue(value)) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return null;
    }

    if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(trimmedValue)) {
      const parsedDate = new Date(trimmedValue);
      return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    const namedMonthMatch = trimmedValue.match(
      /^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4}),\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)$/i,
    );

    if (namedMonthMatch) {
      const [, day, month, year, rawHour, minute, second = "00", meridiem] =
        namedMonthMatch;
      const monthIndex = monthToIndex(month);

      if (monthIndex !== undefined) {
        let hours = Number(rawHour) % 12;
        if (meridiem.toLowerCase() === "pm") {
          hours += 12;
        }

        const utcTime =
          Date.UTC(
            Number(year),
            monthIndex,
            Number(day),
            hours,
            Number(minute),
            Number(second),
          ) -
          defaultUtcOffsetMinutes * 60 * 1000;

        return new Date(utcTime);
      }
    }

    const localIsoMatch = trimmedValue.match(
      /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/,
    );

    if (localIsoMatch) {
      const [, year, month, day, hour, minute, second = "00"] = localIsoMatch;
      const utcTime =
        Date.UTC(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour),
          Number(minute),
          Number(second),
        ) -
        defaultUtcOffsetMinutes * 60 * 1000;

      return new Date(utcTime);
    }
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const normalizePaymentData = (input = {}) => {
  const advancePayment =
    input.advancePayment && typeof input.advancePayment === "object"
      ? input.advancePayment
      : {};

  const rawPaymentMethod =
    advancePayment.paymentMethod ?? input.paymentMethod ?? "Online";
  const paymentMethod = PAYMENT_METHODS.includes(rawPaymentMethod)
    ? rawPaymentMethod
    : "Online";

  const totalAmount = toAmount(input.totalAmount ?? input.itemsPrice);
  const rawPaymentAmount =
    advancePayment.paymentAmount ?? input.paymentAmount;
  const hasExplicitPaymentAmount = hasValue(rawPaymentAmount);
  const paymentAmount = toAmount(rawPaymentAmount);
  const rawSessionAdvancePaid =
    advancePayment.advancePaidInThisSession ?? input.advancePaidInThisSession;
  const rawCodCharge = advancePayment.codCharge ?? input.codCharge;
  const rawAdvancePaid =
    advancePayment.advancePaid ?? input.advancePaid ?? rawSessionAdvancePaid;

  const hasExplicitAdvancePaid =
    hasValue(rawAdvancePaid) ||
    (paymentMethod === "Partial-COD" && hasExplicitPaymentAmount);
  const hasExplicitRemainingAmount =
    hasValue(advancePayment.remainingAmount) || hasValue(input.remainingAmount);
  const hasExplicitCodAmount =
    hasValue(advancePayment.codAmount) || hasValue(input.codAmount);

  let advancePaid = toAmount(rawAdvancePaid);
  let remainingAmount = toAmount(
    advancePayment.remainingAmount ?? input.remainingAmount,
  );
  let codAmount = toAmount(advancePayment.codAmount ?? input.codAmount);
  let codChargeCollected = toAmount(
    advancePayment.codChargeCollected ??
      input.codChargeCollected ??
      rawCodCharge,
  );
  let advancePaidAt = parseDateValueAsUtc(
    advancePayment.advancePaidAt ?? input.advancePaidAt,
  );

  if (paymentMethod === "Partial-COD") {
    if (!hasExplicitAdvancePaid && hasExplicitPaymentAmount) {
      advancePaid = paymentAmount;
    }

    if (!hasExplicitAdvancePaid && hasExplicitRemainingAmount) {
      advancePaid = Math.max(totalAmount - remainingAmount, 0);
    }

    if (!hasExplicitRemainingAmount) {
      remainingAmount = Math.max(totalAmount - advancePaid, 0);
    }

    if (!hasExplicitCodAmount) {
      codAmount = remainingAmount;
    }
  } else if (paymentMethod === "COD") {
    advancePaid = 0;
    advancePaidAt = null;
    remainingAmount = totalAmount;
    codAmount = totalAmount;
    codChargeCollected = 0;
  } else {
    remainingAmount = 0;
    codAmount = 0;
    codChargeCollected = 0;

    if (!hasExplicitAdvancePaid) {
      advancePaid = 0;
    }
  }

  return {
    paymentMethod,
    totalAmount,
    paymentAmount:
      hasExplicitPaymentAmount || paymentMethod === "Partial-COD"
        ? paymentAmount || advancePaid
        : totalAmount,
    advancePaid,
    advancePaidAt,
    remainingAmount,
    codAmount,
    codChargeCollected,
  };
};

export const isCashCollectionPaymentMethod = (paymentMethod) =>
  paymentMethod === "COD" || paymentMethod === "Partial-COD";

export const getCodCollectAmount = (paymentData = {}) => {
  if (paymentData.paymentMethod === "Partial-COD") {
    return toAmount(paymentData.codAmount ?? paymentData.remainingAmount);
  }

  if (paymentData.paymentMethod === "COD") {
    return toAmount(paymentData.totalAmount);
  }

  return 0;
};

export const getRazorpayChargeAmount = (paymentData = {}) => {
  const paymentAmount = toAmount(paymentData.paymentAmount);
  if (paymentAmount > 0) {
    return paymentAmount;
  }

  if (paymentData.paymentMethod === "Partial-COD") {
    const advancePaid = toAmount(
      paymentData.advancePaid ?? paymentData.advancePaidInThisSession,
    );
    return advancePaid > 0 ? advancePaid : toAmount(paymentData.totalAmount);
  }

  return toAmount(paymentData.totalAmount ?? paymentData.itemsPrice);
};

# Delhivery Pickup Scheduling Feature

## Overview
This feature allows you to schedule pickups directly from the admin panel after creating a Delhivery order with a waybill.

## How It Works

### 1. Create Delhivery Order
- Navigate to the order details page
- If the order doesn't have a waybill, click "Create Delhivery Order"
- This will generate a waybill and create the shipment in Delhivery

### 2. Schedule Pickup
- Once the waybill is created, a green "Schedule Pickup" button will appear
- Click the button to open the pickup scheduling form

### 3. Fill Pickup Details
The form requires the following information:

#### **Pickup Location** (Required)
- Enter the pickup location name registered with Delhivery
- Default: "Hifi bags"
- This must match exactly with your Delhivery registered pickup location

#### **Pickup Date** (Required)
- Select the date when you want the pickup
- Cannot select past dates
- Format: YYYY-MM-DD

#### **Pickup Time Slot** (Required)
Choose from available time slots:
- 09:00 AM - 12:00 PM
- 12:00 PM - 03:00 PM
- 03:00 PM - 06:00 PM
- 06:00 PM - 09:00 PM

#### **Expected Package Count** (Required)
- Enter the number of packages for pickup
- Default: 1
- Minimum: 1

### 4. Submit
- Click "Schedule Pickup" to submit the request
- The system will call Delhivery's pickup API
- On success, the order will be updated with pickup details

## Technical Details

### API Endpoint
```
POST /api/orders/webhook/schedule-pickup/[orderId]
```

### Request Body
```json
{
  "pickupLocation": "Hifi bags",
  "pickupDate": "2026-01-15",
  "pickupTime": "09:00-12:00",
  "expectedPackageCount": "1"
}
```

### Response
```json
{
  "success": true,
  "message": "Pickup scheduled successfully",
  "pickupRequestId": "PICKUP123456"
}
```

### Database Fields
The following fields are added to the Order model:
- `pickupScheduled` (Boolean) - Whether pickup has been scheduled
- `pickupDate` (String) - Scheduled pickup date
- `pickupTime` (String) - Scheduled pickup time slot
- `pickupRequestId` (String) - Delhivery's pickup request ID

## Components

### SchedulePickupModal
Location: `src/components/Modals/SchedulePickupModal.tsx`

A modal component that provides the pickup scheduling form with:
- Form validation
- Loading states
- Error handling
- Success notifications

### OrderHeader
Location: `src/components/OrderDetails/OrderHeader.tsx`

Updated to include:
- "Schedule Pickup" button (shows when waybill exists)
- Modal state management
- Integration with pickup scheduling

## Redux Integration

### Mutation Hook
```javascript
import { useScheduleDelhiveryPickupMutation } from "@/redux/api/orderApi";

const [schedulePickup, { isLoading }] = useScheduleDelhiveryPickupMutation();

// Usage
await schedulePickup({
  orderId: "ORDER_ID",
  pickupData: {
    pickupLocation: "Hifi bags",
    pickupDate: "2026-01-15",
    pickupTime: "09:00-12:00",
    expectedPackageCount: "1"
  }
});
```

## Prerequisites

1. **Delhivery API Token**: Must be configured in environment variables
   ```
   DELHIVERY_API_TOKEN=your_token_here
   ```

2. **Pickup Location**: Must be registered with Delhivery beforehand

3. **Waybill**: Order must have a valid waybill before scheduling pickup

## Error Handling

The system handles various error scenarios:
- Missing waybill
- Invalid pickup details
- Delhivery API failures
- Network errors

All errors are displayed to the user via toast notifications.

## Future Enhancements

Potential improvements:
1. Auto-schedule pickup after waybill creation
2. Edit/cancel scheduled pickups
3. View pickup history
4. Bulk pickup scheduling for multiple orders
5. Pickup status tracking

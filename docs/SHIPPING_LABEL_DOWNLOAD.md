# Shipping Label Download Feature

## Overview
This feature allows you to view, download, and print shipping labels directly from the admin panel after creating a Delhivery order.

## How It Works

### 1. Create Delhivery Order
- Navigate to the order details page
- Click "Create Delhivery Order" to generate a waybill
- Once the waybill is created, the shipping label becomes available

### 2. View Shipping Label
- After waybill creation, a purple "View Shipping Label" button appears
- Click the button to open the shipping label modal

### 3. Shipping Label Modal Features

#### **PDF Preview**
- The modal displays a live preview of the shipping label
- Full-size PDF viewer embedded in the modal
- Scroll through multi-page labels if needed

#### **Download PDF**
- Click "Download PDF" button to save the label to your computer
- File is automatically named: `shipping-label-{waybill}.pdf`
- Downloads directly without opening new tabs

#### **Print Label**
- Click "Print Label" button to open the print dialog
- Opens label in new window for printing
- Optimized for label printers and standard printers

## Button Layout

After waybill creation, you'll see three buttons:

1. **Delhivery Status Badge** (Blue) - Shows current shipment status
2. **Schedule Pickup** (Green) - Opens pickup scheduling form
3. **View Shipping Label** (Purple) - Opens label viewer/download modal

## Technical Details

### API Endpoint
```
GET /api/orders/webhook/download-label/[orderId]
```

### Delhivery Label API
```
GET https://track.delhivery.com/api/p/packing_slip?wbns={waybill}&pdf=true
```

### Response
- Returns PDF file as binary data
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="shipping-label-{waybill}.pdf"`

## Components

### ShippingLabelModal
**Location**: `src/components/Modals/ShippingLabelModal.tsx`

**Features**:
- PDF preview using iframe
- Download functionality with blob handling
- Print functionality with new window
- Loading states and error handling
- Responsive design with dark mode support

**Props**:
```typescript
interface ShippingLabelModalProps {
  isOpen: boolean;        // Controls modal visibility
  onClose: () => void;    // Close handler
  orderId: string;        // Order ID for API call
  waybill: string;        // Waybill number for display
}
```

### OrderHeader (Updated)
**Location**: `src/components/OrderDetails/OrderHeader.tsx`

**New Features**:
- "View Shipping Label" button
- ShippingLabelModal integration
- Waybill prop support

## User Flow

```
1. Admin creates Delhivery order
   ↓
2. Waybill is generated
   ↓
3. "View Shipping Label" button appears
   ↓
4. Admin clicks button
   ↓
5. Modal opens with PDF preview
   ↓
6. Admin can:
   - View the label
   - Download as PDF
   - Print directly
```

## Error Handling

The system handles various error scenarios:

### Missing Waybill
```json
{
  "success": false,
  "message": "Order does not have a waybill. Please create Delhivery order first."
}
```

### Invalid Waybill
```json
{
  "success": false,
  "message": "Shipping label not found. The waybill may not be valid."
}
```

### API Failures
- Network errors
- Delhivery API timeouts
- Authentication failures

All errors are displayed via toast notifications.

## Browser Compatibility

### PDF Preview
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ⚠️ IE11: Limited support (download works, preview may not)

### Download Feature
- ✅ All modern browsers
- Uses Blob API for reliable downloads
- Automatic cleanup of object URLs

### Print Feature
- ✅ Opens in new window
- ✅ Triggers browser print dialog
- ✅ Works with label printers

## Security

### Authentication
- Requires admin login
- Uses `isAuthenticatedUser` middleware
- Role-based access control with `authorizeRoles`

### API Token
- Delhivery API token stored securely in environment variables
- Never exposed to client-side code
- Token sent only in server-side API calls

## Troubleshooting

### Label Not Loading
1. Check if waybill is valid
2. Verify Delhivery API token is configured
3. Check network connectivity
4. Verify order has a waybill

### Download Not Working
1. Check browser popup blocker
2. Verify sufficient disk space
3. Check browser download settings
4. Try different browser

### Print Not Working
1. Check browser popup blocker
2. Verify printer is connected
3. Check printer settings
4. Try "Download PDF" then print manually

## Best Practices

### When to Download Labels
- ✅ Before scheduling pickup
- ✅ After confirming order details
- ✅ When preparing packages for shipment

### Label Storage
- Save labels with order reference
- Keep backup copies
- Organize by date or waybill number

### Printing Tips
- Use label printers for best results
- Check label size settings (usually 4x6 inches)
- Verify barcode is clear and scannable
- Print test label before batch printing

## Future Enhancements

Potential improvements:
1. Bulk label download for multiple orders
2. Label customization options
3. Email label to customer
4. QR code generation for easy tracking
5. Label reprint history
6. Integration with label printers (direct print)
7. Label preview thumbnails in order list

## API Reference

### Download Label Endpoint

**Request**:
```http
GET /api/orders/webhook/download-label/{orderId}
Authorization: Required (Admin)
```

**Success Response**:
```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="shipping-label-{waybill}.pdf"

[PDF Binary Data]
```

**Error Responses**:
```http
HTTP/1.1 400 Bad Request
{
  "success": false,
  "message": "Order does not have a waybill"
}

HTTP/1.1 404 Not Found
{
  "success": false,
  "message": "Order not found"
}

HTTP/1.1 500 Internal Server Error
{
  "success": false,
  "message": "Failed to download shipping label"
}
```

## Integration with Existing Features

### Works With
- ✅ Create Delhivery Order
- ✅ Schedule Pickup
- ✅ Order Status Tracking
- ✅ Delhivery Status Sync

### Complements
- Order management workflow
- Shipping process automation
- Customer service operations
- Warehouse operations

## Notes

1. **Label Availability**: Labels are available immediately after waybill generation
2. **No Expiry**: Labels don't expire and can be downloaded multiple times
3. **Format**: Always PDF format for compatibility
4. **Size**: Typically 4x6 inches (standard shipping label size)
5. **Barcode**: Contains scannable barcode for Delhivery tracking

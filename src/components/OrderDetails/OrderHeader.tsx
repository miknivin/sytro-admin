import React from 'react';
import RadioDropDown from './RadioDropDown';

// Define the type for the props
interface OrderHeaderProps {
  orderNumber: string;
  orderDate: string;
  orderStatus:string;
  orderId:string
}

const OrderHeader: React.FC<OrderHeaderProps> = ({ orderNumber, orderDate,orderStatus, orderId }) => {
  return (
    <div className='flex justify-between'>
      <div className="flex justify-start item-start space-y-2 flex-col">
        <h1 className="text-3xl lg:text-4xl font-semibold leading-7 lg:leading-9 text-gray-800 dark:text-gray-100">
          Order #{orderNumber}
        </h1>
        <p className="text-base dark:text-gray-300 font-medium leading-6 text-gray-600">
          {orderDate}
        </p>
      </div>
      <RadioDropDown orderStatus={orderStatus} orderId={orderId}/>
    </div>
    
  );
};

export default OrderHeader;
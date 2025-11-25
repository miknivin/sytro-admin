import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  tagTypes: ["Order", "AdminOrders", "Coupons", "SessionStartedOrder"], // ✅ Added SessionStartedOrder
  endpoints: (builder) => ({
    createNewOrder: builder.query({
      query(body) {
        return {
          url: "/order/new",
          method: "POST",
          body,
        };
      },
    }),
    myOrders: builder.query({
      query: () => `/me/orders`,
    }),
    orderDetails: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: ["Order"],
    }),
    stripeCheckoutSession: builder.mutation({
      query(body) {
        return {
          url: "/payment/checkout_session",
          method: "POST",
          body,
        };
      },
    }),
    getAdminOrders: builder.query({
      query: () => `orders/admin/getAllOrders`,
      providesTags: ["AdminOrders"],
    }),
    updateOrder: builder.mutation({
      query({ id, body }) {
        return {
          url: `orders/updateOrder/${id}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["Order"],
    }),
    deleteOrder: builder.mutation({
      query(id) {
        return {
          url: `/orders/delete/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["AdminOrders"],
    }),
    createCoupon: builder.mutation({
      query(body) {
        return {
          url: "/admin/coupon/new",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Coupons"],
    }),
    getCoupons: builder.query({
      query: () => "/admin/coupons",
      providesTags: ["Coupons"],
    }),
    updateCoupon: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/coupon/update/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Coupons"],
    }),
    deleteCoupon: builder.mutation({
      query(id) {
        return {
          url: `/admin/coupon/delete/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Coupons"],
    }),
    checkCoupon: builder.mutation({
      query(body) {
        return {
          url: "/coupon/check",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Coupons"],
    }),
    applyCoupon: builder.mutation({
      query(body) {
        return {
          url: "/coupon/apply",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Coupons"],
    }),
    sessionStartedOrders: builder.query({
      query: () => "/orders/session-started",
      providesTags: ["SessionStartedOrder"],
    }),
    searchSessionStartedOrders: builder.query({
      query: ({ keyword }) =>
        `/orders/session-started/search?keyword=${encodeURIComponent(keyword)}`, // ✅ Fixed URL and added keyword
      providesTags: ["SessionStartedOrder"],
    }),
    getSessionStartedOrderById: builder.query({
      query: (id) => `/orders/session-started/${id}`,
      providesTags: ["SessionStartedOrder"],
    }),
    deleteSessionOrderById: builder.mutation({
      query(id) {
        return {
          url: `/orders/session-started/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["SessionStartedOrder"],
    }),
    convertSessionOrder: builder.mutation({
      query: (sessionOrderId) => ({
        url: "orders/session-to-order",
        method: "POST",
        body: { sessionOrderId },
      }),
      invalidatesTags: ["Order", "SessionStartedOrder", "AdminOrders"],
      transformResponse: (response) => response.order,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // Handle successful conversion if needed
        } catch (error) {
          console.error("Error converting order:", error);
        }
      },
    }),
  }),
});

export const {
  useCreateNewOrderMutation,
  useStripeCheckoutSessionMutation,
  useMyOrdersQuery,
  useOrderDetailsQuery,
  useGetAdminOrdersQuery,
  useDeleteOrderMutation,
  useUpdateOrderMutation,
  useCreateCouponMutation,
  useGetCouponsQuery,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useCheckCouponMutation,
  useApplyCouponMutation,
  useSessionStartedOrdersQuery,
  useConvertSessionOrderMutation,
  useGetSessionStartedOrderByIdQuery,
  useDeleteSessionOrderByIdMutation,
  useSearchSessionStartedOrdersQuery,
} = orderApi;

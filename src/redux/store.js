import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import cartReducer from "./features/cartSlice";
import { productApi } from "./api/productsApi";
import { authApi } from "./api/authApi";
import { userApi } from "./api/userApi";
import { orderApi } from "./api/orderApi";
import { dashboardApi } from "./api/dashboardApi";
import { websiteSettingsApi } from "./api/websiteSettingsApi";
import { enquiryApi } from "./api/enquiryApi";
export const store = configureStore({
  reducer: {
    auth: userReducer,
    cart: cartReducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [websiteSettingsApi.reducerPath]: websiteSettingsApi.reducer,
    [enquiryApi.reducerPath]: enquiryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      dashboardApi.middleware,
      productApi.middleware,
      authApi.middleware,
      userApi.middleware,
      orderApi.middleware,
      websiteSettingsApi.middleware,
      enquiryApi.middleware,
    ]),
});

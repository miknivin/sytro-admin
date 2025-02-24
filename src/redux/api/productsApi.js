import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  tagTypes: ["Product", "AdminProducts", "Reviews"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({
        url: "products/getAllProducts",
        params: {
          page: params?.page,
          keyword: params?.keyword,
          category: params?.category,
          "price[gte]": params?.min,
          "price[lte]": params?.max,
          "ratings[gte]": params?.ratings,
        },
      }),
    }),
    getProductDetails: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: ["Product"],
    }),
    submitReview: builder.mutation({
      query(body) {
        return {
          url: "/reviews",
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Product"],
    }),
    canUserReview: builder.query({
      query: (productId) => `/can_review/?productId=${productId}`,
    }),
    getAdminProducts: builder.query({
      query: () => "/admin/products",
      providesTags: ["AdminProducts"],
    }),
    createProduct: builder.mutation({
      query(body) {
        return {
          url: "/products/newProduct",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["AdminProducts"],
    }),
    uploadProductImages: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/products/${id}/upload_images`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Product"],
    }),
    
    uploadKidsBagImages: builder.mutation({
      query({ formData }) {
        return {
          url: `/products/updateKidsChoiceImg`,
          method: "PATCH",
          body: formData, 
          formData: true, 
        };
      },
      invalidatesTags: ["Product"],
    }),
    
    updateProduct: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/products/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Product", "AdminProducts"],
    }),
    deleteProduct: builder.mutation({
      query(id) {
        return {
          url: `/admin/products/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["AdminProducts"],
    }),
    deleteProductImage: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/products/${id}/delete_image`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Product", "AdminProducts"],
    }),
    getAdminOrders: builder.query({
      query: () => `/admin/orders`,
      providesTags: ["AdminOrders"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useGetAdminProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useDeleteProductImageMutation,
  useUploadProductImagesMutation,
  useUploadKidsBagImagesMutation,
  useSubmitReviewMutation,
  useCanUserReviewQuery,
} = productApi;

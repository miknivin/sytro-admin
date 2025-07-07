import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const websiteSettingsApi = createApi({
  reducerPath: "websiteSettingsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/settings" }),
  tagTypes: ["momentVideos"],
  endpoints: (builder) => ({
    singleUpload: builder.mutation({
      query: (body) => ({
        url: "/moments/singlepart",
        method: "POST",
        body,
      }),
      invalidatesTags: ["momentVideos"],
    }),
    initiateMultipartUpload: builder.mutation({
      query: (body) => ({
        url: "/moments/multipart/initiate",
        method: "POST",
        body,
      }),
    }),
    completeMultipartUpload: builder.mutation({
      query: (body) => ({
        url: "/moments/multipart/complete",
        method: "POST",
        body,
      }),
      invalidatesTags: ["momentVideos"],
    }),
    abortMultipartUpload: builder.mutation({
      query: (body) => ({
        url: "/moments/multipart/abort",
        method: "POST",
        body,
      }),
    }),
    getMoments: builder.query({
      query: () => "/moments",
      providesTags: ["momentVideos"],
    }),
    deleteMoment: builder.mutation({
      query: (url) => ({
        url: `/moments/${encodeURIComponent(url)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["momentVideos"],
    }),
  }),
});

export const {
  useSingleUploadMutation,
  useInitiateMultipartUploadMutation,
  useCompleteMultipartUploadMutation,
  useAbortMultipartUploadMutation,
  useGetMomentsQuery,
  useDeleteMomentMutation,
} = websiteSettingsApi;

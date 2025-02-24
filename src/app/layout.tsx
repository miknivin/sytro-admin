"use client";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React from "react";
import Loader from "@/components/common/Loader";
import SignIn from "@/components/SignIn";
import { useGetMeQuery } from "@/redux/api/userApi"
import { Provider, useSelector } from "react-redux";
import { store } from './../redux/store';
import { Toaster } from "react-hot-toast";

// Create a separate component for the content that needs Redux
function MainContent({ children }: { children: React.ReactNode }) {
  const { isLoading } = useGetMeQuery({});
  const { isAuthenticated } = useSelector((state: any) => state.auth);


  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark min-h-[100svh]">
      <Toaster position="top-center" reverseOrder={false} />
      {!isAuthenticated ? <SignIn /> :children}
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Provider store={store}>
          <MainContent>{children}</MainContent>
        </Provider>
      </body>
    </html>
  );
}
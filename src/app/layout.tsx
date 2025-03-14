import { ReactNode } from "react";
import ReduxProvider from "@/components/ReduxProvider";
import MainContent from "@/components/MainContent";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ReduxProvider>
          <MainContent>{children}</MainContent>
        </ReduxProvider>
      </body>
    </html>
  );
}

import Footer from "@/components/Footer";
import LoadingHandler from "@/components/LoadingHandler";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import NavBar from "@/components/Navbar";
import { ThemeProvider } from "@/providers/theme-provider";
import { ChatProvider } from "@/providers/ChatDataProvider";
import type { Metadata } from "next";
import { SiteConfig } from "@/config/site-config";

export const metadata: Metadata = {
  title: {
    default: SiteConfig.name,
    template: `%s | ${SiteConfig.name}`,
  },
  description: SiteConfig.description,
  icons: [
    {
      url: "/home/header logo.png",
      href: "/home/header logo.png",
    },
  ],
};

const WebLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="container">
        <LoadingHandler>
          <ChatProvider>
            <NavBar />
            <main className="pt-28 flex flex-col">
              {children}
              <Footer />
            </main>
          </ChatProvider>
        </LoadingHandler>
      </div>
    </ThemeProvider>
  );
};

export default WebLayout;

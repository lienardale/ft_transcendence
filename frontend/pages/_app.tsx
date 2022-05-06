import { AppProps } from "next/app";
import "./App.css";
import { ProvideUser } from "../hook/session";
import { AuthCheckerProvider } from "../hook/auth-checker";
import { ChatSocketProvider } from "../hook/chat-socket";

function App({ Component, pageProps }: AppProps) {
  return (
    <div suppressHydrationWarning>
      <ProvideUser>
        <AuthCheckerProvider>
          <ChatSocketProvider>
            {typeof window === "undefined" ? null : <Component {...pageProps} />}
          </ChatSocketProvider>
        </AuthCheckerProvider>
      </ProvideUser>
    </div>
  );
}
export default App;

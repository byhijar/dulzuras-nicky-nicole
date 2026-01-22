import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ErrorBoundary from "./ErrorBoundary";

function Layout() {
  return (
    <>
      <Header />
      <main className="pt-24">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}

export default Layout;

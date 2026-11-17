import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import SiteLayout from "./SiteLayout";

// Team members' portfolios are full-page designs of their own (no site header/footer),
// loaded only when visited: /team/<name> and its generated CV at /team/<name>/cv.
const PortfolioPage = lazy(() => import("./portfolio/PortfolioPage"));
const CvPage = lazy(() => import("./portfolio/CvPage"));

export default function App() {
  return (
    <Suspense fallback={<main className="page-loading" aria-busy="true" />}>
      <Routes>
        <Route path="/team/:slug" element={<PortfolioPage />} />
        <Route path="/team/:slug/cv" element={<CvPage />} />
        <Route path="*" element={<SiteLayout />} />
      </Routes>
    </Suspense>
  );
}

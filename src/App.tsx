
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CricketProvider } from "./context/CricketContext";

// Components
import Layout from "./components/Layout";
import Home from "./components/Home";
import TeamSetup from "./components/TeamSetup";
import Toss from "./components/Toss";
import Match from "./components/Match"; 
import NotFoundPage from "./components/NotFoundPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CricketProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/setup" element={<Layout><TeamSetup /></Layout>} />
            <Route path="/toss" element={<Layout><Toss /></Layout>} />
            <Route path="/match" element={<Layout><Match /></Layout>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </CricketProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProblemSection } from './components/ProblemSection';
import { SolutionSection } from './components/SolutionSection';
import { RolesHorizontalScroll } from './components/RolesHorizontalScroll';
import { WorkflowTimeline } from './components/WorkflowTimeline';
import { Architecture } from './components/Architecture';
import { DashboardMockup } from './components/DashboardMockup';
import { ChainOfCustody } from './components/ChainOfCustody';
import { CTA, Footer } from './components/CTA';
import { AuthPage } from './pages/AuthPage';

function Root() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-[#E5E7EB] font-['Inter'] selection:bg-[#22D3EE]/30 selection:text-white">
      <Outlet />
    </div>
  );
}

function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <RolesHorizontalScroll />
        <WorkflowTimeline />
        <Architecture />
        <DashboardMockup />
        <ChainOfCustody />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'auth', Component: AuthPage },
    ],
  },
]);

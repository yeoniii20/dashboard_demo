"use client";

import { useState, ReactNode } from "react";
import Footer from "./footer";
import Header from "./header";
import MobileMenu from "./mobileMenu";
import NavItem from "./navItem";

type LayoutShellProps = {
  children: ReactNode;
};

export default function LayoutShell({ children }: LayoutShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const sidebarBase =
    "custom-scrollbar bg-bg-default border-r border-border-default text-text-light";

  return (
    <div className="flex min-h-screen flex-col bg-bg-dark text-text-light">
      {/* HEADER */}
      <Header onClick={() => setIsSidebarOpen((prev) => !prev)} />

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* 데스크탑 사이드바 */}
        <aside
          className={`${sidebarBase} hidden md:flex md:w-60 md:flex-col md:shadow-none`}
        >
          <NavItem onClick={() => setIsSidebarOpen(false)} />
        </aside>

        {/* MAIN CONTENT */}
        <main className="custom-scrollbar flex-1 overflow-auto bg-bg-dark px-3 py-3 md:px-4 md:py-4">
          {children}
        </main>
      </div>

      {/* 모바일 오버레이 메뉴 */}
      {isSidebarOpen && (
        <MobileMenu
          sidebarBase={sidebarBase}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

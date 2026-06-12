"use client";
import { LayoutDashboard } from "lucide-react";
import React from "react";
import Link from "next/link";

const HeaderNav = () => {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/dashboard"
        prefetch={false}
        className="flex items-center gap-2 px-3 py-2 text-[#101323]  rounded-md transition-colors outline-none"
        role="menuitem"
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-sm font-medium font-inter">
          Dashboard
        </span>
      </Link>
    </div>
  );
};

export default HeaderNav;

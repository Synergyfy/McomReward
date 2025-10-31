"use client";

import { usePathname } from "next/navigation";

export function useLinkClasses() {
  const pathname = usePathname();

  const linkClasses = (path: string, exact: boolean = false) => {
    const isActive = exact ? pathname === path : pathname.startsWith(path);
    return `flex items-center p-2 rounded-lg transition-colors duration-200 ${
      isActive
        ? "bg-orange-600 text-white"
        : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
    }`;
  };

  return linkClasses;
}

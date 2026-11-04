"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const akar = document.documentElement;
    akar.dataset.muncul = "1";
    if (!akar.classList.contains("gerak")) return;
    const pengamat = new IntersectionObserver(
      (entri) => {
        for (const e of entri) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-tampil", "");
          pengamat.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll("[data-muncul]:not([data-tampil])").forEach((el) => pengamat.observe(el));
    return () => pengamat.disconnect();
  }, [pathname]);

  return null;
}

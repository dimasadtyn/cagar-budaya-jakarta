"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { padanan, RUTE, type Bahasa } from "@/lib/labels";
import { TEKS } from "@/lib/messages";
import css from "./Header.module.css";

function Nav({ b, className, sekarang }: { b: Bahasa; className: string; sekarang: string }) {
  const t = TEKS[b].menu;
  const menu = [
    { href: RUTE.beranda[b], label: TEKS[b].beranda },
    { href: RUTE.jelajah[b], label: t.jelajah },
    { href: `${RUTE.jelajah[b]}?tampilan=peta`, label: t.peta },
    { href: RUTE.model3d[b], label: t.model3d },
    { href: RUTE.tentang[b], label: t.tentang },
  ];
  return (
    <ul className={className}>
      {menu.map((m) => (
        <li key={m.href}>
          <Link href={m.href} aria-current={m.href === sekarang ? "page" : undefined}>
            {m.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ActiveNav({ b, className, path }: { b: Bahasa; className: string; path: string }) {
  const peta = useSearchParams().get("tampilan") === "peta";
  return <Nav b={b} className={className} sekarang={peta ? `${path}?tampilan=peta` : path} />;
}

function UrlNav({ b, className, path }: { b: Bahasa; className: string; path: string }) {
  return (
    <Suspense fallback={<Nav b={b} className={className} sekarang={path} />}>
      <ActiveNav b={b} className={className} path={path} />
    </Suspense>
  );
}

function LanguageSwitch({ b, pathname }: { b: Bahasa; pathname: string }) {
  const lain = padanan(pathname);
  const ke = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.href = lain + location.search + location.hash;
  };
  return (
    <p className={css.bahasa} aria-label={TEKS[b].gantiBahasa}>
      {b === "id" ? (
        <>
          <span aria-current="true">ID</span>
          <a href={lain} hrefLang="en" lang="en" onClick={ke}>
            EN
          </a>
        </>
      ) : (
        <>
          <a href={lain} hrefLang="id" lang="id" onClick={ke}>
            ID
          </a>
          <span aria-current="true">EN</span>
        </>
      )}
    </p>
  );
}

export default function Header({ b }: { b: Bahasa }) {
  const pathname = usePathname();
  const sekarang = pathname.endsWith("/") ? pathname : `${pathname}/`;

  return (
    <header className={css.header}>
      <div className={`wadah ${css.isi}`}>
        <Link href={RUTE.beranda[b]} className={css.merek}>
          <img src="/logo-pemprov-disbud.png" alt="Pemprov DKI Jakarta · Dinas Kebudayaan" width={95} height={40} />
          <span>Cagar Budaya Jakarta</span>
        </Link>
        <nav aria-label={TEKS[b].navUtama} className={css.nav}>
          <UrlNav b={b} className={css.menu} path={sekarang} />
          <LanguageSwitch b={b} pathname={sekarang} />
          <details
            className={css.ponsel}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) e.currentTarget.open = false;
            }}
          >
            <summary aria-label={TEKS[b].bukaMenu}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M2 5h16M2 10h16M2 15h16" />
              </svg>
            </summary>
            <UrlNav b={b} className={css.menuPonsel} path={sekarang} />
          </details>
        </nav>
      </div>
    </header>
  );
}

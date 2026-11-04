export const URL_SITUS = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hbim.jakarta.go.id").replace(/\/$/, "");

export const NAMA_SITUS = "Cagar Budaya Jakarta";

export const PENERBIT = {
  "@type": "GovernmentOrganization",
  name: "Dinas Kebudayaan Provinsi DKI Jakarta",
} as const;

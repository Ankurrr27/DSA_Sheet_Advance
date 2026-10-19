import Link from "next/link";

type AppNavbarProps = {
  label?: string;
};

export default function AppNavbar({ label }: AppNavbarProps) {
  return (
    <header className="app-navbar">
      <Link href="/practice" className="app-brand" aria-label="DSA Track home">
        <span>DSA</span><b>/</b>track
      </Link>
      {label ? <span className="app-view-label">{label}</span> : null}
    </header>
  );
}

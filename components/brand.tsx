export function Brand({ dark = false }: { dark?: boolean }) {
  return <span className={`brand ${dark ? "brand-dark" : ""}`}><span className="brand-icon"><i /><i /><i /></span><span>PayRoster</span></span>;
}

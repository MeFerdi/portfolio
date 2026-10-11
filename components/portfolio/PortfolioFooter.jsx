export default function PortfolioFooter() {
  return (
    <footer>
      <div className="wrap">
        <span>© 2026 Ferdynand Odhiambo</span>
        <span className="ft-location">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nairobi-40.png" alt="" width="20" height="20" loading="lazy" decoding="async" className="loc-icon" />
          Nairobi, Kenya
        </span>
      </div>
    </footer>
  );
}

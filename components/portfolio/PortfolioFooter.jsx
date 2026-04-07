import Image from 'next/image';

export default function PortfolioFooter() {
  return (
    <footer>
      <div className="wrap">
        <span className="ft ft-signature">Design by Ferdynand</span>
        <span className="ft ft-location" aria-label="Nairobi, Kenya">
          <Image
            src="/nairobi.png"
            alt="Nairobi icon"
            width={20}
            height={20}
            className="loc-icon"
          />
          <span className="loc-label">Nairobi, Kenya</span>
        </span>
        <span className="ft">2026</span>
      </div>
    </footer>
  );
}

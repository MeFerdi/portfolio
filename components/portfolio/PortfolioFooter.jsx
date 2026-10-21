// Receives `profile` as a prop because client pages render it too.
export default function PortfolioFooter({ profile }) {
  return (
    <footer>
      <div className="wrap">
        <span>© {profile.copyrightYear} {profile.name}</span>
        <span className="ft-location">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nairobi-40.png" alt="" width="20" height="20" loading="lazy" decoding="async" className="loc-icon" />
          {profile.location}
        </span>
      </div>
    </footer>
  );
}

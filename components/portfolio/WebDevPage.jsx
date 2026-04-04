'use client';

import PortfolioStyles from './PortfolioStyles';
import PortfolioFooter from './PortfolioFooter';

const webProjects = [
	{
		title: 'Somot\u00e9ch Africa',
		url: 'https://somotechafrica.org',
		displayUrl: 'somotechafrica.org',
		description:
			'Somotéch Africa is a platform dedicated to technology education and innovation across the African continent, connecting learners and builders with resources, opportunities, and community.',
		tags: ['Web', 'Education', 'Africa', 'Tech'],
	},
	{
		title: 'Employa',
		url: 'https://employa.pages.dev',
		displayUrl: 'employa.pages.dev',
		description:
			'WhatsApp-native payout operations for scheduled M-Pesa disbursements. Employa helps finance and operations teams execute M-Pesa disbursements with stronger control, clearer communication, and a more dependable audit trail across every payout cycle.',
		tags: ['M-Pesa', 'Payouts', 'Finance Ops', 'WhatsApp'],
	},
	{
		title: 'DePesa',
		url: 'https://depesa.pages.dev',
		displayUrl: 'depesa.pages.dev',
		description:
			'DePesa automates contribution proof, gives treasurers a real-time record, and helps savings groups protect value. Group funds stay in a licensed Kenyan bank account, M-Pesa pool, or SACCO channel chosen by the group. Timestamped receipts, dispute logs, and payout confirmations are built in.',
		tags: ['Chama', 'M-Pesa', 'Receipts', 'Dispute Resolution', 'Finance'],
	},
	{
		title: 'Provd',
		url: 'https://provd.pages.dev',
		displayUrl: 'provd.pages.dev',
		description:
			'Provd helps African exchanges, wallets, and OTC desks block repeat fraud before funds move. Query one API call and get network-backed counterparty risk, dispute signals, and recommended actions across P2P stablecoin flows.',
		tags: ['Risk', 'Fraud', 'API', 'P2P', 'Africa'],
	},
];

function WebDevLogo({ title, url, imgSrc, alt }) {
	return (
		<a
			href={url}
			className="webdev-logo-link-only"
			target="_blank"
			rel="noreferrer"
			tabIndex={0}
			aria-label={title}
		>
			<img src={imgSrc} alt={alt} className="webdev-logo-img-only" />
		</a>
	);
}

export default function WebDevPage() {
	return (
		<>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
			<link
				href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Special+Elite&display=swap"
				rel="stylesheet"
			/>

			<main className="portfolio-page">
				<PortfolioStyles />
				<div className="glitch-sweep" />
				<div className="glitch-sweep" />
				<div className="glitch-sweep" />

				<nav>
					<div className="wrap">
						<a href="/" className="nav-logo">FO</a>
						<ul className="nav-links">
							<li><a href="/">portfolio</a></li>
							<li><a href="/#projects">projects</a></li>
							<li><a href="/brand">random stuff</a></li>
						</ul>
					</div>
				</nav>

				<section id="hero">
					<div className="wrap">
						<div className="hero-eyebrow fi">Web Development</div>
						<h1 className="name fi">Web Projects</h1>
						<p className="hero-role fi">Sites & web applications I&apos;ve built or contributed to</p>
						<p className="hero-bio fi">
							A collection of web development work — from full-stack platforms to client sites.
							Each project is built with attention to performance, usability, and clean code.
						</p>
					</div>
				</section>

				<section id="web-projects">
					<div className="wrap">
						<div className="section-label">Projects</div>
						<div className="webdev-logos-grid-only">
							<WebDevLogo
								title="Somotéch Africa"
								url="https://somotechafrica.org"
								imgSrc="https://somotechafrica.org/assets/somotech-logo-TBOlxk9f.png"
								alt="Somotéch Africa logo"
							/>
							<WebDevLogo
								title="Employa"
								url="https://employa.pages.dev"
								imgSrc="https://employa.pages.dev/assets/batch-planning-review-CeTVbkjW.jpg"
								alt="Employa screenshot"
							/>
							<WebDevLogo
								title="DePesa"
								url="https://depesa.pages.dev"
								imgSrc="https://depesa.pages.dev/_next/image?url=%2Fphone-mockup.png&w=384&q=75"
								alt="DePesa app screenshot"
							/>
							<WebDevLogo
								title="Provd"
								url="https://provd.pages.dev"
								imgSrc="https://provd.pages.dev/provd.svg"
								alt="Provd logo"
							/>
						</div>
					</div>
				</section>

				<PortfolioFooter />
			</main>

			{/* Add styles for the animated logo grid */}
			<style jsx global>{`
				.webdev-logos-grid-only {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
					gap: 48px;
					justify-items: center;
					align-items: center;
					margin-top: 48px;
					margin-bottom: 64px;
				}
				.webdev-logo-link-only {
					display: flex;
					align-items: center;
					justify-content: center;
					outline: none;
					border-radius: 24px;
					transition: box-shadow 0.3s, transform 0.3s;
					box-shadow: 0 2px 24px 0 rgba(30,144,255,0.08);
				}
				.webdev-logo-link-only:focus,
				.webdev-logo-link-only:hover {
					transform: scale(1.12) rotate(-2deg);
					box-shadow: 0 4px 40px 0 rgba(30,144,255,0.25), 0 0 0 6px #1e90ff33;
					z-index: 2;
				}
				.webdev-logo-img-only {
					width: 180px;
					height: 180px;
					max-width: 90vw;
					max-height: 30vh;
					object-fit: contain;
					border-radius: 18px;
					background: #fff;
					padding: 12px;
					transition: box-shadow 0.3s, filter 0.3s;
					box-shadow: 0 2px 16px 0 rgba(0,0,0,0.10);
					filter: drop-shadow(0 2px 12px #1e90ff22);
				}
				.webdev-logo-link-only:focus .webdev-logo-img-only,
				.webdev-logo-link-only:hover .webdev-logo-img-only {
					filter: drop-shadow(0 4px 32px #1e90ff66) brightness(1.1);
				}
			`}</style>
		</>
	);
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import PortfolioStyles from './PortfolioStyles';
import PortfolioFooter from './PortfolioFooter';
import ThemeToggle from './ThemeToggle';

const webProjects = [
	{
		title: 'Somot\u00e9ch Africa',
		url: 'https://somotechafrica.org',
		displayUrl: 'somotechafrica.org',
		logoSrc: '/logos/somotechafrica-logo.png',
		fallbackLabel: 'SA',
		description:
			'Somotéch Africa is a platform dedicated to technology education and innovation across the African continent, connecting learners and builders with resources, opportunities, and community.',
		tags: ['Web', 'Education', 'Africa', 'Tech'],
	},
	{
		title: 'Employa',
		url: 'https://employa.pages.dev',
		displayUrl: 'employa.pages.dev',
		logoSrc: '/logos/employa-logo.jpg',
		fallbackLabel: 'EM',
		description:
			'WhatsApp-native payout operations for scheduled M-Pesa disbursements. Employa helps finance and operations teams execute M-Pesa disbursements with stronger control, clearer communication, and a more dependable audit trail across every payout cycle.',
		tags: ['M-Pesa', 'Payouts', 'Finance Ops', 'WhatsApp'],
	},
	{
		title: 'DePesa',
		url: 'https://depesa.pages.dev',
		displayUrl: 'depesa.pages.dev',
		logoSrc: '/logos/depesa-logo.png',
		fallbackLabel: 'DP',
		description:
			'DePesa automates contribution proof, gives treasurers a real-time record, and helps savings groups protect value. Group funds stay in a licensed Kenyan bank account, M-Pesa pool, or SACCO channel chosen by the group. Timestamped receipts, dispute logs, and payout confirmations are built in.',
		tags: ['Chama', 'M-Pesa', 'Receipts', 'Dispute Resolution', 'Finance'],
	},
	{
		title: 'Provd',
		url: 'https://provd.pages.dev',
		displayUrl: 'provd.pages.dev',
		logoSrc: '/logos/provd-logo.svg',
		fallbackLabel: 'PV',
		description:
			'Provd helps African exchanges, wallets, and OTC desks block repeat fraud before funds move. Query one API call and get network-backed counterparty risk, dispute signals, and recommended actions across P2P stablecoin flows.',
		tags: ['Risk', 'Fraud', 'API', 'P2P', 'Africa'],
	},
];

function WebDevLogoCard({ title, url, displayUrl, logoSrc, fallbackLabel }) {
	const [logoError, setLogoError] = useState(false);

	return (
		<a
			href={url}
			className="webdev-logo-card"
			target="_blank"
			rel="noreferrer"
			tabIndex={0}
			aria-label={`Open ${title}`}
		>
			<div className="webdev-logo-frame">
				{logoSrc && !logoError ? (
					<Image
						src={logoSrc}
						alt={`${title} logo`}
						width={260}
						height={140}
						className="webdev-logo-img-only"
						onError={() => setLogoError(true)}
					/>
				) : (
					<div className="webdev-logo-fallback" aria-hidden="true">{fallbackLabel}</div>
				)}
			</div>
			<div className="webdev-logo-meta">
				<h3>{title}</h3>
				<span>{displayUrl}</span>
			</div>
		</a>
	);
}

export default function WebDevPage() {
	const [menuOpen, setMenuOpen] = useState(false);
	const closeMenu = () => setMenuOpen(false);

	return (
		<>
			<a href="#main-content" className="skip-link">Skip to main content</a>

			<main className="portfolio-page">
				<PortfolioStyles />
				<div className="glitch-sweep" />
				<div className="glitch-sweep" />
				<div className="glitch-sweep" />

				<nav aria-label="Primary" className="site-nav">
					<div className="wrap nav-shell">
						<a href="/" className="nav-logo nav-signature">Ferdynand</a>
						<ul className="nav-links nav-links-desktop">
							<li><a href="/">portfolio</a></li>
							<li><a href="/#projects">projects</a></li>
							<li><a href="/brand">Creative</a></li>
						</ul>
						<div className="nav-actions">
							<button
								type="button"
								className="nav-toggle"
								aria-label={menuOpen ? 'Close menu' : 'Open menu'}
								aria-expanded={menuOpen}
								onClick={() => setMenuOpen((prev) => !prev)}
							>
								<span />
								<span />
								<span />
							</button>
							<ThemeToggle />
						</div>
					</div>

					{menuOpen && <button type="button" className="mobile-nav-backdrop" onClick={closeMenu} aria-label="Close menu backdrop" />}

					<div className={`mobile-nav-card${menuOpen ? ' open' : ''}`}>
						<ul className="nav-links nav-links-mobile">
							<li><a href="/" onClick={closeMenu}>Portfolio</a></li>
							<li><a href="/#projects" onClick={closeMenu}>Projects</a></li>
							<li><a href="/brand" onClick={closeMenu}>Creative</a></li>
						</ul>
					</div>
				</nav>

				<section id="hero" aria-labelledby="main-content">
					<div className="wrap">
						<div className="hero-eyebrow fi">Web Development</div>
						<h1 className="name fi" id="main-content">Web Projects</h1>
						<p className="hero-role fi">Sites & web applications I&apos;ve built or contributed to</p>
						<p className="hero-bio fi">
							A collection of web development work from full-stack platforms to client sites.
							Each project is built with attention to performance, usability, and clean code.
						</p>
					</div>
				</section>

				<section id="web-projects">
					<div className="wrap">
						<div className="section-label">Projects</div>
						<div className="webdev-logos-grid-only">
							{webProjects.map((project) => (
								<WebDevLogoCard
									key={project.title}
									title={project.title}
									url={project.url}
									displayUrl={project.displayUrl}
									logoSrc={project.logoSrc}
									fallbackLabel={project.fallbackLabel}
								/>
							))}
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
					gap: 18px;
					margin-top: 16px;
					margin-bottom: 20px;
				}
				.webdev-logo-card {
					display: flex;
					flex-direction: column;
					align-items: stretch;
					gap: 10px;
					padding: 14px;
					background: #ffffff;
					border: 1px solid #e2e8f0;
					border-radius: 14px;
					text-decoration: none;
					outline: none;
					transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
					box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
				}
				.webdev-logo-card:hover,
				.webdev-logo-card:focus {
					transform: translateY(-2px);
					border-color: #93c5fd;
					box-shadow: 0 8px 20px rgba(37, 99, 235, 0.12);
				}
				.webdev-logo-frame {
					height: 130px;
					border: 1px solid #e2e8f0;
					border-radius: 12px;
					background: #f8fafc;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 10px;
				}
				.webdev-logo-img-only {
					width: 100%;
					height: 100%;
					object-fit: contain;
					display: block;
				}
				.webdev-logo-fallback {
					width: 100%;
					height: 100%;
					display: grid;
					place-items: center;
					font-size: 1.35rem;
					font-weight: 700;
					color: #1d4ed8;
					background: linear-gradient(135deg, #dbeafe, #eff6ff);
					border-radius: 10px;
				}
				.webdev-logo-meta h3 {
					margin: 0;
					font-size: 1rem;
					color: #0f172a;
				}
				.webdev-logo-meta span {
					font-size: 0.82rem;
					color: #64748b;
				}
				html.dark .webdev-logo-card {
					background: #111827;
					border-color: #334155;
				}
				html.dark .webdev-logo-frame {
					background: #0f172a;
					border-color: #334155;
				}
				html.dark .webdev-logo-meta h3 {
					color: #e2e8f0;
				}
				html.dark .webdev-logo-meta span {
					color: #cbd5e1;
				}
			`}</style>
		</>
	);
}

export default function PortfolioStyles() {
  const css = `
      .portfolio-page {
        --bg: #0a0a0a;
        --bg-warm: #0d0c0b;
        --surface: #111110;
        --surface2: #161514;
        --border: #252421;
        --border-hi: #3a3835;
        --phosphor: #e8e4dc;
        --phosphor-dim: #8a8680;
        --phosphor-low: #4a4845;
        --phosphor-off: #252321;
        --scanline: rgba(0, 0, 0, 0.55);
        --mono: 'IBM Plex Mono', monospace;
        --display: 'Special Elite', serif;
        --max: 780px;

        font-family: var(--mono);
        background: var(--bg);
        color: var(--phosphor-dim);
        font-size: 14px;
        line-height: 1.7;
        -webkit-font-smoothing: antialiased;
        min-height: 100vh;
        position: relative;
      }

      html {
        scroll-behavior: smooth;
      }

      .portfolio-page::before {
        content: '';
        position: fixed;
        inset: 0;
        z-index: 9999;
        pointer-events: none;
        background: repeating-linear-gradient(
          to bottom,
          transparent 0px,
          transparent 3px,
          var(--scanline) 3px,
          var(--scanline) 4px
        );
        opacity: 0.18;
      }

      .portfolio-page::after {
        content: '';
        position: fixed;
        inset: 0;
        z-index: 9998;
        pointer-events: none;
        opacity: 0.055;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
        background-size: 180px 180px;
        background-repeat: repeat;
      }

      .portfolio-page a {
        color: var(--phosphor);
        text-decoration: none;
      }

      .portfolio-page a:hover {
        text-decoration: underline;
        opacity: 0.75;
      }

      .portfolio-page .wrap {
        max-width: var(--max);
        margin: 0 auto;
        padding: 0 28px;
      }

      .portfolio-page section {
        padding: 80px 0;
        border-top: 1px solid var(--border);
      }

      .portfolio-page section:first-of-type {
        border-top: none;
      }

      .portfolio-page nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background: rgba(10, 10, 10, 0.96);
        border-bottom: 1px solid var(--border);
      }

      .portfolio-page nav .wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 48px;
      }

      .portfolio-page .nav-logo {
        font-family: var(--display);
        font-size: 15px;
        color: var(--phosphor);
        letter-spacing: 0.04em;
        transition: opacity 0.1s;
        animation: flicker 8s infinite;
      }

      .portfolio-page .nav-logo:hover {
        opacity: 0.6;
      }

      .portfolio-page .nav-links {
        display: flex;
        gap: 28px;
        list-style: none;
      }

      .portfolio-page .nav-links a {
        font-family: var(--mono);
        font-size: 11px;
        color: var(--phosphor-low);
        letter-spacing: 0.1em;
        text-transform: lowercase;
        transition: color 0.1s;
      }

      .portfolio-page .nav-links a:hover {
        color: var(--phosphor);
        text-decoration: none;
        opacity: 1;
      }

      @keyframes flicker {
        0%,
        100% {
          opacity: 1;
        }
        92% {
          opacity: 1;
        }
        93% {
          opacity: 0.4;
        }
        94% {
          opacity: 1;
        }
        96% {
          opacity: 0.7;
        }
        97% {
          opacity: 1;
        }
      }

      .portfolio-page #hero {
        padding: 130px 0 80px;
        border-top: none;
      }

      .portfolio-page .hero-eyebrow {
        font-size: 10px;
        color: var(--phosphor-low);
        letter-spacing: 0.22em;
        text-transform: uppercase;
        margin-bottom: 24px;
      }

      .portfolio-page h1.name {
        font-family: var(--display);
        font-size: clamp(40px, 7vw, 62px);
        color: var(--phosphor);
        letter-spacing: 0.01em;
        line-height: 1.05;
        margin-bottom: 16px;
        text-shadow: 0 0 30px rgba(232, 228, 220, 0.06);
      }

      .portfolio-page .hero-role {
        font-size: 12px;
        color: var(--phosphor-dim);
        margin-bottom: 28px;
        letter-spacing: 0.08em;
      }

      .portfolio-page .hero-bio {
        font-size: 14px;
        color: var(--phosphor-dim);
        max-width: 520px;
        line-height: 1.82;
        margin-bottom: 40px;
      }

      .portfolio-page .hero-bio strong {
        color: var(--phosphor);
        font-weight: 600;
      }

      .portfolio-page .hero-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .portfolio-page .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 9px 20px;
        border: 1px solid var(--border-hi);
        color: var(--phosphor-low);
        background: transparent;
        transition: all 0.1s;
        cursor: pointer;
        border-radius: 0;
        position: relative;
      }

      .portfolio-page .btn::before {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
          to bottom,
          transparent 0px,
          transparent 2px,
          rgba(255, 255, 255, 0.012) 2px,
          rgba(255, 255, 255, 0.012) 3px
        );
        pointer-events: none;
      }

      .portfolio-page .btn:hover {
        border-color: var(--phosphor-dim);
        color: var(--phosphor);
        text-decoration: none;
        opacity: 1;
      }

      .portfolio-page .btn-primary {
        background: var(--phosphor);
        color: var(--bg);
        border-color: var(--phosphor);
        font-weight: 600;
      }

      .portfolio-page .btn-primary:hover {
        background: #d0ccc4;
        border-color: #d0ccc4;
        color: var(--bg);
      }

      .portfolio-page .section-label {
        font-size: 10px;
        color: var(--phosphor-low);
        letter-spacing: 0.2em;
        text-transform: uppercase;
        margin-bottom: 44px;
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .portfolio-page .section-label::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--border);
      }

      .portfolio-page .about-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 52px;
      }

      .portfolio-page .about-text p {
        font-size: 14px;
        color: var(--phosphor-dim);
        line-height: 1.85;
        margin-bottom: 18px;
      }

      .portfolio-page .stack-group {
        margin-bottom: 26px;
      }

      .portfolio-page .stack-group h4 {
        font-size: 9px;
        color: var(--phosphor-off);
        letter-spacing: 0.18em;
        text-transform: uppercase;
        margin-bottom: 10px;
      }

      .portfolio-page .stack-row {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .portfolio-page .stack-chip {
        font-size: 10px;
        color: var(--phosphor);
        border: 1px solid var(--border-hi);
        background: rgba(232, 228, 220, 0.06);
        padding: 3px 9px;
        letter-spacing: 0.04em;
      }

      .portfolio-page .exp-item {
        display: grid;
        grid-template-columns: 168px 1fr;
        gap: 32px;
        padding: 32px 0;
        border-bottom: 1px solid var(--border);
      }

      .portfolio-page .exp-period,
      .portfolio-page .exp-loc {
        font-size: 10px;
        color: var(--phosphor-off);
      }

      .portfolio-page .exp-company {
        font-family: var(--display);
        font-size: 13px;
        color: var(--phosphor);
      }

      .portfolio-page .exp-content h3 {
        font-family: var(--display);
        font-size: 17px;
        color: var(--phosphor);
        margin-bottom: 10px;
        font-weight: 400;
      }

      .portfolio-page .exp-content p,
      .portfolio-page .project-card > p {
        font-size: 13px;
        color: var(--phosphor-dim);
        line-height: 1.78;
        margin-bottom: 14px;
      }

      .portfolio-page .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .portfolio-page .tag {
        font-size: 9px;
        color: var(--phosphor-dim);
        border: 1px solid var(--border-hi);
        background: rgba(232, 228, 220, 0.05);
        padding: 2px 7px;
        letter-spacing: 0.04em;
      }

      .portfolio-page .projects-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .portfolio-page .project-card {
        background: var(--surface);
        border: 1px solid var(--border);
        padding: 28px 30px;
        position: relative;
        overflow: hidden;
      }

      .portfolio-page .project-card::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 18px 18px 0;
        border-color: transparent var(--border) transparent transparent;
        opacity: 0.5;
      }

      .portfolio-page .project-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 14px;
      }

      .portfolio-page .project-title-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .portfolio-page .project-card h3 {
        font-family: var(--display);
        font-size: 17px;
        color: var(--phosphor);
        font-weight: 400;
      }

      .portfolio-page .project-badge {
        font-size: 9px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        padding: 2px 7px;
        background: rgba(232, 228, 220, 0.06);
      }

      .portfolio-page .badge-wip {
        color: var(--phosphor);
        border: 1px solid var(--border-hi);
      }

      .portfolio-page .badge-next,
      .portfolio-page .badge-plan,
      .portfolio-page .badge-done {
        color: var(--phosphor-dim);
        border: 1px solid var(--border-hi);
      }

      .portfolio-page .project-links-row {
        display: flex;
        gap: 14px;
      }

      .portfolio-page .plink {
        font-size: 11px;
        color: var(--phosphor-low);
      }

      .portfolio-page .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin: 14px 0;
      }

      .portfolio-page .detail-block {
        background: var(--bg-warm);
        border: 1px solid var(--border);
        padding: 14px 16px;
      }

      .portfolio-page .detail-block h4 {
        font-size: 9px;
        color: var(--phosphor-off);
        letter-spacing: 0.14em;
        text-transform: uppercase;
        margin-bottom: 10px;
      }

      .portfolio-page .detail-block ul {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .portfolio-page .detail-block li {
        font-size: 11px;
        color: var(--phosphor-dim);
        display: flex;
        gap: 8px;
        line-height: 1.55;
      }

      .portfolio-page .detail-block li::before {
        content: '—';
        color: var(--phosphor-off);
        font-size: 10px;
      }

      .portfolio-page .arch {
        font-size: 11px;
        color: var(--phosphor-low);
        line-height: 1.9;
        background: var(--bg);
        border: 1px solid var(--border);
        padding: 14px 16px;
        white-space: pre;
        overflow-x: auto;
        margin: 14px 0;
      }

      .portfolio-page .arch .g {
        color: var(--phosphor);
        font-weight: 600;
      }

      .portfolio-page .arch .f {
        color: var(--phosphor-off);
      }

      .portfolio-page .writing-item {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 24px;
        padding: 20px 0;
        border-bottom: 1px solid var(--border);
      }

      .portfolio-page .wt {
        font-family: var(--display);
        font-size: 15px;
        color: var(--phosphor-dim);
        display: block;
        margin-bottom: 4px;
        font-weight: 400;
      }

      .portfolio-page .wm {
        font-size: 10px;
        color: var(--phosphor-off);
      }

      .portfolio-page .wa {
        font-size: 12px;
        color: var(--phosphor-off);
      }

      .portfolio-page #contact {
        padding-bottom: 100px;
      }

      .portfolio-page .contact-block {
        max-width: 460px;
      }

      .portfolio-page .contact-block h2 {
        font-family: var(--display);
        font-size: 26px;
        color: var(--phosphor);
        margin-bottom: 14px;
        font-weight: 400;
      }

      .portfolio-page .contact-block p {
        font-size: 13px;
        color: var(--phosphor-dim);
        line-height: 1.8;
        margin-bottom: 32px;
      }

      .portfolio-page .contact-links {
        display: flex;
        flex-direction: column;
        gap: 13px;
      }

      .portfolio-page .contact-link {
        display: flex;
        align-items: center;
        gap: 14px;
        font-size: 12px;
        color: var(--phosphor-dim);
      }

      .portfolio-page .clabel {
        font-size: 9px;
        color: var(--phosphor-off);
        letter-spacing: 0.14em;
        text-transform: uppercase;
        width: 52px;
        flex-shrink: 0;
      }

      .portfolio-page footer {
        border-top: 1px solid var(--border);
        padding: 22px 0;
      }

      .portfolio-page footer .wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .portfolio-page .ft {
        font-size: 10px;
        color: var(--phosphor-off);
        letter-spacing: 0.06em;
      }

      @keyframes sweep {
        0% {
          transform: translateY(-100vh);
          opacity: 0;
        }
        5% {
          opacity: 1;
        }
        95% {
          opacity: 1;
        }
        100% {
          transform: translateY(100vh);
          opacity: 0;
        }
      }

      .portfolio-page .glitch-sweep {
        position: fixed;
        left: 0;
        right: 0;
        height: 2px;
        background: rgba(232, 228, 220, 0.04);
        z-index: 9997;
        pointer-events: none;
        animation: sweep 12s linear infinite;
        top: 0;
      }

      .portfolio-page .glitch-sweep:nth-child(2) {
        animation-delay: -4s;
        height: 1px;
        opacity: 0.5;
      }

      .portfolio-page .glitch-sweep:nth-child(3) {
        animation-delay: -8s;
        height: 3px;
        opacity: 0.3;
      }

      .portfolio-page .fi {
        opacity: 0;
        transform: translateY(12px);
        animation: fu 0.6s ease forwards;
      }

      @keyframes fu {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .portfolio-page .fi:nth-child(1) {
        animation-delay: 0.05s;
      }
      .portfolio-page .fi:nth-child(2) {
        animation-delay: 0.12s;
      }
      .portfolio-page .fi:nth-child(3) {
        animation-delay: 0.2s;
      }
      .portfolio-page .fi:nth-child(4) {
        animation-delay: 0.28s;
      }
      .portfolio-page .fi:nth-child(5) {
        animation-delay: 0.36s;
      }

      @media (max-width: 640px) {
        .portfolio-page .about-grid,
        .portfolio-page .two-col {
          grid-template-columns: 1fr;
          gap: 20px;
        }
        .portfolio-page .exp-item {
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .portfolio-page .nav-links {
          display: none;
        }
        .portfolio-page .hero-actions,
        .portfolio-page .project-header {
          flex-direction: column;
        }
      }
    `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

export default function PortfolioStyles() {
  const css = `

      .portfolio-page {
        --bg: #0a0a0a;
        --bg-warm: #181818;
        --surface: #181818;
        --surface2: #232323;
        --border: #353535;
        --border-hi: #555;
        --phosphor: #fff;
        --phosphor-dim: #e0e0e0;
        --phosphor-low: #b0b0b0;
        --phosphor-off: #888;
        --scanline: rgba(0, 0, 0, 0.35);
        --mono: 'Inter', 'IBM Plex Mono', 'Segoe UI', Arial, sans-serif;
        --display: 'Inter', 'IBM Plex Mono', 'Segoe UI', Arial, sans-serif;
        --max: 820px;

        font-family: var(--mono);
        background: var(--bg);
        color: var(--phosphor);
        font-size: 16px;
        line-height: 1.8;
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
        color: #4ea8ff;
        text-decoration: underline;
        outline: none;
        transition: color 0.2s, box-shadow 0.2s;
      }

      .portfolio-page a:hover,
      .portfolio-page a:focus {
        color: #1e90ff;
        text-decoration: underline;
        outline: 2px solid #1e90ff;
        outline-offset: 2px;
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
        font-size: 14px;
        color: var(--phosphor);
        letter-spacing: 0.1em;
        text-transform: lowercase;
        transition: color 0.1s;
        outline: none;
      }

      .portfolio-page .nav-links a:focus {
        outline: 2px solid #1e90ff;
        outline-offset: 2px;
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
        font-size: clamp(44px, 7vw, 68px);
        color: var(--phosphor);
        letter-spacing: 0.01em;
        line-height: 1.1;
        margin-bottom: 18px;
        text-shadow: 0 0 30px rgba(0,0,0,0.12);
      }

      .portfolio-page .hero-role {
        font-size: 12px;
        color: var(--phosphor-dim);
        margin-bottom: 28px;
        letter-spacing: 0.08em;
      }


      .portfolio-page .hero-bio {
        font-size: 17px;
        color: var(--phosphor);
        max-width: 600px;
        line-height: 1.9;
        margin-bottom: 44px;
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
        gap: 20px;
      }

      .portfolio-page .project-card {
        background: var(--surface);
        border: 1px solid var(--border);
        padding: 18px 22px;
        position: relative;
        overflow: hidden;
        border-radius: 8px;
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
        font-size: 20px;
        color: var(--phosphor);
        font-weight: 600;
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
        content: '-';
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

      .portfolio-page .ft-location {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        line-height: 1;
      }

      .portfolio-page .loc-icon {
        width: 20px;
        height: 20px;
        opacity: 0.9;
        display: block;
      }

      .portfolio-page .loc-label {
        font-size: 10px;
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

      .portfolio-page .web-preview-card {
        background: var(--surface);
        border: 1px solid var(--border);
        overflow: hidden;
        position: relative;
        border-radius: 8px;
      }

      .portfolio-page .web-preview-card::after {
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

      .portfolio-page .browser-chrome {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--bg);
        border-bottom: 1px solid var(--border);
        padding: 9px 14px;
      }

      .portfolio-page .browser-dots {
        display: flex;
        gap: 5px;
        flex-shrink: 0;
      }

      .portfolio-page .browser-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--border-hi);
      }

      .portfolio-page .browser-url {
        flex: 1;
        font-size: 10px;
        color: var(--phosphor-off);
        background: var(--surface2);
        border: 1px solid var(--border);
        padding: 3px 10px;
        letter-spacing: 0.04em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .portfolio-page .preview-frame-wrap {
        position: relative;
        width: 100%;
        height: 280px;
        overflow: hidden;
        background: var(--bg-warm);
      }

      .portfolio-page .preview-frame {
        width: 200%;
        height: 200%;
        border: none;
        transform: scale(0.5);
        transform-origin: top left;
        pointer-events: none;
      }

      .portfolio-page .preview-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, transparent 60%, var(--surface) 100%);
        pointer-events: none;
      }

      .portfolio-page .web-card-body {
        padding: 16px 20px 20px;
      }

      .portfolio-page .web-card-body h3 {
        font-family: var(--display);
        font-size: 17px;
        color: var(--phosphor);
        font-weight: 400;
        margin-bottom: 8px;
      }


      .portfolio-page .web-card-body p {
        font-size: 15px;
        color: var(--phosphor);
        line-height: 1.85;
        margin-bottom: 18px;
      }
      /* Accessibility: focus outlines for all interactive elements */
      .portfolio-page button:focus,
      .portfolio-page [tabindex]:focus {
        outline: 2px solid #1e90ff;
        outline-offset: 2px;
      }

      /* Accessibility: high contrast for tags and badges */
      .portfolio-page .tag {
        color: #222;
        background: #ffe066;
        border: 1px solid #e6b800;
      }

      .portfolio-page .project-badge,
      .portfolio-page .badge-wip,
      .portfolio-page .badge-next,
      .portfolio-page .badge-plan,
      .portfolio-page .badge-done {
        background: #222;
        color: #ffe066;
        border: 1px solid #ffe066;
      }

      .portfolio-page .web-card-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
      }

      .compact-project-card {
        padding: 14px 16px !important;
        margin-bottom: 0;
        min-height: unset;
        border-radius: 8px;
        box-shadow: 0 1px 8px 0 rgba(0,0,0,0.04);
      }
      .compact-project-card .project-header {
        margin-bottom: 8px;
      }
      .compact-project-card h3 {
        font-size: 1.08rem;
        margin-bottom: 0;
      }
      .compact-project-card .project-badge {
        font-size: 10px;
        padding: 2px 7px;
      }
      .compact-project-card .plink {
        font-size: 12px;
      }
      .compact-project-card .project-summary {
        font-size: 0.98rem;
        color: var(--phosphor-dim, #e0e0e0);
        margin: 8px 0 10px 0;
        line-height: 1.6;
      }
      .compact-project-card .tags {
        gap: 4px;
      }

      @media (max-width: 640px) {
        .portfolio-page nav .wrap {
          height: auto;
          min-height: 48px;
          padding-top: 8px;
          padding-bottom: 8px;
          align-items: flex-start;
          gap: 10px;
          flex-direction: column;
        }
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
          display: flex;
          flex-wrap: wrap;
          gap: 10px 14px;
          width: 100%;
        }
        .portfolio-page .nav-links a {
          font-size: 10px;
          letter-spacing: 0.08em;
        }
        .portfolio-page .hero-actions,
        .portfolio-page .project-header {
          flex-direction: column;
        }
      }

      /* ---- Simpler, standard, recruiter-friendly override layer ---- */
      .portfolio-page {
        --bg: #f8fafc !important;
        --surface: #ffffff !important;
        --surface2: #f1f5f9 !important;
        --border: #e2e8f0 !important;
        --border-hi: #cbd5e1 !important;
        --phosphor: #0f172a !important;
        --phosphor-dim: #334155 !important;
        --phosphor-low: #475569 !important;
        background: #f8fafc !important;
        color: #0f172a !important;
        font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif !important;
        line-height: 1.65 !important;
      }

      .skip-link {
        position: absolute;
        left: 16px;
        top: -48px;
        z-index: 2000;
        background: #1d4ed8;
        color: #ffffff;
        padding: 10px 14px;
        border-radius: 10px;
        font-weight: 600;
      }

      .skip-link:focus {
        top: 12px;
      }

      .portfolio-page::before,
      .portfolio-page::after,
      .glitch-sweep {
        display: none !important;
        content: none !important;
      }

      .portfolio-page a {
        color: #1d4ed8 !important;
        text-decoration: none !important;
      }

      .portfolio-page a:hover,
      .portfolio-page a:focus {
        color: #1e40af !important;
        text-decoration: underline !important;
        outline: 2px solid #93c5fd !important;
        outline-offset: 2px !important;
      }

      .portfolio-page nav {
        background: #ffffff !important;
        border-bottom: 1px solid #e2e8f0 !important;
      }

      .portfolio-page nav .wrap {
        height: 64px !important;
      }

      .portfolio-page .nav-logo {
        font-size: 1rem !important;
        font-weight: 700 !important;
        line-height: 1;
        letter-spacing: 0 !important;
        color: #0f172a !important;
        animation: none !important;
        text-decoration: none !important;
      }

      .portfolio-page .nav-signature,
      .portfolio-page .ft-signature {
        font-family: 'Snell Roundhand', 'Apple Chancery', 'Bradley Hand', 'Segoe Script', cursive !important;
        font-weight: 600 !important;
        letter-spacing: 0.01em !important;
      }

      .portfolio-page .nav-signature {
        font-size: 1.35rem !important;
      }

      .portfolio-page .ft-signature {
        font-size: 1.2rem !important;
        color: inherit !important;
      }

      .portfolio-page .nav-links {
        gap: 14px !important;
      }

      .portfolio-page .nav-shell {
        display: flex;
        align-items: center;
      }

      .portfolio-page .nav-links-desktop {
        margin-left: 42px;
        flex: 1;
        justify-content: center;
      }

      .portfolio-page .nav-actions {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-left: 18px;
      }

      .portfolio-page .theme-toggle {
        border: 1px solid #cbd5e1;
        background: #ffffff;
        color: #0f172a;
        border-radius: 10px;
        width: 38px;
        height: 38px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        font-weight: 600;
        white-space: nowrap;
      }

      .portfolio-page .nav-toggle {
        display: none;
        width: 38px;
        height: 38px;
        border: 1px solid #cbd5e1;
        background: #ffffff;
        border-radius: 10px;
        padding: 8px;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 4px;
      }

      .portfolio-page .nav-toggle span {
        display: block;
        width: 16px;
        height: 2px;
        background: #334155;
        border-radius: 2px;
      }

      .portfolio-page .mobile-nav-backdrop,
      .portfolio-page .mobile-nav-card {
        display: none;
      }

      .portfolio-page .nav-links a {
        text-transform: none !important;
        letter-spacing: 0 !important;
        font-size: 0.95rem !important;
        color: #334155 !important;
        font-weight: 500 !important;
      }

      .portfolio-page section {
        border-top: 1px solid #e2e8f0 !important;
        padding: 64px 0 !important;
      }

      .portfolio-page #hero {
        padding-top: 120px !important;
      }

      .portfolio-page .hero-eyebrow,
      .portfolio-page .hero-role {
        font-size: 0.95rem !important;
        letter-spacing: 0 !important;
        text-transform: none !important;
        color: #475569 !important;
      }

      .portfolio-page h1.name {
        font-size: clamp(2rem, 4vw, 3rem) !important;
        line-height: 1.2 !important;
        margin-bottom: 0.75rem !important;
        text-shadow: none !important;
        color: #0f172a !important;
      }

      .portfolio-page .hero-bio {
        color: #334155 !important;
        font-size: 1.05rem !important;
        margin-bottom: 1.25rem !important;
      }

      .portfolio-page .btn {
        border-radius: 10px !important;
        border: 1px solid #cbd5e1 !important;
        color: #0f172a !important;
        background: #ffffff !important;
        padding: 10px 16px !important;
        text-transform: none !important;
        letter-spacing: 0 !important;
        font-size: 0.95rem !important;
      }

      .portfolio-page .btn::before {
        display: none !important;
      }

      .portfolio-page .btn-primary {
        background: #1d4ed8 !important;
        color: #ffffff !important;
        border-color: #1d4ed8 !important;
      }

      .portfolio-page .section-label {
        color: #0f172a !important;
        font-size: 1.35rem !important;
        font-weight: 700 !important;
        letter-spacing: 0 !important;
        text-transform: none !important;
        margin-bottom: 1rem !important;
      }

      .portfolio-page .about-grid,
      .portfolio-page .exp-item {
        gap: 20px !important;
      }

      .portfolio-page .exp-item,
      .portfolio-page .writing-item,
      .portfolio-page .contact-block,
      .portfolio-page .project-card {
        background: #ffffff !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 12px !important;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06) !important;
      }

      .portfolio-page .exp-item,
      .portfolio-page .contact-block {
        padding: 20px !important;
      }

      .portfolio-page .tag,
      .portfolio-page .stack-chip {
        background: #eff6ff !important;
        color: #1e3a8a !important;
        border: 1px solid #bfdbfe !important;
        border-radius: 999px !important;
      }

      .portfolio-page .projects-note {
        color: #475569;
        margin-bottom: 18px;
        max-width: 760px;
      }

      .portfolio-page .projects-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      .portfolio-page .project-card {
        padding: 18px;
      }

      .portfolio-page .project-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .portfolio-page .project-card h3 {
        margin: 0;
        font-size: 1.1rem;
      }

      .portfolio-page .project-status {
        font-size: 0.78rem;
        background: #e2e8f0;
        color: #334155;
        padding: 4px 8px;
        border-radius: 999px;
      }

      .portfolio-page .project-summary {
        margin: 10px 0 12px;
        color: #334155;
      }

      .portfolio-page .project-link {
        display: inline-block;
        margin-top: 10px;
        font-weight: 600;
      }

      .portfolio-page .project-link-disabled {
        color: #64748b !important;
        font-weight: 500;
        text-decoration: none !important;
        cursor: not-allowed;
      }

      .portfolio-page footer {
        border-top: 1px solid #e2e8f0 !important;
        padding: 20px 0 !important;
        color: #64748b !important;
      }

      .portfolio-page.brand-page {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .portfolio-page.brand-page footer {
        margin-top: auto;
      }

      html.dark .portfolio-page {
        --bg: #0b1220 !important;
        --surface: #111827 !important;
        --surface2: #0f172a !important;
        --border: #1f2937 !important;
        --border-hi: #334155 !important;
        --phosphor: #e2e8f0 !important;
        --phosphor-dim: #cbd5e1 !important;
        --phosphor-low: #94a3b8 !important;
        background: #0b1220 !important;
        color: #e2e8f0 !important;
      }

      html.dark .portfolio-page nav {
        background: #0f172a !important;
        border-bottom-color: #1f2937 !important;
      }

      html.dark .portfolio-page .nav-logo,
      html.dark .portfolio-page .section-label,
      html.dark .portfolio-page h1.name,
      html.dark .portfolio-page .btn,
      html.dark .portfolio-page .project-card h3 {
        color: #e2e8f0 !important;
      }

      html.dark .portfolio-page .nav-links a,
      html.dark .portfolio-page .hero-eyebrow,
      html.dark .portfolio-page .hero-role,
      html.dark .portfolio-page .hero-bio,
      html.dark .portfolio-page .project-summary,
      html.dark .portfolio-page .projects-note,
      html.dark .portfolio-page .project-status,
      html.dark .portfolio-page footer {
        color: #cbd5e1 !important;
      }

      html.dark .portfolio-page section,
      html.dark .portfolio-page footer,
      html.dark .portfolio-page .exp-item,
      html.dark .portfolio-page .writing-item,
      html.dark .portfolio-page .contact-block,
      html.dark .portfolio-page .project-card,
      html.dark .portfolio-page .btn,
      html.dark .portfolio-page .theme-toggle {
        border-color: #334155 !important;
      }

      html.dark .portfolio-page .exp-item,
      html.dark .portfolio-page .writing-item,
      html.dark .portfolio-page .contact-block,
      html.dark .portfolio-page .project-card,
      html.dark .portfolio-page .theme-toggle,
      html.dark .portfolio-page .nav-toggle,
      html.dark .portfolio-page .btn {
        background: #111827 !important;
      }

      html.dark .portfolio-page .theme-toggle {
        color: #ffffff !important;
      }

      html.dark .portfolio-page .nav-toggle span {
        background: #e2e8f0;
      }

      html.dark .portfolio-page .btn-primary {
        background: #2563eb !important;
        border-color: #2563eb !important;
        color: #ffffff !important;
      }

      html.dark .portfolio-page .tag,
      html.dark .portfolio-page .stack-chip,
      html.dark .portfolio-page .project-status {
        background: #1e293b !important;
        color: #bfdbfe !important;
        border-color: #334155 !important;
      }

      @media (prefers-reduced-motion: reduce) {
        .portfolio-page *,
        .portfolio-page *::before,
        .portfolio-page *::after {
          animation: none !important;
          transition: none !important;
          scroll-behavior: auto !important;
        }
      }

      @media (max-width: 900px) {
        .portfolio-page nav .wrap {
          height: auto !important;
          flex-wrap: nowrap;
          row-gap: 0;
          padding-top: 10px;
          padding-bottom: 10px;
        }

        .portfolio-page .nav-links-desktop {
          display: none;
        }

        .portfolio-page .nav-toggle {
          display: inline-flex;
        }

        .portfolio-page .mobile-nav-backdrop {
          display: block;
          position: fixed;
          inset: 64px 0 0 0;
          background: rgba(15, 23, 42, 0.22);
          backdrop-filter: blur(5px);
          border: 0;
          padding: 0;
          margin: 0;
          z-index: 998;
        }

        .portfolio-page .mobile-nav-card {
          position: fixed;
          top: 76px;
          left: 14px;
          right: 14px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 16px 30px rgba(15, 23, 42, 0.18);
          padding: 12px;
          z-index: 999;
          opacity: 0;
          transform: translateY(-8px);
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .portfolio-page .mobile-nav-card.open {
          display: block;
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .portfolio-page .nav-links-mobile {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin: 0;
          padding: 0;
        }

        .portfolio-page .nav-links-mobile a {
          display: block;
          padding: 10px 10px;
          border-radius: 8px;
        }

        html.dark .portfolio-page .mobile-nav-card {
          background: rgba(17, 24, 39, 0.97);
          border-color: #334155;
        }

        .portfolio-page .projects-grid {
          grid-template-columns: 1fr;
        }
      }
    `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

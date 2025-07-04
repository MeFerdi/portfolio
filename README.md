# Ferdynand Odhiamb## About

This portfolio serves as a comprehensive showcase of my skills, experiences, and projects I've worked on. Built with modern web technologies, it features a clean, professional design with smooth animations and interactive elements. The portfolio includes sections for my professional experience, education, featured projects, and technical publications. Portfolio

Welcome to the personal portfolio of **Ferdynand Odhiambo**! This modern, responsive portfolio showcases my skills, experience, projects, and publications, offering a comprehensive glimpse into my journey as a passionate Full Stack Software Developer.

## 🌟 Live Demo

Visit the live portfolio: [ferdportfolio.fly.dev](https://ferdportfolio.fly.dev)

## Table of Contents

- [About](#about)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## About

This portfolio serves as a hub to showcase my skills, experiences, and the projects I’ve worked on. Feel free to explore and learn more about my journey.

## Technologies Used

This portfolio is built using cutting-edge web development technologies:

### **Frontend:**
- **Next.js 13** - React framework with App Router for server-side rendering and optimization
- **React 18** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Heroicons** - Beautiful SVG icons for consistent UI elements

### **Features & Functionality:**
- **Theme System** - Custom light/dark mode toggle with system preference detection
- **Responsive Design** - Mobile-first approach with seamless cross-device experience
- **Component Architecture** - Modular, reusable React components
- **Content Management** - JSON-based content system for easy updates
- **Animation System** - Smooth transitions and hover effects throughout

### **Development & Deployment:**
- **Node.js 18** - Runtime environment
- **Docker** - Containerized deployment with multi-stage builds
- **Fly.io** - Cloud deployment platform with auto-scaling
- **Git & GitHub** - Version control and collaboration

### **Performance & SEO:**
- **Static Site Generation** - Optimized build output for fast loading
- **Image Optimization** - Next.js built-in image optimization
- **Metadata Management** - SEO-friendly meta tags and structured data

## Features

### **🎨 Design & User Experience**
- **Modern UI/UX** - Clean, professional design with intuitive navigation
- **Light/Dark Mode** - Seamless theme switching with sun/moon toggle icons
- **Responsive Layout** - Mobile-first design that works on all devices
- **Smooth Animations** - Engaging hover effects and page transitions
- **Accessibility** - WCAG compliant with keyboard navigation support

### **📱 Interactive Components**
- **Project Showcase** - Stacked card layout with live demos and GitHub links
- **Publications Gallery** - Navigable publication cards with external links
- **Experience Timeline** - Professional experience with skills and achievements
- **Education Section** - Academic background and certifications
- **Social Integration** - Direct links to LinkedIn, GitHub, and email

### **⚡ Performance Features**
- **Fast Loading** - Optimized bundle size and image loading
- **SEO Optimized** - Meta tags and structured data for search engines
- **Progressive Enhancement** - Works without JavaScript for core functionality
- **Health Monitoring** - Built-in health check endpoint for deployment monitoring

### **🔧 Developer Experience**
- **Component-Based** - Modular React components for maintainability
- **Type Safety** - JSX with proper prop validation
- **Hot Reloading** - Instant development feedback
- **Docker Ready** - Containerized for consistent deployment
- **Auto Deployment** - Continuous deployment pipeline with Fly.io

## Project Structure

```
portfolio/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and theme variables
│   ├── layout.js          # Root layout with theme provider
│   ├── page.js           # Home page
│   └── favicon.ico       # Site favicon
├── components/            # Reusable React components
│   ├── about.jsx         # About section component
│   ├── header.jsx        # Main header with navigation
│   ├── theme-toggle.jsx  # Light/dark mode toggle
│   ├── education/        # Education components
│   ├── experiences/      # Experience components
│   ├── projects/         # Project showcase components
│   └── publications/     # Publications gallery components
├── contexts/             # React context providers
│   └── ThemeContext.js   # Theme management context
├── pages/api/           # API routes
│   └── health.js        # Health check endpoint
├── public/              # Static assets
│   ├── logos/           # Company and technology logos
│   └── translations/    # Content data in JSON format
├── Dockerfile           # Container configuration
├── fly.toml            # Fly.io deployment config
└── package.json        # Dependencies and scripts
```

## Getting Started

### **Prerequisites**
- Node.js 18 or higher
- npm or yarn package manager

### **Installation**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MeFerdi/portfolio.git
   cd portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### **Available Scripts**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to Fly.io

## Deployment

This portfolio is configured for deployment on **Fly.io** with Docker:

### **Quick Deploy**
```bash
fly launch
npm run deploy
```

### **Manual Deployment**
1. Install [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/)
2. Login: `fly auth login`
3. Deploy: `fly deploy`

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

---

## 📬 Contact

**Ferdynand Odhiambo**
- 📧 Email: oferdinandddev112@gmail.com
- 💼 LinkedIn: [ferdynand-odhiambo](https://www.linkedin.com/in/ferdynand-odhiambo)
- 🐱 GitHub: [MeFerdi](https://github.com/MeFerdi)
- 🌐 Portfolio: [ferdportfolio.fly.dev](https://ferdportfolio.fly.dev)

---

*Built with ❤️ using Next.js and deployed on Fly.io*
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  return (
    <nav aria-label="Primary">
      <div className="wrap">
        <a href="/" className="nav-logo nav-signature">Ferdynand</a>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#work">Experience</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#writing">Writing</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="/webdev">Web Dev</a></li>
          <li><a href="/brand">Creative</a></li>
        </ul>
        <ThemeToggle />
      </div>
    </nav>
  );
}

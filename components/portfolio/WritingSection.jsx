const posts = [
  {
    href: 'https://dev.to/ferdinandodhiambo/cache-invalidation-the-silent-performance-killer-1fl8',
    title: 'Cache Invalidation: The Silent Performance Killer',
    meta: 'Dev.to · Backend Systems',
  },
  {
    href: 'https://dev.to/ferdinandodhiambo/mastering-cors-in-golang-a-comprehensive-guide-25h2',
    title: 'Mastering CORS in Golang: A Comprehensive Guide',
    meta: 'Dev.to · Go',
  },
  {
    href: 'https://dev.to/ferdinandodhiambo/leveraging-axios-interceptors-in-nextjs-4hi',
    title: 'Leveraging Axios Interceptors in Next.js',
    meta: 'Dev.to · JavaScript',
  },
];

export default function WritingSection() {
  return (
    <section id="writing">
      <div className="wrap">
        <div className="section-label">Writing</div>
        <div>
          {posts.map((post) => (
            <a key={post.href} href={post.href} className="writing-item" target="_blank" rel="noreferrer">
              <div>
                <span className="wt">{post.title}</span>
                <span className="wm">{post.meta}</span>
              </div>
              <span className="wa">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

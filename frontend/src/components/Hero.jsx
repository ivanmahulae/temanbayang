function Hero() {
  return (
    <section className="hero-section hero-section-custom">
      <h1 className="hero-title">
        Tempat Aman untuk Didengar dan Dimengerti
      </h1>
      <p className="hero-description">
        TemanBayang hadir sebagai ruang berbagi cerita, komentar anonim, dan dukungan emosional yang manusiawi.
      </p>
      <input
        type="text"
        placeholder="Cari cerita, topik, atau kata kunci..."
        className="hero-search-input"
      />
    </section>
  );
}

export default Hero;

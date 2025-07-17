function HighlightSection() {
  const highlights = [
    { title: 'Cerita paling disukai minggu ini', date: '9 Juli 2025' },
    { title: 'Cerita paling banyak komentar', date: '8 Juli 2025' },
    { title: 'Pengguna baru yang aktif', date: '7 Juli 2025' },
  ];

  return (
    <div className="highlight-section">
      <h3 className="highlight-title">Highlight</h3>
      <ul className="highlight-list">
        {highlights.map((item, idx) => (
          <li key={idx} className="highlight-item">
            <strong>{item.title}</strong>
            <div className="highlight-date">{item.date}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HighlightSection;
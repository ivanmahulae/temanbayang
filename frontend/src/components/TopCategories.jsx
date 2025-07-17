function TopCategories() {
  const categories = [
    { label: 'Cerita Baru', icon: '📝', color: '#3498db' },
    { label: 'Dukungan Emosional', icon: '💬', color: '#e74c3c' },
    { label: 'Anonim Terbaru', icon: '👻', color: '#2ecc71' },
  ];

  return (
    <div className="top-category-wrap">
      <h3 className="top-category-title">Kategori Populer</h3>
      <div className="category-boxes">
        {categories.map((cat, i) => (
          <div
            key={i}
            className="category-box"
            style={{ border: `2px solid ${cat.color}` }}
          >
            <div className="category-icon">{cat.icon}</div>
            {cat.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopCategories;
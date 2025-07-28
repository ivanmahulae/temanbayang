import { useEffect, useState } from 'react';
import StoryForm from '../components/StoryForm';
import CommentForm from '../components/CommentForm';
import Hero from '../components/Hero';
import TopCategories from '../components/TopCategories';
import HighlightSection from '../components/HighlightSection';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiHeart, FiMessageCircle, FiRepeat, FiBookmark } from 'react-icons/fi';

const getAnonymousId = () => {
  let id = localStorage.getItem('anonymousId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('anonymousId', id);
  }
  return id;
};

function Home() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [userId, setUserId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [openCommentMenu, setOpenCommentMenu] = useState(null);

  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      } catch (err) {
        console.error('Token tidak valid:', err.message);
      }
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      fetch(`${import.meta.env.VITE_API_URL}/stories`)
        .then((res) => res.json())
        .then((data) => {
          setStories(data.data || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Gagal ambil cerita:', err);
          setLoading(false);
        });
    }, 600);
  }, [refresh]);

  const showAlert = (msg) => {
    setAlert(msg);
    setTimeout(() => setAlert(null), 3000);
  };

  const handleDeleteComment = async (storyId, commentId) => {
    const konfirmasi = await Swal.fire({
      title: 'Hapus Komentar?',
      text: 'Kamu yakin ingin menghapus komentar ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });

    if (!konfirmasi.isConfirmed) return;

    const token = localStorage.getItem('token');
    const anonymousId = getAnonymousId();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/stories/${storyId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'x-anonymous-id': anonymousId,
        },
      });

      const data = await res.json();
      setOpenCommentMenu(null);

      if (data.status === 'success') {
        setRefresh(!refresh);
        showAlert('Komentar berhasil dihapus.');
      } else {
        showAlert(data.message || 'Gagal menghapus komentar.');
      }
    } catch (err) {
      console.error('Gagal hapus komentar:', err.message);
      setOpenCommentMenu(null);
      showAlert('Gagal menghubungi server.');
    }
  };

  const handleDeleteStory = async (storyId) => {
    const konfirmasi = await Swal.fire({
      title: 'Hapus Cerita?',
      text: 'Cerita akan dihapus secara permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });

    if (!konfirmasi.isConfirmed) return;

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setOpenCommentMenu(null);
      if (data.status === 'success') {
        setRefresh(!refresh);
        showAlert('Cerita berhasil dihapus.');
      } else {
        showAlert(data.message || 'Gagal menghapus cerita.');
      }
    } catch (err) {
      console.error('Gagal hapus cerita:', err.message);
      setOpenCommentMenu(null);
      showAlert('Gagal menghubungi server.');
    }
  };

  if (loading)
    return (
      <div className="spinner">
        <p className="empty-state">Memuat cerita...</p>
      </div>
    );

  return (
    <div>
      <Hero />
      <div className="container">
        <TopCategories />
        <HighlightSection />

        {alert && <div className="alert">{alert}</div>}

        <h2 id="daftar-cerita">Daftar Cerita</h2>

        {isLoggedIn && (
          <StoryForm
            onStoryAdded={() => {
              setRefresh(!refresh);
              showAlert('Cerita berhasil ditambahkan.');
            }}
          />
        )}

        {stories.length === 0 ? (
          <p>Belum ada cerita.</p>
        ) : (
          stories.map((story) => {
            const isStoryOwner = String(story.user?.id) === String(userId);
            return (
              <div key={story.id} className="story">
                <div className="story-header">
                  <div className="story-user">
                    <img src="/anon-avatar.png" alt="avatar" className="avatar-small" />
                    <div>
                      <strong>{story.user?.name || 'Anonim'}</strong>
                      <p className="posted-time">
                        Diposting: {new Date(story.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {isStoryOwner && (
                    <div style={{ position: 'relative' }}>
                      <button
                        className="dot-menu-btn"
                        onClick={() =>
                          setOpenCommentMenu(openCommentMenu === story.id ? null : story.id)
                        }
                      >
                        ⋮
                      </button>
                      {openCommentMenu === story.id && (
                        <div className="menu-dropdown">
                          <button
                            className="danger-btn"
                            onClick={() => handleDeleteStory(story.id)}
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <h3>{story.title}</h3>
                <p>{story.body}</p>

                <div className="social-row">
                  <button className="icon-button no-highlight"><FiHeart />Suka</button>
                  <button className="icon-button no-highlight"><FiMessageCircle />Komentar</button>
                  <button className="icon-button no-highlight"><FiRepeat />Bagikan</button>
                  <button className="icon-button no-highlight"><FiBookmark />Simpan</button>
                </div>

                <Link to={`/stories/${story.id}`} className="story-detail-link">
                  Lihat Detail
                </Link>

                <h4>Komentar ({story.comments.length})</h4>
                {story.comments.length === 0 && <p>Belum ada komentar.</p>}
                <ul>
                  {story.comments.map((comment) => {
                    const isOwner =
                      String(comment.user?.id) === String(userId) ||
                      comment.user?.anonymousId === getAnonymousId();

                    return (
                      <li key={comment.id} className="comment-item">
                        <img src="/anon-avatar.png" alt="avatar" className="avatar-small" />
                        <div style={{ flex: 1 }}>
                          <strong>{comment.user?.name || 'Anonim'}:</strong> {comment.body}
                          <p className="comment-meta">
                            Diposting: {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {isOwner && (
                          <div>
                            <button
                              className="comment-menu-btn"
                              onClick={() =>
                                setOpenCommentMenu(openCommentMenu === comment.id ? null : comment.id)
                              }
                            >
                              ⋮
                            </button>
                            {openCommentMenu === comment.id && (
                              <div className="menu-dropdown">
                                <button
                                  className="danger-btn"
                                  onClick={() => handleDeleteComment(story.id, comment.id)}
                                >
                                  Hapus
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <CommentForm
                  storyId={story.id}
                  onCommentSuccess={() => {
                    setRefresh(!refresh);
                    showAlert('Komentar berhasil dikirim.');
                  }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Home;

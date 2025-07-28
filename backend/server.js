const Hapi = require('@hapi/hapi');
const { stories } = require('./stories');
const { users } = require('./users');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'temanbayang-super-rahasia';

const verifyToken = (request, h) => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token tidak ditemukan');
  }

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error('Token tidak valid');
  }
};

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Content-Type', 'Authorization', 'x-anonymous-id'],
        additionalHeaders: ['x-anonymous-id'],
        credentials: true,
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: () => ({ message: 'TemanBayang API Aktif!' }),
  });

  server.route({
    method: 'POST',
    path: '/register',
    handler: async (request, h) => {
      const { name, email, password } = request.payload;
      if (!name || !email || !password) {
        return h.response({ status: 'fail', message: 'Semua kolom wajib diisi.' }).code(400);
      }
      const isUsed = users.find((u) => u.email === email);
      if (isUsed) {
        return h.response({ status: 'fail', message: 'Email sudah terdaftar.' }).code(400);
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { id: users.length + 1, name, email, password: hashedPassword };
      users.push(newUser);
      return h.response({
        status: 'success',
        message: 'Registrasi berhasil.',
        data: { id: newUser.id, name: newUser.name, email: newUser.email },
      }).code(201);
    },
  });

  server.route({
    method: 'POST',
    path: '/login',
    handler: async (request, h) => {
      const { email, password } = request.payload;
      const user = users.find((u) => u.email === email);
      if (!user) return h.response({ status: 'fail', message: 'Email tidak ditemukan.' }).code(401);
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return h.response({ status: 'fail', message: 'Password salah.' }).code(401);
      const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
      return h.response({ status: 'success', message: 'Login berhasil.', data: { token } }).code(200);
    },
  });

  server.route({
    method: 'POST',
    path: '/stories',
    handler: async (request, h) => {
      try {
        const user = verifyToken(request, h);
        const { title, body, isPrivate } = request.payload;
        if (!title || !body) {
          return h.response({ status: 'fail', message: 'Judul dan isi cerita wajib diisi.' }).code(400);
        }
        const newStory = {
          id: nanoid(),
          title,
          body,
          isPrivate: isPrivate || false,
          createdAt: new Date().toISOString(),
          user: { id: user.id, name: user.name },
          comments: [],
        };
        stories.push(newStory);
        return h.response({ status: 'success', message: 'Cerita berhasil ditambahkan.', data: newStory }).code(201);
      } catch (err) {
        return h.response({ status: 'fail', message: err.message || 'Token tidak valid' }).code(401);
      }
    },
  });

  server.route({
    method: 'GET',
    path: '/stories',
    handler: () => {
      const publicStories = stories
        .filter((s) => !s.isPrivate)
        .map((story) => ({
          ...story,
          comments: story.comments.map((comment) => ({
            ...comment,
            user: {
              id: comment.user?.id || null,
              name: comment.user?.name || 'Anonim',
              anonymousId: comment.user?.anonymousId || null,
              isAnonymous: comment.user?.isAnonymous || false,
            },
          })),
        }));
      return { status: 'success', data: publicStories };
    },
  });

  server.route({
    method: 'GET',
    path: '/stories/{id}',
    handler: (request, h) => {
      const { id } = request.params;
      const story = stories.find((s) => s.id === id);
      if (!story) return h.response({ status: 'fail', message: 'Cerita tidak ditemukan.' }).code(404);

      if (story.isPrivate) {
        try {
          const user = verifyToken(request, h);
          if (story.user.id !== user.id) {
            return h.response({ status: 'fail', message: 'Kamu tidak punya akses ke cerita ini.' }).code(403);
          }
        } catch (err) {
          return h.response({ status: 'fail', message: 'Token tidak valid atau tidak ditemukan.' }).code(401);
        }
      }

      const storyWithAnon = {
        ...story,
        comments: story.comments.map((comment) => ({
          ...comment,
          user: {
            id: comment.user?.id || null,
            name: comment.user?.name || 'Anonim',
            anonymousId: comment.user?.anonymousId || null,
            isAnonymous: comment.user?.isAnonymous || false,
          },
        })),
      };

      return { status: 'success', data: storyWithAnon };
    },
  });

  server.route({
    method: 'POST',
    path: '/stories/{id}/comments',
    handler: (request, h) => {
      let user = null;
      const authHeader = request.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        try {
          user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        } catch {}
      }
      const { id } = request.params;
      const { comment, isAnonymous, anonymousId } = request.payload;
      const story = stories.find((s) => s.id === id);
      if (!story) return h.response({ status: 'fail', message: 'Cerita tidak ditemukan.' }).code(404);
      if (!comment || comment.trim() === '') return h.response({ status: 'fail', message: 'Komentar tidak boleh kosong.' }).code(400);

      const newComment = {
        id: nanoid(),
        body: comment,
        createdAt: new Date().toISOString(),
        user: {
          id: user ? user.id : null,
          name: isAnonymous || !user ? 'Anonim' : user.name,
          isAnonymous: isAnonymous || false,
          anonymousId: isAnonymous && !user ? anonymousId : null,
        },
      };

      story.comments.push(newComment);
      return h.response({ status: 'success', message: 'Komentar berhasil ditambahkan.', data: newComment }).code(201);
    },
  });

  server.route({
    method: 'DELETE',
    path: '/stories/{storyId}/comments/{commentId}',
    handler: (request, h) => {
      const { storyId, commentId } = request.params;
      const story = stories.find((s) => s.id === storyId);
      if (!story) return h.response({ status: 'fail', message: 'Cerita tidak ditemukan.' }).code(404);

      const commentIndex = story.comments.findIndex((c) => c.id === commentId);
      if (commentIndex === -1) return h.response({ status: 'fail', message: 'Komentar tidak ditemukan.' }).code(404);

      const comment = story.comments[commentIndex];
      const tokenHeader = request.headers.authorization;
      const anonymousId = request.headers['x-anonymous-id'];

      if (tokenHeader?.startsWith('Bearer ')) {
        try {
          const user = jwt.verify(tokenHeader.split(' ')[1], JWT_SECRET);
          if (comment.user?.id !== user.id) {
            return h.response({ status: 'fail', message: 'Kamu tidak memiliki izin untuk menghapus komentar ini.' }).code(403);
          }
        } catch {
          return h.response({ status: 'fail', message: 'Token tidak valid' }).code(401);
        }
      } else {
        if (comment.user?.isAnonymous && comment.user.anonymousId !== anonymousId) {
          return h.response({ status: 'fail', message: 'Kamu tidak bisa menghapus komentar anonim orang lain.' }).code(403);
        }
      }

      story.comments.splice(commentIndex, 1);
      return h.response({ status: 'success', message: 'Komentar berhasil dihapus.' }).code(200);
    },
  });

  server.route({
    method: 'DELETE',
    path: '/stories/{id}',
    handler: (request, h) => {
      try {
        const user = verifyToken(request, h);
        const { id } = request.params;

        const storyIndex = stories.findIndex((s) => s.id === id);
        if (storyIndex === -1) return h.response({ status: 'fail', message: 'Cerita tidak ditemukan.' }).code(404);
        if (stories[storyIndex].user.id !== user.id) {
          return h.response({ status: 'fail', message: 'Kamu tidak punya izin untuk menghapus cerita ini.' }).code(403);
        }

        stories.splice(storyIndex, 1);
        return h.response({ status: 'success', message: 'Cerita berhasil dihapus.' }).code(200);
      } catch (err) {
        return h.response({ status: 'fail', message: err.message || 'Token tidak valid' }).code(401);
      }
    },
  });

  server.route({
    method: 'GET',
    path: '/diary',
    handler: (request, h) => {
      try {
        const user = verifyToken(request, h);
        const diaries = stories.filter((s) => s.isPrivate && s.user.id === user.id);
        return { status: 'success', data: diaries };
      } catch (err) {
        return h.response({ status: 'fail', message: err.message || 'Gagal mengakses diary pribadi.' }).code(401);
      }
    },
  });

  await server.start();
  console.log(`✅ Server berjalan di ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();

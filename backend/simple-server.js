const http = require('http');
const url = require('url');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3001;

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Usuarios en memoria
const users = {
  'test@example.com': {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: hashPassword('Password123'),
    role: 'student'
  }
};

// Cursos de ejemplo
const courses = {
  'c1': {
    id: 'c1',
    title: 'Inteligencia Artificial y Tecnologías Disruptivas',
    description: 'Programa de 52 semanas derivado del pensum del máster del Instituto Europeo de Posgrado, con recursos abiertos, práctica obligatoria y criterio de dominio por asignatura.',
    instructorId: 'instructor-1',
    published: true,
    imageUrl: 'https://via.placeholder.com/400x200?text=IA+%26+Tecnologias',
    modules: [
      {
        id: 'm1',
        title: 'Módulo 1: Fundamentos de IA',
        description: 'Conceptos básicos',
        order: 1,
        resources: [
          { id: 'r1', title: 'Introducción a Machine Learning', type: 'lecture', source: 'MIT OpenCourseWare' },
          { id: 'r2', title: 'Video: Neural Networks Basics', type: 'video', url: 'https://example.com/video1' },
          { id: 'r3', title: 'Ejercicio 1: Perceptrón Simple', type: 'exercise' }
        ]
      },
      {
        id: 'm2',
        title: 'Módulo 2: Deep Learning',
        description: 'Redes neuronales profundas',
        order: 2,
        resources: [
          { id: 'r4', title: 'Convolutional Neural Networks', type: 'lecture' },
          { id: 'r5', title: 'Ejercicio 2: Clasificación de Imágenes', type: 'exercise' },
          { id: 'r6', title: 'Trabajo Final: CNN en TensorFlow', type: 'assignment' }
        ]
      }
    ],
    createdAt: '2026-01-15',
    updatedAt: '2026-01-15'
  },
  'c2': {
    id: 'c2',
    title: 'Transformación Digital Empresarial',
    description: 'Estrategias y herramientas para digitalizar negocios en la era moderna.',
    instructorId: 'instructor-1',
    published: true,
    imageUrl: 'https://via.placeholder.com/400x200?text=Transformacion+Digital',
    modules: [
      {
        id: 'm3',
        title: 'Módulo 1: Estrategia Digital',
        description: 'Planificación digital',
        order: 1,
        resources: [
          { id: 'r7', title: 'Digital Transformation Strategy', type: 'lecture' },
          { id: 'r8', title: 'Case Study: Netflix', type: 'video' }
        ]
      }
    ],
    createdAt: '2026-02-01',
    updatedAt: '2026-02-01'
  },
  'c3': {
    id: 'c3',
    title: 'Cloud Computing y Microservicios',
    description: 'Arquitecturas modernas en la nube.',
    instructorId: 'instructor-2',
    published: true,
    imageUrl: 'https://via.placeholder.com/400x200?text=Cloud+Computing',
    modules: [],
    createdAt: '2026-02-10',
    updatedAt: '2026-02-10'
  }
};

// Progreso del estudiante
const progress = {
  '550e8400-e29b-41d4-a716-446655440000': {
    'c1': { courseId: 'c1', completed: 3, total: 9, percentage: 33 },
    'c2': { courseId: 'c2', completed: 1, total: 4, percentage: 25 },
    'c3': { courseId: 'c3', completed: 0, total: 3, percentage: 0 }
  }
};

const tokens = new Map();

function generateToken(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 3600000
  };
  tokens.set(token, payload);
  return token;
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function getAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const payload = tokens.get(token);
  if (!payload || payload.exp < Date.now()) return null;
  return Object.values(users).find(u => u.id === payload.sub);
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if ((pathname === '/health' || pathname === '/api/health') && req.method === 'GET') {
    sendJSON(res, 200, { status: 'ok' });
    return;
  }

  // ===== AUTH ENDPOINTS =====

  if (pathname === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { email, name, password } = JSON.parse(body);
        if (users[email]) {
          sendJSON(res, 409, { message: 'El correo ya está registrado' });
          return;
        }
        const newUser = {
          id: crypto.randomUUID(),
          email,
          name,
          passwordHash: hashPassword(password),
          role: 'student'
        };
        users[email] = newUser;
        progress[newUser.id] = {};
        sendJSON(res, 201, {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        });
      } catch (e) {
        sendJSON(res, 400, { message: 'Invalid JSON' });
      }
    });
    return;
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        const user = users[email];
        if (!user || user.passwordHash !== hashPassword(password)) {
          sendJSON(res, 401, { message: 'Credenciales inválidas' });
          return;
        }
        const accessToken = generateToken(user);
        const refreshToken = crypto.randomBytes(32).toString('hex');
        sendJSON(res, 200, {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        });
      } catch (e) {
        sendJSON(res, 400, { message: 'Invalid JSON' });
      }
    });
    return;
  }

  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const user = getAuthUser(req);
    if (!user) {
      sendJSON(res, 401, { message: 'Unauthorized' });
      return;
    }
    sendJSON(res, 200, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
    return;
  }

  // ===== COURSES ENDPOINTS =====

  if (pathname === '/api/courses' && req.method === 'GET') {
    const user = getAuthUser(req);
    if (!user) {
      sendJSON(res, 401, { message: 'Unauthorized' });
      return;
    }

    // Retornar cursos con progreso del usuario
    const coursesWithProgress = Object.values(courses).filter(c => c.published).map(course => ({
      ...course,
      progress: progress[user.id]?.[course.id] || { completed: 0, total: course.modules.reduce((sum, m) => sum + m.resources.length, 0), percentage: 0 }
    }));

    sendJSON(res, 200, coursesWithProgress);
    return;
  }

  if (pathname.match(/^\/api\/courses\/[a-zA-Z0-9-]+$/) && req.method === 'GET') {
    const courseId = pathname.split('/')[3];
    const course = courses[courseId];
    if (!course) {
      sendJSON(res, 404, { message: 'Course not found' });
      return;
    }
    const user = getAuthUser(req);
    const courseData = {
      ...course,
      progress: progress[user?.id]?.[courseId] || { completed: 0, total: course.modules.reduce((sum, m) => sum + m.resources.length, 0), percentage: 0 }
    };
    sendJSON(res, 200, courseData);
    return;
  }

  if (pathname === '/api/courses' && req.method === 'POST') {
    const user = getAuthUser(req);
    if (!user || user.role !== 'instructor') {
      sendJSON(res, 403, { message: 'Forbidden' });
      return;
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { title, description } = JSON.parse(body);
        const newCourse = {
          id: crypto.randomUUID().slice(0, 8),
          title,
          description,
          instructorId: user.id,
          published: false,
          modules: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        courses[newCourse.id] = newCourse;
        sendJSON(res, 201, newCourse);
      } catch (e) {
        sendJSON(res, 400, { message: 'Invalid JSON' });
      }
    });
    return;
  }

  // ===== PROGRESS ENDPOINTS =====

  if (pathname === '/api/progress' && req.method === 'GET') {
    const user = getAuthUser(req);
    if (!user) {
      sendJSON(res, 401, { message: 'Unauthorized' });
      return;
    }

    const userProgress = progress[user.id] || {};
    const totalCourses = Object.keys(userProgress).length;
    const avgProgress = totalCourses > 0
      ? Math.round(Object.values(userProgress).reduce((sum, p) => sum + p.percentage, 0) / totalCourses)
      : 0;

    sendJSON(res, 200, {
      userId: user.id,
      totalCourses,
      averageProgress: avgProgress,
      courses: userProgress
    });
    return;
  }

  // 404
  sendJSON(res, 404, { message: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Campus Posgrado API Mock running on port ${PORT}/api`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET  /api/auth/me`);
  console.log(`   - GET  /api/courses`);
  console.log(`   - GET  /api/courses/:id`);
  console.log(`   - GET  /api/progress`);
});

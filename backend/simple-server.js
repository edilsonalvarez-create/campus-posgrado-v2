const http = require('http');
const url = require('url');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3001;

// Rate limiting: Map<ip, {count, resetTime}>
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // Max requests per minute

function checkRateLimit(ip) {
  const now = Date.now();
  const limit = rateLimits.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (now > limit.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  limit.count++;
  rateLimits.set(ip, limit);
  return true;
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function isValidPassword(password) {
  return password && password.length >= 8 && password.length <= 128;
}

// Usuarios en memoria
const users = {
  'test@example.com': {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: hashPassword('Password123'),
    role: 'student'
  },
  'instructor@example.com': {
    id: 'instructor-1',
    email: 'instructor@example.com',
    name: 'Instructor Demo',
    passwordHash: hashPassword('Password123'),
    role: 'instructor'
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

// Entregas (submissions)
const submissions = {};

// Calificaciones (grades)
const grades = {};

// Matriculaciones
const enrollments = {
  'c1': {
    'instructor-1': { userId: 'instructor-1', courseId: 'c1', role: 'instructor' },
    '550e8400-e29b-41d4-a716-446655440000': { userId: '550e8400-e29b-41d4-a716-446655440000', courseId: 'c1', role: 'student' }
  },
  'c2': {
    'instructor-1': { userId: 'instructor-1', courseId: 'c2', role: 'instructor' },
    '550e8400-e29b-41d4-a716-446655440000': { userId: '550e8400-e29b-41d4-a716-446655440000', courseId: 'c2', role: 'student' }
  },
  'c3': {
    'instructor-2': { userId: 'instructor-2', courseId: 'c3', role: 'instructor' }
  }
};

// Quiz y respuestas
const quizzes = {
  'q1': {
    id: 'q1',
    resourceId: 'r3',
    courseId: 'c1',
    title: 'Cuestionario 1: Fundamentos de IA',
    questions: [
      {
        id: 'q1-1',
        text: '¿Qué es Machine Learning?',
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Un subcampo de la IA que permite a las máquinas aprender' },
          { id: 'b', text: 'Un lenguaje de programación' },
          { id: 'c', text: 'Una base de datos' },
          { id: 'd', text: 'Un framework web' }
        ],
        correctAnswer: 'a'
      },
      {
        id: 'q1-2',
        text: '¿Cuál es el propósito principal de las redes neuronales?',
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Simular el funcionamiento del cerebro humano' },
          { id: 'b', text: 'Almacenar datos' },
          { id: 'c', text: 'Comprimir imágenes' },
          { id: 'd', text: 'Traducir idiomas' }
        ],
        correctAnswer: 'a'
      }
    ]
  }
};

// Respuestas de quiz de estudiantes
const quizResponses = {};

// Certificados
const certificates = {};

// Notificaciones
const notifications = {};

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
  // Rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  if (!checkRateLimit(clientIp)) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Too many requests. Please try again later.' }));
    return;
  }

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

        // Validations
        if (!isValidEmail(email)) {
          sendJSON(res, 400, { message: 'Email inválido' });
          return;
        }
        if (!isValidPassword(password)) {
          sendJSON(res, 400, { message: 'La contraseña debe tener entre 8 y 128 caracteres' });
          return;
        }
        if (!name || name.length < 2 || name.length > 100) {
          sendJSON(res, 400, { message: 'El nombre debe tener entre 2 y 100 caracteres' });
          return;
        }
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

        // Validations
        if (!isValidEmail(email) || !password) {
          sendJSON(res, 401, { message: 'Credenciales inválidas' });
          return;
        }

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
        enrollments[newCourse.id] = {};
        enrollments[newCourse.id][user.id] = { userId: user.id, courseId: newCourse.id, role: 'instructor' };
        sendJSON(res, 201, newCourse);
      } catch (e) {
        sendJSON(res, 400, { message: 'Invalid JSON' });
      }
    });
    return;
  }

  if (pathname.match(/^\/api\/courses\/[a-zA-Z0-9-]+$/) && req.method === 'PUT') {
    const user = getAuthUser(req);
    if (!user) {
      sendJSON(res, 401, { message: 'Unauthorized' });
      return;
    }
    const courseId = pathname.split('/')[3];
    const course = courses[courseId];
    if (!course || course.instructorId !== user.id) {
      sendJSON(res, 403, { message: 'Forbidden' });
      return;
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const updates = JSON.parse(body);
        Object.assign(course, updates, { updatedAt: new Date().toISOString() });
        sendJSON(res, 200, course);
      } catch (e) {
        sendJSON(res, 400, { message: 'Invalid JSON' });
      }
    });
    return;
  }

  if (pathname.match(/^\/api\/courses\/[a-zA-Z0-9-]+\/analytics$/) && req.method === 'GET') {
    const user = getAuthUser(req);
    if (!user) {
      sendJSON(res, 401, { message: 'Unauthorized' });
      return;
    }
    const courseId = pathname.split('/')[3];
    const course = courses[courseId];
    if (!course || (user.role === 'instructor' && course.instructorId !== user.id)) {
      sendJSON(res, 403, { message: 'Forbidden' });
      return;
    }

    const courseEnrollments = enrollments[courseId] || {};
    const students = Object.values(courseEnrollments).filter(e => e.role === 'student');
    const courseSubmissions = Object.values(submissions).filter(s => s.courseId === courseId);
    const gradedSubmissions = courseSubmissions.filter(s => s.status === 'graded');

    const avgGrade = gradedSubmissions.length > 0
      ? (gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length).toFixed(2)
      : 0;

    const completionRate = students.length > 0
      ? Math.round((students.filter(s => progress[s.userId]?.[courseId]?.percentage === 100).length / students.length) * 100)
      : 0;

    sendJSON(res, 200, {
      courseId,
      totalStudents: students.length,
      totalSubmissions: courseSubmissions.length,
      gradedSubmissions: gradedSubmissions.length,
      pendingSubmissions: courseSubmissions.filter(s => s.status === 'submitted').length,
      averageGrade: parseFloat(avgGrade),
      completionRate,
      students: students.map(s => ({
        id: s.userId,
        name: Object.values(users).find(u => u.id === s.userId)?.name,
        progress: progress[s.userId]?.[courseId]?.percentage || 0,
        submissions: courseSubmissions.filter(sub => sub.studentId === s.userId).length
      }))
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

  // ===== SUBMISSIONS ENDPOINTS =====

  if (pathname === '/api/submissions' && req.method === 'POST') {
    const user = getAuthUser(req);
    if (!user) {
      sendJSON(res, 401, { message: 'Unauthorized' });
      return;
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { resourceId, courseId, content } = JSON.parse(body);
        const submissionId = crypto.randomUUID();
        const submission = {
          id: submissionId,
          resourceId,
          courseId,
          studentId: user.id,
          studentName: user.name,
          content,
          status: 'submitted',
          submittedAt: new Date().toISOString(),
          grade: null,
          feedback: null
        };
        submissions[submissionId] = submission;
        sendJSON(res, 201, submission);
      } catch (e) {
        sendJSON(res, 400, { message: 'Invalid JSON' });
      }
    });
    return;
  }

  if (pathname === '/api/submissions' && req.method === 'GET') {
    const user = getAuthUser(req);
    if (!user) {
      sendJSON(res, 401, { message: 'Unauthorized' });
      return;
    }
    const query = parsedUrl.query;
    const status = query.status;
    const courseId = query.courseId;

    let filtered = Object.values(submissions);
    if (status) filtered = filtered.filter(s => s.status === status);
    if (courseId) filtered = filtered.filter(s => s.courseId === courseId);
    if (user.role === 'student') filtered = filtered.filter(s => s.studentId === user.id);

    sendJSON(res, 200, filtered);
    return;
  }

  if (pathname.match(/^\/api\/submissions\/[a-zA-Z0-9-]+\/grade$/) && req.method === 'PUT') {
    const user = getAuthUser(req);
    if (!user || user.role !== 'instructor') {
      sendJSON(res, 403, { message: 'Forbidden' });
      return;
    }
    const submissionId = pathname.split('/')[3];
    const submission = submissions[submissionId];
    if (!submission) {
      sendJSON(res, 404, { message: 'Submission not found' });
      return;
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { grade, feedback } = JSON.parse(body);
        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = 'graded';
        submission.gradedAt = new Date().toISOString();
        submission.gradedBy = user.id;
        sendJSON(res, 200, submission);
      } catch (e) {
        sendJSON(res, 400, { message: 'Invalid JSON' });
      }
    });
    return;
  }

  if (pathname.match(/^\/api\/courses\/[a-zA-Z0-9-]+\/submissions$/) && req.method === 'GET') {
    const user = getAuthUser(req);
    if (!user) {
      sendJSON(res, 401, { message: 'Unauthorized' });
      return;
    }
    const courseId = pathname.split('/')[3];
    const courseSubmissions = Object.values(submissions).filter(s => s.courseId === courseId);
    if (user.role === 'student') {
      const filtered = courseSubmissions.filter(s => s.studentId === user.id);
      sendJSON(res, 200, filtered);
    } else {
      sendJSON(res, 200, courseSubmissions);
    }
    return;
  }

  // ===== ENROLLMENTS ENDPOINTS =====

  if (pathname === '/api/enrollments' && req.method === 'POST') {
    const user = getAuthUser(req);
    if (!user || user.role !== 'instructor') {
      sendJSON(res, 403, { message: 'Forbidden' });
      return;
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { courseId, studentEmail } = JSON.parse(body);
        const course = courses[courseId];
        if (!course || course.instructorId !== user.id) {
          sendJSON(res, 403, { message: 'Forbidden' });
          return;
        }
        const student = users[studentEmail];
        if (!student) {
          sendJSON(res, 404, { message: 'Student not found' });
          return;
        }
        if (!enrollments[courseId]) enrollments[courseId] = {};
        enrollments[courseId][student.id] = {
          userId: student.id,
          courseId,
          role: 'student'
        };
        if (!progress[student.id]) progress[student.id] = {};
        progress[student.id][courseId] = { courseId, completed: 0, total: 0, percentage: 0 };
        sendJSON(res, 201, enrollments[courseId][student.id]);
      } catch (e) {
        sendJSON(res, 400, { message: 'Invalid JSON' });
      }
    });
    return;
  }

  if (pathname === '/api/enrollments' && req.method === 'GET') {
    const user = getAuthUser(req);
    if (!user) {
      sendJSON(res, 401, { message: 'Unauthorized' });
      return;
    }
    const allEnrollments = [];
    for (const courseId in enrollments) {
      for (const userId in enrollments[courseId]) {
        allEnrollments.push(enrollments[courseId][userId]);
      }
    }
    if (user.role === 'student') {
      const filtered = allEnrollments.filter(e => e.userId === user.id);
      sendJSON(res, 200, filtered);
    } else {
      sendJSON(res, 200, allEnrollments);
    }
    return;
  }

  // ===== QUIZ ENDPOINTS =====

  if (pathname.match(/^\/api\/quizzes\/[a-zA-Z0-9-]+$/) && req.method === 'GET') {
    const user = getAuthUser(req);
    if (!user) {
      sendJSON(res, 401, { message: 'Unauthorized' });
      return;
    }
    const quizId = pathname.split('/')[3];
    const quiz = quizzes[quizId];
    if (!quiz) {
      sendJSON(res, 404, { message: 'Quiz not found' });
      return;
    }
    sendJSON(res, 200, quiz);
    return;
  }

  if (pathname === '/api/quiz-responses' && req.method === 'POST') {
    const user = getAuthUser(req);
    if (!user) {
      sendJSON(res, 401, { message: 'Unauthorized' });
      return;
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { quizId, answers } = JSON.parse(body);
        const quiz = quizzes[quizId];
        if (!quiz) {
          sendJSON(res, 404, { message: 'Quiz not found' });
          return;
        }

        let correctCount = 0;
        for (const answer of answers) {
          const question = quiz.questions.find(q => q.id === answer.questionId);
          if (question && question.correctAnswer === answer.answer) {
            correctCount++;
          }
        }

        const score = Math.round((correctCount / quiz.questions.length) * 100);
        const responseId = crypto.randomUUID();
        const response = {
          id: responseId,
          userId: user.id,
          quizId,
          answers,
          score,
          completedAt: new Date().toISOString()
        };

        quizResponses[responseId] = response;

        // Award certificate if score >= 70
        if (score >= 70 && !certificates[user.id]?.[quiz.courseId]) {
          if (!certificates[user.id]) certificates[user.id] = {};
          certificates[user.id][quiz.courseId] = {
            id: crypto.randomUUID(),
            userId: user.id,
            courseId: quiz.courseId,
            courseName: courses[quiz.courseId].title,
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          };

          // Add notification
          if (!notifications[user.id]) notifications[user.id] = [];
          notifications[user.id].push({
            id: crypto.randomUUID(),
            type: 'certificate',
            title: 'Certificado obtenido',
            message: `Felicitaciones! Completaste el curso "${courses[quiz.courseId].title}" con ${score}%`,
            read: false,
            createdAt: new Date().toISOString()
          });
        }

        sendJSON(res, 201, response);
      } catch (e) {
        sendJSON(res, 400, { message: 'Invalid JSON' });
      }
    });
    return;
  }

  // ===== CERTIFICATES ENDPOINTS =====

  if (pathname === '/api/certificates' && req.method === 'GET') {
    const user = getAuthUser(req);
    if (!user) {
      sendJSON(res, 401, { message: 'Unauthorized' });
      return;
    }
    const userCerts = certificates[user.id] || {};
    sendJSON(res, 200, Object.values(userCerts));
    return;
  }

  // ===== NOTIFICATIONS ENDPOINTS =====

  if (pathname === '/api/notifications' && req.method === 'GET') {
    const user = getAuthUser(req);
    if (!user) {
      sendJSON(res, 401, { message: 'Unauthorized' });
      return;
    }
    const userNotifications = notifications[user.id] || [];
    sendJSON(res, 200, userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    return;
  }

  if (pathname.match(/^\/api\/notifications\/[a-zA-Z0-9-]+\/read$/) && req.method === 'PUT') {
    const user = getAuthUser(req);
    if (!user) {
      sendJSON(res, 401, { message: 'Unauthorized' });
      return;
    }
    const notificationId = pathname.split('/')[3];
    const userNotifications = notifications[user.id] || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    sendJSON(res, 200, { message: 'Notification marked as read' });
    return;
  }

  // 404
  sendJSON(res, 404, { message: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Campus Posgrado API Mock running on port ${PORT}/api`);
  console.log(`   Auth:`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET  /api/auth/me`);
  console.log(`   Courses:`);
  console.log(`   - GET  /api/courses`);
  console.log(`   - GET  /api/courses/:id`);
  console.log(`   - POST /api/courses (instructor)`);
  console.log(`   - PUT  /api/courses/:id (instructor)`);
  console.log(`   - GET  /api/courses/:id/analytics`);
  console.log(`   Progress & Submissions:`);
  console.log(`   - GET  /api/progress`);
  console.log(`   - POST /api/submissions`);
  console.log(`   - GET  /api/submissions`);
  console.log(`   - PUT  /api/submissions/:id/grade (instructor)`);
  console.log(`   - GET  /api/courses/:id/submissions`);
  console.log(`   Enrollments:`);
  console.log(`   - POST /api/enrollments (instructor)`);
  console.log(`   - GET  /api/enrollments`);
  console.log(`   Quiz & Certificates:`);
  console.log(`   - GET  /api/quizzes/:id`);
  console.log(`   - POST /api/quiz-responses`);
  console.log(`   - GET  /api/certificates`);
  console.log(`   Notifications:`);
  console.log(`   - GET  /api/notifications`);
  console.log(`   - PUT  /api/notifications/:id/read`);
});

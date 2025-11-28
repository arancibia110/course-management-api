-- ================================================================
-- REPORTE SQL: USUARIOS CON SUS CURSOS
-- Descripción: Lista todos los usuarios con sus respectivos cursos
--              incluyendo información detallada de ambos
-- ================================================================

-- OPCIÓN 1: Reporte completo con toda la información
SELECT 
    u.id AS user_id,
    u.email AS user_email,
    CONCAT(u.first_name, ' ', u.last_name) AS user_full_name,
    u.role AS user_role,
    u.is_active AS user_active,
    u.last_login AS user_last_login,
    u.created_at AS user_created_at,
    
    c.id AS course_id,
    c.name AS course_name,
    c.description AS course_description,
    c.duration AS course_duration_hours,
    c.instructor AS course_instructor,
    c.start_date AS course_start_date,
    c.end_date AS course_end_date,
    c.max_students AS course_max_students,
    c.current_students AS course_current_students,
    
    uc.status AS enrollment_status,
    uc.progress AS enrollment_progress,
    uc.enrolled_at AS enrollment_date,
    uc.completed_at AS completion_date,
    
    CASE 
        WHEN uc.status = 'COMPLETED' THEN 'Completado'
        WHEN uc.status = 'IN_PROGRESS' THEN 'En Progreso'
        WHEN uc.status = 'ENROLLED' THEN 'Inscrito'
        WHEN uc.status = 'DROPPED' THEN 'Abandonado'
        ELSE 'Sin Curso'
    END AS status_spanish,
    
    CASE 
        WHEN u.role = 'ADMIN' THEN 'Administrador'
        WHEN u.role = 'STUDENT' THEN 'Estudiante'
    END AS role_spanish

FROM users u
LEFT JOIN user_courses uc ON u.id = uc.user_id
LEFT JOIN courses c ON uc.course_id = c.id
WHERE u.deleted_at IS NULL 
  AND (c.deleted_at IS NULL OR c.deleted_at IS NOT NULL)
ORDER BY 
    u.last_name ASC,
    u.first_name ASC,
    c.name ASC;


-- ================================================================
-- OPCIÓN 2: Reporte resumido (más legible)
-- ================================================================
SELECT 
    CONCAT(u.first_name, ' ', u.last_name) AS 'Usuario',
    u.email AS 'Email',
    CASE 
        WHEN u.role = 'ADMIN' THEN 'Administrador'
        WHEN u.role = 'STUDENT' THEN 'Estudiante'
    END AS 'Rol',
    c.name AS 'Curso',
    c.instructor AS 'Instructor',
    c.duration AS 'Duración (hrs)',
    DATE_FORMAT(c.start_date, '%d/%m/%Y') AS 'Fecha Inicio',
    uc.progress AS 'Progreso %',
    CASE 
        WHEN uc.status = 'COMPLETED' THEN 'Completado'
        WHEN uc.status = 'IN_PROGRESS' THEN 'En Progreso'
        WHEN uc.status = 'ENROLLED' THEN 'Inscrito'
        WHEN uc.status = 'DROPPED' THEN 'Abandonado'
        ELSE '-'
    END AS 'Estado'
FROM users u
LEFT JOIN user_courses uc ON u.id = uc.user_id
LEFT JOIN courses c ON uc.course_id = c.id
WHERE u.deleted_at IS NULL
ORDER BY u.last_name, c.name;


-- ================================================================
-- OPCIÓN 3: Solo usuarios con cursos activos
-- ================================================================
SELECT 
    u.id,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    u.role,
    COUNT(DISTINCT c.id) AS total_courses,
    GROUP_CONCAT(c.name SEPARATOR ', ') AS courses_enrolled,
    AVG(uc.progress) AS avg_progress
FROM users u
INNER JOIN user_courses uc ON u.id = uc.user_id
INNER JOIN courses c ON uc.course_id = c.id
WHERE u.deleted_at IS NULL
  AND c.deleted_at IS NULL
  AND uc.status IN ('ENROLLED', 'IN_PROGRESS')
GROUP BY u.id, u.email, u.first_name, u.last_name, u.role
ORDER BY total_courses DESC, u.last_name;


-- ================================================================
-- OPCIÓN 4: Estadísticas por usuario
-- ================================================================
SELECT 
    u.id AS user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    u.email,
    u.role,
    COUNT(uc.id) AS total_enrollments,
    SUM(CASE WHEN uc.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_courses,
    SUM(CASE WHEN uc.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress_courses,
    SUM(CASE WHEN uc.status = 'ENROLLED' THEN 1 ELSE 0 END) AS enrolled_courses,
    ROUND(AVG(uc.progress), 2) AS avg_progress,
    MIN(uc.enrolled_at) AS first_enrollment,
    MAX(uc.enrolled_at) AS last_enrollment
FROM users u
LEFT JOIN user_courses uc ON u.id = uc.user_id
WHERE u.deleted_at IS NULL
  AND u.role = 'STUDENT'
GROUP BY u.id, u.first_name, u.last_name, u.email, u.role
HAVING total_enrollments > 0
ORDER BY completed_courses DESC, avg_progress DESC;


-- ================================================================
-- VISTA: Para consultas frecuentes
-- ================================================================
CREATE OR REPLACE VIEW vw_usuarios_cursos AS
SELECT 
    u.id AS user_id,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    u.role,
    u.is_active AS user_active,
    c.id AS course_id,
    c.name AS course_name,
    c.instructor,
    c.duration,
    c.start_date,
    c.end_date,
    uc.status AS enrollment_status,
    uc.progress,
    uc.enrolled_at,
    uc.completed_at
FROM users u
LEFT JOIN user_courses uc ON u.id = uc.user_id
LEFT JOIN courses c ON uc.course_id = c.id
WHERE u.deleted_at IS NULL
  AND (c.deleted_at IS NULL OR c.id IS NULL);

-- Uso de la vista:
-- SELECT * FROM vw_usuarios_cursos WHERE user_role = 'STUDENT';

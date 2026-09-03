describe('Instructor Flow', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('input[name="email"]').type('instructor@example.com')
    cy.get('input[name="password"]').type('Password123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/')
  })

  it('should show instructor panel button', () => {
    cy.contains('Panel de Instructor').should('be.visible')
  })

  it('should navigate to instructor dashboard', () => {
    cy.contains('Panel de Instructor').click()
    cy.url().should('include', '/instructor')
    cy.contains('Panel de Instructor').should('be.visible')
  })

  it('should display my courses', () => {
    cy.contains('Panel de Instructor').click()
    cy.contains('Mis Cursos').should('be.visible')
  })

  it('should show create course button', () => {
    cy.contains('Panel de Instructor').click()
    cy.contains('+ Crear Curso').should('be.visible')
  })

  it('should open course creation wizard', () => {
    cy.contains('Panel de Instructor').click()
    cy.contains('+ Crear Curso').click()
    cy.contains('Crear Nuevo Curso').should('be.visible')
  })

  it('should create new course', () => {
    cy.contains('Panel de Instructor').click()
    cy.contains('+ Crear Curso').click()
    cy.get('input[placeholder*="Título"]').type('Test Course')
    cy.get('textarea[placeholder*="Describe"]').type('Test course description')
    cy.contains('Siguiente').click()
    cy.contains('Siguiente').click()
    cy.contains('Crear Curso').click()
    cy.contains('Crear Nuevo Curso').should('not.exist')
  })

  it('should view course analytics', () => {
    cy.contains('Panel de Instructor').click()
    cy.get('[class*="grid"]').first().click()
    cy.contains('Estadísticas').click()
    cy.contains('Analytics').should('be.visible')
    cy.contains('Estudiantes').should('be.visible')
  })

  it('should grade submission', () => {
    cy.contains('Panel de Instructor').click()
    cy.get('[class*="grid"]').first().click()
    cy.contains('Entregas').click()
    cy.contains('Calificación').should('be.visible')
    cy.get('input[type="number"]').type('90')
    cy.get('textarea[placeholder*="Retroalimentación"]').type('Great work!')
    cy.contains('Guardar calificación').click()
  })
})

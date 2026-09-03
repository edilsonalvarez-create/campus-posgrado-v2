describe('Student Flow', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('Password123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/')
  })

  it('should display dashboard with courses', () => {
    cy.contains('¡Bienvenido').should('be.visible')
    cy.contains('En Progreso').should('be.visible')
    cy.get('[class*="grid"]').find('[class*="rounded"]').should('have.length.greaterThan', 0)
  })

  it('should show course stats', () => {
    cy.contains('Cursos Activos').should('be.visible')
    cy.contains('Progreso General').should('be.visible')
    cy.contains('Completados').should('be.visible')
  })

  it('should navigate to course detail', () => {
    cy.get('[class*="grid"]').first().within(() => {
      cy.get('a, button, [role="button"]').first().click()
    })
    cy.url().should('include', '/courses/')
    cy.contains('Módulo').should('be.visible')
  })

  it('should submit assignment', () => {
    cy.get('[class*="grid"]').first().within(() => {
      cy.get('a, button, [role="button"]').first().click()
    })
    cy.contains('Entrega').should('be.visible')
    cy.get('textarea').type('My assignment answer')
    cy.contains('button', 'Enviar').click()
    cy.contains('Entrega enviada').should('be.visible')
  })

  it('should view submission history', () => {
    cy.get('[class*="grid"]').first().within(() => {
      cy.get('a, button, [role="button"]').first().click()
    })
    cy.contains('Mis entregas').should('be.visible')
    cy.contains('Pendiente').should('be.visible')
  })
})

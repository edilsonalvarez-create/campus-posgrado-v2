describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should login with valid credentials', () => {
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('Password123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/')
    cy.contains('Campus Posgrado').should('be.visible')
  })

  it('should show error with invalid credentials', () => {
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    cy.contains('Credenciales inválidas').should('be.visible')
  })

  it('should navigate to register page', () => {
    cy.contains('Regístrate aquí').click()
    cy.url().should('include', '/register')
  })

  it('should register new user', () => {
    cy.contains('Regístrate aquí').click()
    cy.get('input[name="name"]').type('New User')
    cy.get('input[name="email"]').type(`newuser${Date.now()}@example.com`)
    cy.get('input[name="password"]').type('Password123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/login')
    cy.contains('Cuenta creada').should('be.visible')
  })

  it('should logout successfully', () => {
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('Password123')
    cy.get('button[type="submit"]').click()
    cy.contains('Cerrar sesión').click()
    cy.url().should('include', '/login')
  })
})

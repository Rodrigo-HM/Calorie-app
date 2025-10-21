describe("Página de autenticación", () => {
  beforeEach(() => {
    cy.visit("/"); // 👈 Ajusta si tu ruta inicial no es "/"
  });

  it("muestra el título de Bienvenido", () => {
    cy.contains("Bienvenido").should("be.visible");
  });

  it("permite alternar entre Login y Registro", () => {
    cy.contains("Registro").click();
    cy.contains("Confirmar contraseña").should("be.visible");

    cy.contains("Login").click();
    cy.contains("Confirmar contraseña").should("not.exist");
  });

  it("habilita y deshabilita el botón según los datos", () => {
    // Caso login
    cy.get('button[type="submit"]').should("not.be.disabled");

    // Borro el email → debería deshabilitarse
    cy.get('input[type="email"]').clear();
    cy.get('button[type="submit"]').should("be.disabled");

    // Relleno de nuevo
    cy.get('input[type="email"]').type("test@example.com");
    cy.get('button[type="submit"]').should("not.be.disabled");

    // Caso registro
    cy.contains("Registro").click();
    cy.get('input[placeholder="••••••••"]').eq(1).type("secret123"); // confirmar contraseña
    cy.get('button[type="submit"]').should("not.be.disabled");
  });

  it("deshabilita el botón si las contraseñas no coinciden en registro", () => {
  cy.contains("Registro").click();

  cy.get('input[type="email"]').clear().type("nuevo@example.com");
  cy.get('input[type="password"]').eq(0).clear().type("password123");
  cy.get('input[type="password"]').eq(1).clear().type("password321");

  cy.get('button[type="submit"]').should("be.disabled");
});

});

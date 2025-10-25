describe('Add Lab Test Form', () => {
  beforeEach(() => {
    cy.intercept('GET', 'http://localhost:8070/patient/', {
      fixture: 'patients.json'
    }).as('getPatients');

    cy.intercept('POST', 'http://localhost:8070/test/add', {
      statusCode: 200,
      body: { message: 'Test Created' }
    }).as('addLabTest');

    cy.visit('http://localhost:3000/laboratory'); // Replace with your actual route
  });

  it('should fill out form and submit successfully', () => {
    // Wait for patient list
    cy.wait('@getPatients');

    // Type in the name
    cy.get('input[placeholder="Name"]').type('John Test');

    // Select a patient
    cy.get('select').select('123456'); // Use the patient ID from your fixture

    // Type in age
    cy.get('input[placeholder="Age"]').type('45');

    // Type in test type
    cy.get('input[placeholder="Lab Test Type"]').type('Blood Test');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Assert alert (mock the alert)
    cy.on('window:alert', (text) => {
      expect(text).to.contains('Test Created');
    });

    // Assert request was made
    cy.wait('@addLabTest').its('request.body').should('include', {
      name: 'John Test',
      age: '45',
      type: 'Blood Test',
    });
  });
});

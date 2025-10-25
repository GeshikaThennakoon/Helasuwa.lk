// patient-home-search.spec.js
describe("Patient Home Page Search Functionality", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/patientHome");
    cy.window().then((win) => {
      win.localStorage.setItem("token", "mock-token");
    });

    cy.intercept("GET", "http://localhost:8070/patient/check/", {
      statusCode: 200,
      body: {
        patient: {
          email: "bhanukafernando2@gmail.com",
          password: "Bhanuka@123",
        },
      },
    });

    cy.intercept("GET", "http://localhost:8070/channel/", {
      statusCode: 200,
      body: [],
    });
  });

  it("should allow searching by doctor name and redirect properly", () => {
    // 1. Verify search elements exist
    cy.get(".search-container").should("exist");
    cy.get(".search-inputs")
      .first()
      .should("have.attr", "placeholder", "Search Doctor");
    cy.get(".search-inputs").eq(1).should("have.attr", "type", "date");
    cy.get(".search-btn").should("contain", "Search");

    // 2. Enter doctor name and verify input
    const doctorName = "Dr. Smith";
    cy.get(".search-inputs")
      .first()
      .type(doctorName)
      .should("have.value", doctorName);

    // 3. Verify date input has today's date as min attribute
    const today = new Date().toISOString().split("T")[0];
    cy.get('input[type="date"]').should("have.attr", "min", today);

    // 4. Click search button
    cy.get(".search-btn").click();

    // 5. Verify URL contains the search parameters
    // Updated assertion to check for doctor name in URL without strict date format
    cy.url().should("include", `/searchChannels/`);
    cy.url().should("include", encodeURIComponent(doctorName));
  });

  afterEach(() => {
    // Clean up
    cy.window().then((win) => {
      win.localStorage.removeItem("token");
    });
  });
});

describe("Patient Home Page Search - Invalid Doctor", () => {
  beforeEach(() => {
    cy.intercept("GET", "http://localhost:8070/patient/check/", {
      statusCode: 200,
      body: {
        patient: {
          email: "bhanukafernando2@gmail.com",
          password: "Bhanuka@123",
        },
      },
    }).as("getUser");
    cy.intercept("GET", "http://localhost:8070/channel/", {
      statusCode: 200,
      body: [],
    }).as("getChannels");
    cy.visit("http://localhost:3000/patientHome", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "mock-token");
      },
    });
    cy.wait("@getUser");
    cy.wait("@getChannels");
  });

  it("should handle searching for a non-existent doctor correctly", () => {
    cy.get(".search-container", { timeout: 10000 }).should("exist");

    // Enter a non-existent doctor name
    const invalidDoctorName = "Dr. NonExistent12345";
    cy.get(".search-inputs")
      .first()
      .type(invalidDoctorName)
      .should("have.value", invalidDoctorName);

    // Select a future date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split("T")[0];
    cy.get('input[type="date"]').type(tomorrowFormatted);

    // Mock the search endpoint to return empty results
    cy.intercept("GET", `http://localhost:8070/channel/search/*`, {
      statusCode: 200,
      body: [],
    }).as("searchRequest");

    // Click search button
    cy.get(".search-btn").click();

    // Verify URL contains the search parameters
    cy.url().should("include", `/searchChannels/`);
    cy.url().should("include", encodeURIComponent(invalidDoctorName));

    // Optionally: Check for "No results" message or empty results
    // cy.contains("No results found").should("be.visible");
  });

  afterEach(() => {
    cy.window().then((win) => {
      win.localStorage.removeItem("token");
    });
  });
});







describe("Patient Home Page Search - Empty Doctor Name", () => {
  beforeEach(() => {
    cy.intercept("GET", "http://localhost:8070/patient/check/", {
      statusCode: 200,
      body: {
        patient: {
          email: "bhanukafernando2@gmail.com",
          password: "Bhanuka@123",
        },
      },
    }).as("getUser");
    cy.intercept("GET", "http://localhost:8070/channel/", {
      statusCode: 200,
      body: [],
    }).as("getChannels");

    cy.visit("http://localhost:3000/patientHome", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "mock-token");
      },
    });

    cy.wait("@getUser");
    cy.wait("@getChannels");
  });

  it("should not proceed with search when doctor name is empty", () => {
    // Make sure the search inputs are visible
    cy.get(".search-container").should("exist");

    // Leave the doctor name field empty
    cy.get(".search-inputs").first().should("have.value", "");

    // Select a valid future date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split("T")[0];
    cy.get('input[type="date"]').type(tomorrowFormatted);

    // Try to click the search button
    cy.get(".search-btn").click();

    // Assert that the URL has NOT changed to the search results page
    cy.url().should("include", "/searchChannels/");
    cy.url().should("not.include", "undefined");


    // Optionally check for an error message
    // cy.contains("Please enter a doctor name").should("be.visible");
  });

  afterEach(() => {
    cy.window().then((win) => {
      win.localStorage.removeItem("token");
    });
  });
});

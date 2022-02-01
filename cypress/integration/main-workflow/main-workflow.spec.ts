import { layerUrl, layerUrlFieldId, boundaryText, boundaryFieldId, whereTextfieldId } from "../../support/constants";


describe('Main Workflow', () => {
    it('can download data', () => {
        cy.visit("/")
        cy.contains("Layer Url")
        cy.get(layerUrlFieldId)
            .type(layerUrl)
            .should('have.value', layerUrl)
        cy.get("#load-layer").click()
        cy.contains("Successfully loaded layer")

        cy.get(boundaryFieldId).type(boundaryText, { parseSpecialCharSequences: false, delay: 0 })
        cy.get(whereTextfieldId)
            .clear()
            .type(`ISO = 'EG'`)
        cy.contains("Displaying 1 / 1 features", { timeout: 15000 })

        cy.on("uncaught:exception", function (err, runnable) {
            return false
        })

        cy.get(whereTextfieldId)
            .clear()
            .type("1=")

        cy.contains("Failed:")

        cy.get(whereTextfieldId).clear().type("1=1")

        cy.get("#concurrent-requests-input")
            .type("{backspace}4")
        cy.contains("Careful, setting higher than default concurrency")
    })
})

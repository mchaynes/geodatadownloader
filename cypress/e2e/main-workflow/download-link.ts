import { layerUrl, layerUrlFieldId, boundaryText, boundaryFieldId, whereTextfieldId, whereClause } from "../../support/constants";

const fields = "FID,COUNTRY,ISO"

describe('Download Link', () => {
    it('fills out fields', () => {
        cy.visit(`/?layer_url=${layerUrl}&where=${whereClause}&boundary=${boundaryText}&fields=${fields}`)
        cy.get(layerUrlFieldId).should('have.value', layerUrl)
        cy.get(whereTextfieldId).should('have.value', whereClause)
        cy.get(boundaryFieldId).should('have.value', boundaryText)
    })
})

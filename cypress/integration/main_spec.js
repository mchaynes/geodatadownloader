/* eslint-disable no-undef */
describe('Main Workflow', () => {
    beforeEach(() => {
        cy.visit("http://localhost:3000/")
    })
    it('can download data', () => {
        const layerUrl = "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/World_Countries_(Generalized)/FeatureServer/0"
        const boundaryText = `{"spatialReference":{"latestWkid":3857,"wkid":102100},"rings":[[[-2201093.8041135576,3412689.3667972824],[-933581.5598892272,4234326.510105794],[769043.690534085,4649686.516135898],[1380693.9852004703,4427921.199166456],[2529067.177556716,4101232.9232614003],[3654198.736000005,3856767.003219833],[4624387.660795018,1693388.9009221364],[4939778.782785241,1310187.3858858775],[6181665.513276974,1565053.5190884937],[6786303.90492676,-2767442.6285996893],[5363942.184682375,-4582451.808516387],[484521.1846853979,-5626481.291291993],[-3641735.917403764,1509420.5001111354],[-2201093.8041135576,3412689.3667972824]]]}`
        cy.contains("Layer Url")
        cy.get("#layer-url")
            .type(layerUrl)
            .should('have.value', layerUrl)
        cy.get("#load-layer").click()
        cy.contains("Successfully loaded layer")

        cy.get("#boundary-text-field").type(boundaryText, { parseSpecialCharSequences: false, delay: 0 })
        cy.get("#where-text-field")
            .clear()
            .type(`ISO = 'EG'`)
        cy.contains("Displaying 1 / 1 features", { timeout: 15000 })

        cy.on("uncaught:exception", function (err, runnable) {
            if (err.details
                && err.details.messages
                && err.details.messages.find(msg => msg === `'where' parameter is invalid`)
            ) {
                return false
            }
            return true
        })

        cy.get("#where-text-field")
            .clear()
            .type("1=")

        cy.contains("Failed:")

        cy.get("#where-text-field").clear().type("1=1")

        cy.get("#concurrent-requests-input")
            .type("{backspace}4")
        cy.contains("Careful, setting higher than default concurrency")
    })
})
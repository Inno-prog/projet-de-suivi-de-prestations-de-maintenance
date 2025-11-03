# PDF Export Fix - Update to iText 7

## Tasks
- [x] Update pom.xml to use iText 7 dependency
- [ ] Rewrite PDFGenerationService.java to use iText 7 API
  - [x] Update imports
- [x] Rewrite genererOrdreCommande method
- [x] Rewrite genererOrdreCommandeFromItems method
  - [ ] Rewrite genererEvaluationTrimestrielle method
  - [ ] Rewrite genererRapportTrimestriel method
  - [ ] Rewrite genererRapportAnnuel method
  - [ ] Rewrite genererOrdreCommandeDetail method
  - [ ] Update helper methods (addCellToTable, etc.)
- [ ] Test compilation

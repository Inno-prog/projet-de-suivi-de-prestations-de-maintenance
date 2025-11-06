package com.dgsi.maintenance.controller;

import java.util.List;
import java.util.Optional;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.service.PrestationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/prestations")
@Slf4j
public class PrestationController {

    private final PrestationService prestationService;

    @Autowired
    public PrestationController(PrestationService prestationService) {
        this.prestationService = prestationService;
    }

    // DTO for prestation creation request
    public static class PrestationCreateRequest {
        private String prestataireId;
        private String nomPrestataire;
        private String nomPrestation;
        private String contactPrestataire;
        private String structurePrestataire;
        private String servicePrestataire;
        private String rolePrestataire;
        private String qualificationPrestataire;
        private java.math.BigDecimal montantIntervention;
        private String equipementsUtilises;
        private List<Long> itemIds;
        private String trimestre;
        private String dateHeureDebut;
        private String dateHeureFin;
        private String observationsPrestataire;
        private String statutIntervention;
        private String nomClient;
        private String contactClient;
        private String adresseClient;
        private String fonctionClient;
        private String observationsClient;

        // Getters and setters
        public String getPrestataireId() { return prestataireId; }
        public void setPrestataireId(String prestataireId) { this.prestataireId = prestataireId; }

        public String getNomPrestataire() { return nomPrestataire; }
        public void setNomPrestataire(String nomPrestataire) { this.nomPrestataire = nomPrestataire; }

        public String getNomPrestation() { return nomPrestation; }
        public void setNomPrestation(String nomPrestation) { this.nomPrestation = nomPrestation; }

        public String getContactPrestataire() { return contactPrestataire; }
        public void setContactPrestataire(String contactPrestataire) { this.contactPrestataire = contactPrestataire; }

        public String getStructurePrestataire() { return structurePrestataire; }
        public void setStructurePrestataire(String structurePrestataire) { this.structurePrestataire = structurePrestataire; }

        public String getServicePrestataire() { return servicePrestataire; }
        public void setServicePrestataire(String servicePrestataire) { this.servicePrestataire = servicePrestataire; }

        public String getRolePrestataire() { return rolePrestataire; }
        public void setRolePrestataire(String rolePrestataire) { this.rolePrestataire = rolePrestataire; }

        public String getQualificationPrestataire() { return qualificationPrestataire; }
        public void setQualificationPrestataire(String qualificationPrestataire) { this.qualificationPrestataire = qualificationPrestataire; }

        public java.math.BigDecimal getMontantIntervention() { return montantIntervention; }
        public void setMontantIntervention(java.math.BigDecimal montantIntervention) { this.montantIntervention = montantIntervention; }

        public String getEquipementsUtilises() { return equipementsUtilises; }
        public void setEquipementsUtilises(String equipementsUtilises) { this.equipementsUtilises = equipementsUtilises; }

        public List<Long> getItemIds() { return itemIds; }
        public void setItemIds(List<Long> itemIds) { this.itemIds = itemIds; }

        public String getTrimestre() { return trimestre; }
        public void setTrimestre(String trimestre) { this.trimestre = trimestre; }

        public String getDateHeureDebut() { return dateHeureDebut; }
        public void setDateHeureDebut(String dateHeureDebut) { this.dateHeureDebut = dateHeureDebut; }

        public String getDateHeureFin() { return dateHeureFin; }
        public void setDateHeureFin(String dateHeureFin) { this.dateHeureFin = dateHeureFin; }

        public String getObservationsPrestataire() { return observationsPrestataire; }
        public void setObservationsPrestataire(String observationsPrestataire) { this.observationsPrestataire = observationsPrestataire; }

        public String getStatutIntervention() { return statutIntervention; }
        public void setStatutIntervention(String statutIntervention) { this.statutIntervention = statutIntervention; }

        public String getNomClient() { return nomClient; }
        public void setNomClient(String nomClient) { this.nomClient = nomClient; }

        public String getContactClient() { return contactClient; }
        public void setContactClient(String contactClient) { this.contactClient = contactClient; }

        public String getAdresseClient() { return adresseClient; }
        public void setAdresseClient(String adresseClient) { this.adresseClient = adresseClient; }

        public String getFonctionClient() { return fonctionClient; }
        public void setFonctionClient(String fonctionClient) { this.fonctionClient = fonctionClient; }

        public String getObservationsClient() { return observationsClient; }
        public void setObservationsClient(String observationsClient) { this.observationsClient = observationsClient; }
    }

    @PostMapping
    public ResponseEntity<?> createPrestation(@Valid @RequestBody PrestationCreateRequest request) {
        log.info("📥 Requête POST pour créer une prestation: {}", request.getNomPrestataire() != null ? request.getNomPrestataire() : "Nouvelle prestation");

        try {
            Prestation createdPrestation = prestationService.createPrestationFromRequest(request);
            log.info("✅ Prestation créée avec succès ID: {}", createdPrestation.getId());

            return ResponseEntity.ok(createdPrestation);

        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Erreur de validation: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                new ErrorResponse("VALIDATION_ERROR", e.getMessage())
            );
        } catch (RuntimeException e) {
            log.error("❌ Erreur technique lors de la création: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("CREATION_ERROR", e.getMessage())
            );
        } catch (Exception e) {
            log.error("❌ Erreur inattendue lors de la création", e);
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("UNEXPECTED_ERROR", "Erreur inattendue lors de la création")
            );
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePrestation(@PathVariable Long id, @Valid @RequestBody Prestation prestationDetails) {
        log.info("📥 Requête PUT pour mettre à jour prestation ID: {}", id);

        try {
            Prestation updatedPrestation = prestationService.updatePrestation(id, prestationDetails);
            return ResponseEntity.ok(updatedPrestation);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("NOT_FOUND", e.getMessage())
            );
        } catch (Exception e) {
            log.error("❌ Erreur lors de la mise à jour de la prestation ID: {}", id, e);
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("UPDATE_ERROR", "Erreur lors de la mise à jour")
            );
        }
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllPrestations() {
        try {
            log.info("📥 GET /api/prestations - Récupération de toutes les prestations");
            List<Prestation> prestations = prestationService.getAllPrestations();
            log.info("✅ {} prestations récupérées avec succès", prestations.size());
            return ResponseEntity.ok(prestations);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des prestations", e);
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("FETCH_ERROR", "Erreur lors de la récupération des prestations")
            );
        }
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getPrestationById(@PathVariable Long id) {
        try {
            Optional<Prestation> prestation = prestationService.getPrestationById(id);
            return prestation.map(ResponseEntity::ok)
                           .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de la prestation ID: {}", id, e);
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("FETCH_ERROR", "Erreur lors de la récupération de la prestation")
            );
        }
    }

    @GetMapping("/count-by-item")
    @Transactional(readOnly = true)
    public ResponseEntity<Long> countByItem(@RequestParam String nomItem) {
        log.info("📊 Comptage des prestations pour l'item: {}", nomItem);

        try {
            Long count = prestationService.countByNomPrestation(nomItem);
            log.info("✅ Nombre de prestations pour '{}': {}", nomItem, count);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("❌ Erreur lors du comptage pour l'item: {}", nomItem, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePrestation(@PathVariable Long id) {
        log.info("📥 Requête DELETE pour prestation ID: {}", id);

        try {
            boolean deleted = prestationService.deletePrestation(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("❌ Erreur lors de la suppression de la prestation ID: {}", id, e);
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("DELETE_ERROR", "Erreur lors de la suppression")
            );
        }
    }

    // Classe pour les réponses d'erreur standardisées
    public static class ErrorResponse {
        private String code;
        private String message;

        public ErrorResponse(String code, String message) {
            this.code = code;
            this.message = message;
        }

        // Getters et setters
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}

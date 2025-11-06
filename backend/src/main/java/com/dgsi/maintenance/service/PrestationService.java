package com.dgsi.maintenance.service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.repository.ItemRepository;
import com.dgsi.maintenance.repository.PrestationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PrestationService {

    private final PrestationRepository prestationRepository;
    private final ItemRepository itemRepository;
    private final OrdreCommandeService ordreCommandeService;
    private final TransactionTemplate transactionTemplate;

    @Autowired
    public PrestationService(PrestationRepository prestationRepository,
                           ItemRepository itemRepository,
                           OrdreCommandeService ordreCommandeService,
                           TransactionTemplate transactionTemplate) {
        this.prestationRepository = prestationRepository;
        this.itemRepository = itemRepository;
        this.ordreCommandeService = ordreCommandeService;
        this.transactionTemplate = transactionTemplate;
    }

    /**
     * Nouvelle méthode pour créer une prestation depuis une requête DTO
     */
    public Prestation createPrestationFromRequest(com.dgsi.maintenance.controller.PrestationController.PrestationCreateRequest request) {
        log.info("🔄 Création prestation depuis requête: {}", request.getNomPrestataire());

        // Convertir la requête en entité Prestation
        Prestation prestation = convertRequestToPrestation(request);

        // Validation avant la transaction
        try {
            validatePrestationData(prestation);
            checkQuantityLimit(prestation);
        } catch (IllegalArgumentException e) {
            log.warn("❌ Validation échouée: {}", e.getMessage());
            throw e;
        }

        // Transaction
        return transactionTemplate.execute(status -> {
            try {
                // Save the prestation first
                Prestation savedPrestation = prestationRepository.save(prestation);
                log.info("💾 Prestation sauvegardée avec ID: {}", savedPrestation.getId());

                // Gestion des items after saving the prestation
                if (request.getItemIds() != null && !request.getItemIds().isEmpty()) {
                    java.util.Set<Item> managedItems = new java.util.HashSet<>();
                    for (Long itemId : request.getItemIds()) {
                        Optional<Item> managedItem = itemRepository.findById(itemId);
                        if (managedItem.isPresent()) {
                            managedItems.add(managedItem.get());
                        } else {
                            throw new IllegalArgumentException("Item avec ID " + itemId + " n'existe pas");
                        }
                    }
                    savedPrestation.setItemsUtilises(managedItems);
                    savedPrestation = prestationRepository.save(savedPrestation);
                    log.info("✅ {} items associés à la prestation", managedItems.size());
                }

                // CORRECTION : Gestion ordre de commande (regroupement par prestataire/trimestre)
                try {
                    log.info("📦 Gestion ordre de commande...");
                    OrdreCommande ordre = ordreCommandeService.gererOrdreCommandePourPrestation(savedPrestation);
                    savedPrestation.setOrdreCommande(ordre);
                    log.info("✅ Ordre de commande géré - ID: {}", ordre.getId());
                } catch (Exception e) {
                    log.warn("⚠️ Gestion ordre de commande échouée, mais prestation sauvegardée. ID: {}", savedPrestation.getId(), e);
                    // Continuer même si l'ordre de commande échoue
                }

                log.info("💾 Sauvegarde finale de la prestation...");
                savedPrestation = prestationRepository.save(savedPrestation);
                log.info("✅ Prestation sauvegardée ID: {}", savedPrestation.getId());

                return savedPrestation;

            } catch (Exception e) {
                log.error("❌ Erreur lors de la sauvegarde transactionnelle", e);
                status.setRollbackOnly();
                throw new RuntimeException("Erreur technique lors de la création: " + e.getMessage(), e);
            }
        });
    }

    /**
     * Convertit une requête DTO en entité Prestation avec gestion des items
     */
    private Prestation convertRequestToPrestation(com.dgsi.maintenance.controller.PrestationController.PrestationCreateRequest request) {
        Prestation prestation = new Prestation();

        // Prestataire information
        prestation.setPrestataireId(request.getPrestataireId());
        prestation.setNomPrestataire(request.getNomPrestataire());
        prestation.setNomPrestation(request.getNomPrestation());
        prestation.setContactPrestataire(request.getContactPrestataire());
        prestation.setStructurePrestataire(request.getStructurePrestataire());
        prestation.setServicePrestataire(request.getServicePrestataire());
        prestation.setRolePrestataire(request.getRolePrestataire());
        prestation.setQualificationPrestataire(request.getQualificationPrestataire());

        // Intervention details
        prestation.setMontantIntervention(request.getMontantIntervention());
        prestation.setEquipementsUtilisesString(request.getEquipementsUtilises());

        // Dates
        if (request.getDateHeureDebut() != null) {
            prestation.setDateHeureDebut(java.time.LocalDateTime.parse(request.getDateHeureDebut()));
        }
        if (request.getDateHeureFin() != null) {
            prestation.setDateHeureFin(java.time.LocalDateTime.parse(request.getDateHeureFin()));
        }

        // Autres champs
        prestation.setTrimestre(request.getTrimestre());
        prestation.setObservationsPrestataire(request.getObservationsPrestataire());
        prestation.setStatutIntervention(request.getStatutIntervention());

        // Client information
        prestation.setNomClient(request.getNomClient());
        prestation.setContactClient(request.getContactClient());
        prestation.setAdresseClient(request.getAdresseClient());
        prestation.setFonctionClient(request.getFonctionClient());
        prestation.setObservationsClient(request.getObservationsClient());

        // Items will be set in the transaction to ensure they are managed
        prestation.setItemsUtilises(new HashSet<>());

        // Valeurs par défaut
        prestation.setNbPrestRealise(0);

        return prestation;
    }

    /**
     * Création robuste avec gestion d'erreur complète
     */
    public Prestation createPrestation(Prestation prestation) {
        log.info("🔄 Début création prestation: {}", prestation.getNomClient() != null ? prestation.getNomClient() : "Nouvelle prestation");

        // Validation avant la transaction
        try {
            validatePrestationData(prestation);
            checkQuantityLimit(prestation);
        } catch (IllegalArgumentException e) {
            log.warn("❌ Validation échouée: {}", e.getMessage());
            throw e; // Relancer pour le controller
        }

        // Transaction
        return transactionTemplate.execute(status -> {
            try {
                // CORRECTION : Gestion ordre de commande (regroupement par prestataire/trimestre)
                try {
                    log.info("📦 Gestion ordre de commande...");
                    OrdreCommande ordre = ordreCommandeService.gererOrdreCommandePourPrestation(prestation);
                    prestation.setOrdreCommande(ordre);
                    log.info("✅ Ordre de commande géré - ID: {}", ordre.getId());
                } catch (Exception e) {
                    log.warn("⚠️ Gestion ordre de commande échouée, mais prestation sauvegardée. ID: {}", prestation.getId(), e);
                    // Continuer même si l'ordre de commande échoue
                }

                log.info("💾 Sauvegarde de la prestation...");
                Prestation savedPrestation = prestationRepository.save(prestation);
                log.info("✅ Prestation sauvegardée ID: {}", savedPrestation.getId());

                return savedPrestation;

            } catch (Exception e) {
                log.error("❌ Erreur lors de la sauvegarde transactionnelle", e);
                status.setRollbackOnly();
                throw new RuntimeException("Erreur technique lors de la création: " + e.getMessage(), e);
            }
        });
    }


    /**
     * Validation robuste des données
     */
    private void validatePrestationData(Prestation prestation) {
        log.info("🔍 Validation des données...");

        if (prestation == null) {
            throw new IllegalArgumentException("La prestation ne peut pas être nulle");
        }

        // Validation prestataire
        if (prestation.getNomPrestataire() == null || prestation.getNomPrestataire().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom du prestataire est obligatoire");
        }
        if (prestation.getContactPrestataire() == null || prestation.getContactPrestataire().trim().isEmpty()) {
            throw new IllegalArgumentException("Le contact du prestataire est obligatoire");
        }
        if (prestation.getStructurePrestataire() == null || prestation.getStructurePrestataire().trim().isEmpty()) {
            throw new IllegalArgumentException("La structure du prestataire est obligatoire");
        }
        if (prestation.getServicePrestataire() == null || prestation.getServicePrestataire().trim().isEmpty()) {
            throw new IllegalArgumentException("Le service du prestataire est obligatoire");
        }
        if (prestation.getRolePrestataire() == null || prestation.getRolePrestataire().trim().isEmpty()) {
            throw new IllegalArgumentException("Le rôle du prestataire est obligatoire");
        }
        if (prestation.getQualificationPrestataire() == null || prestation.getQualificationPrestataire().trim().isEmpty()) {
            throw new IllegalArgumentException("La qualification du prestataire est obligatoire");
        }

        // Validation intervention
        if (prestation.getMontantIntervention() == null || prestation.getMontantIntervention().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le montant de l'intervention doit être positif");
        }
        if (prestation.getTrimestre() == null || prestation.getTrimestre().trim().isEmpty()) {
            throw new IllegalArgumentException("Le trimestre est obligatoire");
        }
        if (prestation.getDateHeureDebut() == null) {
            throw new IllegalArgumentException("La date et heure de début sont obligatoires");
        }
        if (prestation.getDateHeureFin() == null) {
            throw new IllegalArgumentException("La date et heure de fin sont obligatoires");
        }
        if (prestation.getStatutIntervention() == null || prestation.getStatutIntervention().trim().isEmpty()) {
            throw new IllegalArgumentException("Le statut de l'intervention est obligatoire");
        }

        // Validation client
        if (prestation.getNomClient() == null || prestation.getNomClient().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom du client est obligatoire");
        }
        if (prestation.getContactClient() == null || prestation.getContactClient().trim().isEmpty()) {
            throw new IllegalArgumentException("Le contact du client est obligatoire");
        }
        if (prestation.getAdresseClient() == null || prestation.getAdresseClient().trim().isEmpty()) {
            throw new IllegalArgumentException("L'adresse du client est obligatoire");
        }
        if (prestation.getFonctionClient() == null || prestation.getFonctionClient().trim().isEmpty()) {
            throw new IllegalArgumentException("La fonction du client est obligatoire");
        }

        // Vérifier que les items existent si fournis
        if (prestation.getItemsUtilises() != null && !prestation.getItemsUtilises().isEmpty()) {
            for (Item item : prestation.getItemsUtilises()) {
                if (!itemRepository.existsByNomItem(item.getNomItem())) {
                    throw new IllegalArgumentException("L'item '" + item.getNomItem() + "' n'existe pas dans la base de données");
                }
            }
        }

        log.info("✅ Validation des données OK");
    }

    /**
     * Vérification de limite améliorée
     */
    private void checkQuantityLimit(Prestation prestation) {
        // Vérifier les limites pour chaque item sélectionné
        if (prestation.getItemsUtilises() != null && !prestation.getItemsUtilises().isEmpty()) {
            for (Item item : prestation.getItemsUtilises()) {
                String nomItem = item.getNomItem();
                log.info("🔍 Vérification limite pour: {}", nomItem);

                Optional<Item> itemOpt = itemRepository.findFirstByNomItem(nomItem);

                if (itemOpt.isEmpty()) {
                    log.error("❌ Item non trouvé: {}", nomItem);
                    throw new IllegalArgumentException("Item '" + nomItem + "' non trouvé");
                }

                Item itemEntity = itemOpt.get();
                Integer quantiteMax = itemEntity.getQuantiteMaxTrimestre();

                // Pas de limite si quantiteMax est null, 0 ou négatif
                if (quantiteMax == null || quantiteMax <= 0) {
                    log.info("📝 Pas de limite pour {} (quantiteMax: {})", nomItem, quantiteMax);
                    continue;
                }

                // Compter les prestations existantes
                Long count;
                try {
                    count = prestationRepository.countByNomPrestation(nomItem);
                    log.info("📊 Statistiques - Item: {}, Existantes: {}, Max: {}", nomItem, count, quantiteMax);
                } catch (Exception e) {
                    log.error("❌ Erreur lors du comptage pour {}", nomItem, e);
                    throw new RuntimeException("Erreur technique lors de la vérification des limites");
                }

                if (count >= quantiteMax) {
                    String errorMessage = String.format(
                        "Limite atteinte pour '%s' (%d/%d prestations)",
                        nomItem, count, quantiteMax
                    );
                    log.warn("🚫 {}", errorMessage);
                    throw new IllegalArgumentException(errorMessage);
                }

                log.info("✅ Limite OK pour {}: {}/{}", nomItem, count, quantiteMax);
            }
        } else {
            log.info("📝 Aucune vérification de limite (pas d'items sélectionnés)");
        }
    }

    /**
     * Méthode de mise à jour avec gestion transactionnelle
     */
    @Transactional
    public Prestation updatePrestation(Long id, Prestation prestationDetails) {
        log.info("🔄 Mise à jour prestation ID: {}", id);

        return prestationRepository.findById(id)
            .map(prestation -> {
                try {
                    // Validation des données de mise à jour
                    if (prestationDetails.getNomPrestation() != null) {
                        prestation.setNomPrestation(prestationDetails.getNomPrestation());
                    }
                    if (prestationDetails.getNomPrestataire() != null) {
                        prestation.setNomPrestataire(prestationDetails.getNomPrestataire());
                    }
                    if (prestationDetails.getMontantPrest() != null) {
                        prestation.setMontantPrest(prestationDetails.getMontantPrest());
                    }
                    if (prestationDetails.getTrimestre() != null) {
                        prestation.setTrimestre(prestationDetails.getTrimestre());
                    }
                    if (prestationDetails.getDateDebut() != null) {
                        prestation.setDateDebut(prestationDetails.getDateDebut());
                    }
                    if (prestationDetails.getDateFin() != null) {
                        prestation.setDateFin(prestationDetails.getDateFin());
                    }
                    if (prestationDetails.getStatut() != null) {
                        prestation.setStatut(prestationDetails.getStatut());
                    }
                    if (prestationDetails.getDescription() != null) {
                        prestation.setDescription(prestationDetails.getDescription());
                    }

                    Prestation updatedPrestation = prestationRepository.save(prestation);
                    log.info("✅ Prestation mise à jour ID: {}", id);

                    return updatedPrestation;

                } catch (Exception e) {
                    log.error("❌ Erreur lors de la mise à jour de la prestation ID: {}", id, e);
                    throw new RuntimeException("Erreur lors de la mise à jour: " + e.getMessage(), e);
                }
            })
            .orElseThrow(() -> {
                log.warn("⚠️ Prestation non trouvée pour mise à jour ID: {}", id);
                return new IllegalArgumentException("Prestation non trouvée avec ID: " + id);
            });
    }

    /**
     * Méthode de suppression sécurisée
     */
    @Transactional
    public boolean deletePrestation(Long id) {
        log.info("🔄 Suppression prestation ID: {}", id);

        return prestationRepository.findById(id)
            .map(prestation -> {
                try {
                    // Vérifier s'il y a des dépendances
                    if (prestation.getOrdreCommande() != null) {
                        log.warn("⚠️ Prestation ID: {} a un ordre de commande associé", id);
                        // Décider selon votre logique métier :
                        // - Soit supprimer aussi l'ordre de commande
                        // - Soit lever une exception
                        // - Soit simplement dissocier
                        prestation.setOrdreCommande(null);
                    }

                    prestationRepository.delete(prestation);
                    log.info("✅ Prestation supprimée ID: {}", id);
                    return true;

                } catch (Exception e) {
                    log.error("❌ Erreur lors de la suppression de la prestation ID: {}", id, e);
                    throw new RuntimeException("Erreur lors de la suppression: " + e.getMessage(), e);
                }
            })
            .orElse(false);
    }

    /**
     * Récupération avec gestion d'erreur
     */
    @Transactional(readOnly = true)
    public List<Prestation> getAllPrestations() {
        try {
            log.info("Fetching all prestations from database");
            List<Prestation> prestations = prestationRepository.findAll();
            log.info("Found " + prestations.size() + " prestations in database");
            return prestations;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des prestations", e);
            throw new RuntimeException("Erreur lors de la récupération des prestations", e);
        }
    }

    @Transactional(readOnly = true)
    public Optional<Prestation> getPrestationById(Long id) {
        try {
            return prestationRepository.findById(id);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de la prestation ID: {}", id, e);
            throw new RuntimeException("Erreur lors de la récupération de la prestation", e);
        }
    }

    /**
     * Comptage avec gestion d'erreur robuste
     */
    @Transactional(readOnly = true)
    public Long countByNomPrestation(String nomItem) {
        log.info("🔍 Comptage des prestations pour: {}", nomItem);

        try {
            // Vérifier que l'item existe d'abord
            if (!itemRepository.existsByNomItem(nomItem)) {
                log.warn("⚠️ Item non trouvé lors du comptage: {}", nomItem);
                return 0L;
            }

            Long count = prestationRepository.countByNomPrestation(nomItem);
            log.info("✅ Count pour {}: {}", nomItem, count);
            return count;

        } catch (Exception e) {
            log.error("❌ Erreur critique lors du comptage pour: {}", nomItem, e);
            return 0L; // Retourner 0 plutôt que de faire échouer la requête
        }
    }
}

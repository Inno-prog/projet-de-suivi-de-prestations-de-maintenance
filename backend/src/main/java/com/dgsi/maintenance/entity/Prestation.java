package com.dgsi.maintenance.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "prestations")
public class Prestation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Prestataire information
    @Column(name = "prestataire_id")
    private String prestataireId;

    @NotBlank
    @Column(name = "nom_prestataire")
    private String nomPrestataire;

    @Column(name = "contact_prestataire")
    private String contactPrestataire;

    @Column(name = "structure_prestataire")
    private String structurePrestataire;

    @NotBlank
    @Column(name = "service_prestataire")
    private String servicePrestataire;

    @NotBlank
    @Column(name = "role_prestataire")
    private String rolePrestataire;

    @NotBlank
    @Column(name = "qualification_prestataire")
    private String qualificationPrestataire;

    // Intervention details
    @Column(name = "montant_intervention", precision = 10, scale = 2)
    private BigDecimal montantIntervention;

    @Column(name = "equipements_utilises", columnDefinition = "TEXT")
    private String equipementsUtilises;

    @NotNull
    @Column(name = "date_heure_debut")
    private LocalDateTime dateHeureDebut;

    @NotNull
    @Column(name = "date_heure_fin")
    private LocalDateTime dateHeureFin;

    @Column(name = "observations_prestataire", columnDefinition = "TEXT")
    private String observationsPrestataire;

    @NotBlank
    @Column(name = "statut_intervention")
    private String statutIntervention;

    // Client information
    @NotBlank
    @Column(name = "nom_client")
    private String nomClient;

    @NotBlank
    @Column(name = "contact_client")
    private String contactClient;

    @NotBlank
    @Column(name = "adresse_client")
    private String adresseClient;

    @NotBlank
    @Column(name = "fonction_client")
    private String fonctionClient;

    @Column(name = "observations_client", columnDefinition = "TEXT")
    private String observationsClient;

    // Legacy fields for backward compatibility (keeping for existing data)
    @Column(name = "nom_prestation")
    private String nomPrestation;

    @Column(name = "montant_prest", precision = 10, scale = 2)
    private BigDecimal montantPrest;

    @JsonManagedReference
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "prestation_equipement",
        joinColumns = @JoinColumn(name = "prestation_id"),
        inverseJoinColumns = @JoinColumn(name = "equipement_id")
    )
    @JsonIgnore
    private Set<Equipement> equipementsUtilisesLegacy = new HashSet<>();

    @JsonManagedReference
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "prestation_item",
        joinColumns = @JoinColumn(name = "prestation_id"),
        inverseJoinColumns = @JoinColumn(name = "item_id")
    )
    @JsonIgnore
    private Set<Item> itemsUtilises = new HashSet<>();

    @Column(name = "nb_prest_realise")
    private Integer nbPrestRealise;

    @Column(name = "trimestre")
    private String trimestre;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(name = "statut")
    private String statut;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordre_commande_id")
    private OrdreCommande ordreCommande;

    // Constructeurs
    public Prestation() {}

    // Legacy constructor for backward compatibility
    public Prestation(String nomPrestataire, String nomPrestation, BigDecimal montantPrest,
                     Set<Equipement> equipementsUtilises, Set<Item> itemsUtilises, Integer nbPrestRealise, String trimestre,
                     LocalDate dateDebut, LocalDate dateFin, String statut, String description) {
        this.nomPrestataire = nomPrestataire;
        this.nomPrestation = nomPrestation;
        this.montantPrest = montantPrest;
        this.equipementsUtilisesLegacy = equipementsUtilises;
        this.itemsUtilises = itemsUtilises;
        this.nbPrestRealise = nbPrestRealise;
        this.trimestre = trimestre;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.statut = statut;
        this.description = description;
    }

    // New constructor for the enhanced prestation form
    public Prestation(String prestataireId, String nomPrestataire, String contactPrestataire, String structurePrestataire,
                     String servicePrestataire, String rolePrestataire, String qualificationPrestataire,
                     BigDecimal montantIntervention, String equipementsUtilises, Set<Item> itemsCouverts,
                     String trimestre, LocalDateTime dateHeureDebut, LocalDateTime dateHeureFin,
                     String observationsPrestataire, String statutIntervention,
                     String nomClient, String contactClient, String adresseClient, String fonctionClient,
                     String observationsClient) {
        this.prestataireId = prestataireId;
        this.nomPrestataire = nomPrestataire;
        this.contactPrestataire = contactPrestataire;
        this.structurePrestataire = structurePrestataire;
        this.servicePrestataire = servicePrestataire;
        this.rolePrestataire = rolePrestataire;
        this.qualificationPrestataire = qualificationPrestataire;
        this.montantIntervention = montantIntervention;
        this.equipementsUtilises = equipementsUtilises;
        this.itemsUtilises = itemsCouverts != null ? itemsCouverts : new HashSet<>();
        this.trimestre = trimestre;
        this.dateHeureDebut = dateHeureDebut;
        this.dateHeureFin = dateHeureFin;
        this.observationsPrestataire = observationsPrestataire;
        this.statutIntervention = statutIntervention;
        this.nomClient = nomClient;
        this.contactClient = contactClient;
        this.adresseClient = adresseClient;
        this.fonctionClient = fonctionClient;
        this.observationsClient = observationsClient;
        this.nbPrestRealise = 0;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomPrestataire() { return nomPrestataire; }
    public void setNomPrestataire(String nomPrestataire) { this.nomPrestataire = nomPrestataire; }

    public String getNomPrestation() { return nomPrestation; }
    public void setNomPrestation(String nomPrestation) { this.nomPrestation = nomPrestation; }

    public BigDecimal getMontantPrest() { return montantPrest; }
    public void setMontantPrest(BigDecimal montantPrest) { this.montantPrest = montantPrest; }

    // Legacy getter/setter for backward compatibility - Override to prevent JSON issues
    @Override
    @JsonIgnore
    public Set<Equipement> getEquipementsUtilises() { return equipementsUtilisesLegacy; }
    public void setEquipementsUtilises(Set<Equipement> equipementsUtilises) { this.equipementsUtilisesLegacy = equipementsUtilises; }

    public Set<Item> getItemsUtilises() { return itemsUtilises; }
    public void setItemsUtilises(Set<Item> itemsUtilises) { this.itemsUtilises = itemsUtilises; }

    public Integer getNbPrestRealise() { return nbPrestRealise; }
    public void setNbPrestRealise(Integer nbPrestRealise) { this.nbPrestRealise = nbPrestRealise; }

    public String getTrimestre() { return trimestre; }
    public void setTrimestre(String trimestre) { this.trimestre = trimestre; }

    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }

    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public OrdreCommande getOrdreCommande() { return ordreCommande; }
    public void setOrdreCommande(OrdreCommande ordreCommande) { this.ordreCommande = ordreCommande; }

    // New getters and setters for enhanced fields
    public String getPrestataireId() { return prestataireId; }
    public void setPrestataireId(String prestataireId) { this.prestataireId = prestataireId; }

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

    public BigDecimal getMontantIntervention() { return montantIntervention; }
    public void setMontantIntervention(BigDecimal montantIntervention) { this.montantIntervention = montantIntervention; }

    public String getEquipementsUtilisesString() { return equipementsUtilises; }
    public void setEquipementsUtilisesString(String equipementsUtilises) { this.equipementsUtilises = equipementsUtilises; }

    public LocalDateTime getDateHeureDebut() { return dateHeureDebut; }
    public void setDateHeureDebut(LocalDateTime dateHeureDebut) { this.dateHeureDebut = dateHeureDebut; }

    public LocalDateTime getDateHeureFin() { return dateHeureFin; }
    public void setDateHeureFin(LocalDateTime dateHeureFin) { this.dateHeureFin = dateHeureFin; }

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

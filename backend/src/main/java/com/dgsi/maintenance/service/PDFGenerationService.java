package com.dgsi.maintenance.service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import com.dgsi.maintenance.entity.EvaluationTrimestrielle;
import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.entity.TypeItem;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

@Service
public class PDFGenerationService {

    // Color constants for iText 7
    private static final DeviceRgb BLUE = new DeviceRgb(0, 102, 204);
    private static final DeviceRgb WHITE = new DeviceRgb(255, 255, 255);
    private static final DeviceRgb BLACK = new DeviceRgb(0, 0, 0);
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(211, 211, 211);

    public byte[] genererOrdreCommande(List<OrdreCommande> ordres, String trimestre) throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc, com.itextpdf.kernel.geom.PageSize.A4.rotate());

        // Title
        Paragraph title = new Paragraph("ORDRE DE COMMANDE TRIMESTRIEL")
                .setFontSize(16)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(title);

        // Header information
        Paragraph headerInfo = new Paragraph("Trimestre: " + trimestre + " | Date de génération: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .setFontSize(10)
                .setMarginBottom(20);
        document.add(headerInfo);

        // Create order table
        Table orderTable = new Table(UnitValue.createPercentArray(new float[]{0.5f, 3f, 1f, 1f, 1f, 1f, 1.5f, 1f}));
        orderTable.setWidth(UnitValue.createPercentValue(100));

        // Table headers
        addCellToTable(orderTable, "N°", BLUE, WHITE, true);
        addCellToTable(orderTable, "Prestations", BLUE, WHITE, true);
        addCellToTable(orderTable, "Min", BLUE, WHITE, true);
        addCellToTable(orderTable, "Max", BLUE, WHITE, true);
        addCellToTable(orderTable, "PU", BLUE, WHITE, true);
        addCellToTable(orderTable, "OC1", BLUE, WHITE, true);
        addCellToTable(orderTable, "Montant OC1", BLUE, WHITE, true);
        addCellToTable(orderTable, "Ecart", BLUE, WHITE, true);

        // Add order rows
        int rowNum = 1;
        double totalMontant = 0;
        for (OrdreCommande ordre : ordres) {
            DeviceRgb rowColor = rowNum % 2 == 0 ? WHITE : new DeviceRgb(245, 245, 245);
            addCellToTable(orderTable, ordre.getNumeroCommande(), rowColor, BLACK, false);
            addCellToTable(orderTable, ordre.getNomItem(), rowColor, BLACK, false);
            addCellToTable(orderTable, String.valueOf(ordre.getMinArticles()), rowColor, BLACK, false);
            addCellToTable(orderTable, String.valueOf(ordre.getMaxArticles()), rowColor, BLACK, false);
            addCellToTable(orderTable, "-", rowColor, BLACK, false); // PU not available
            addCellToTable(orderTable, String.valueOf(ordre.getNombreArticlesUtilise()), rowColor, BLACK, false);
            addCellToTable(orderTable, String.format("%.2f", ordre.getMontant()), rowColor, BLACK, false);
            addCellToTable(orderTable, String.valueOf(ordre.getEcartArticles()), rowColor, BLACK, false);
            totalMontant += ordre.getMontant();
            rowNum++;
        }

        // Summary row
        addCellToTable(orderTable, "TOTAL GENERAL", LIGHT_GRAY, BLACK, true);
        addCellToTable(orderTable, "", LIGHT_GRAY, BLACK, true);
        addCellToTable(orderTable, "", LIGHT_GRAY, BLACK, true);
        addCellToTable(orderTable, "", LIGHT_GRAY, BLACK, true);
        addCellToTable(orderTable, "", LIGHT_GRAY, BLACK, true);
        addCellToTable(orderTable, "", LIGHT_GRAY, BLACK, true);
        addCellToTable(orderTable, String.format("%.2f", totalMontant), LIGHT_GRAY, BLACK, true);
        addCellToTable(orderTable, "", LIGHT_GRAY, BLACK, true);

        document.add(orderTable);

        // Footer
        Paragraph footer = new Paragraph("Document généré le " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(footer);

        document.close();
        return outputStream.toByteArray();
    }

    public byte[] genererOrdreCommandeFromItems(List<TypeItem> items, String trimestre) throws Exception {
        System.out.println("Starting PDF generation for ordre commande with " + items.size() + " items");
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            System.out.println("Created ByteArrayOutputStream");
            PdfWriter writer = new PdfWriter(outputStream);
            System.out.println("Created PdfWriter");
            PdfDocument pdfDoc = new PdfDocument(writer);
            System.out.println("Created PdfDocument");
            Document document = new Document(pdfDoc, PageSize.A4.rotate());
            System.out.println("PDF document opened");

        // Title
        Paragraph title = new Paragraph("ORDRE DE COMMANDE TRIMESTRIEL")
                .setFontSize(16)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(title);
        System.out.println("Title added");

        // Header information
        Paragraph headerInfo = new Paragraph("Trimestre: " + trimestre + " | Date de génération: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .setFontSize(10)
                .setMarginBottom(20);
        document.add(headerInfo);
        System.out.println("Header info added");

        // Create order table
        Table orderTable = new Table(UnitValue.createPercentArray(new float[]{0.5f, 3f, 1f, 1f, 1f, 1f, 1.5f, 1f}));
        orderTable.setWidth(UnitValue.createPercentValue(100));

        // Table headers
        addCellToTable(orderTable, "N°", BLUE, WHITE, true);
        addCellToTable(orderTable, "Prestations", BLUE, WHITE, true);
        addCellToTable(orderTable, "Min", BLUE, WHITE, true);
        addCellToTable(orderTable, "Max", BLUE, WHITE, true);
        addCellToTable(orderTable, "PU", BLUE, WHITE, true);
        addCellToTable(orderTable, "OC1", BLUE, WHITE, true);
        addCellToTable(orderTable, "Montant OC1", BLUE, WHITE, true);
        addCellToTable(orderTable, "Ecart", BLUE, WHITE, true);

        // Add order rows
        int rowNum = 1;
        double totalMontant = 0;
        System.out.println("Processing " + items.size() + " items for table rows");
        for (TypeItem item : items) {
            System.out.println("Processing item: " + item.getPrestation() + ", OC1: " + item.getOc1Quantity());
            DeviceRgb rowColor = rowNum % 2 == 0 ? WHITE : new DeviceRgb(245, 245, 245);
            addCellToTable(orderTable, item.getNumero(), rowColor, BLACK, false);
            addCellToTable(orderTable, item.getPrestation(), rowColor, BLACK, false);
            addCellToTable(orderTable, String.valueOf(item.getMinArticles()), rowColor, BLACK, false);
            addCellToTable(orderTable, String.valueOf(item.getMaxArticles()), rowColor, BLACK, false);
            addCellToTable(orderTable, String.valueOf(item.getPrixUnitaire()), rowColor, BLACK, false);
            addCellToTable(orderTable, String.valueOf(item.getOc1Quantity()), rowColor, BLACK, false);
            double montant = item.getPrixUnitaire() * item.getOc1Quantity();
            addCellToTable(orderTable, String.format("%.2f", montant), rowColor, BLACK, false);
            int ecart = item.getOc1Quantity() - item.getMaxArticles();
            addCellToTable(orderTable, String.valueOf(ecart), rowColor, BLACK, false);
            totalMontant += montant;
            rowNum++;
        }
        System.out.println("Total montant calculated: " + totalMontant);

        // Summary row
        addCellToTable(orderTable, "TOTAL GENERAL", LIGHT_GRAY, BLACK, true);
        addCellToTable(orderTable, "", LIGHT_GRAY, BLACK, true);
        addCellToTable(orderTable, "", LIGHT_GRAY, BLACK, true);
        addCellToTable(orderTable, "", LIGHT_GRAY, BLACK, true);
        addCellToTable(orderTable, "", LIGHT_GRAY, BLACK, true);
        addCellToTable(orderTable, "", LIGHT_GRAY, BLACK, true);
        addCellToTable(orderTable, String.format("%.2f", totalMontant), LIGHT_GRAY, BLACK, true);
        addCellToTable(orderTable, "", LIGHT_GRAY, BLACK, true);

        document.add(orderTable);
        System.out.println("Table added to document");

        // Footer
        Paragraph footer = new Paragraph("Document généré le " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(footer);
        System.out.println("Footer added");

            document.close();
            System.out.println("Document closed. Final output stream size: " + outputStream.size());
            return outputStream.toByteArray();
        } catch (Exception e) {
            System.err.println("Error in genererOrdreCommandeFromItems: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public byte[] genererEvaluationTrimestrielle(EvaluationTrimestrielle evaluation) throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc, PageSize.A4);

        // Fonts
        PdfFont titleFont = PdfFontFactory.createFont();
        PdfFont headerFont = PdfFontFactory.createFont();
        PdfFont sectionFont = PdfFontFactory.createFont();
        PdfFont normalFont = PdfFontFactory.createFont();
        PdfFont tableHeaderFont = PdfFontFactory.createFont();
        PdfFont smallFont = PdfFontFactory.createFont();

        // Title
        Paragraph title = new Paragraph("RAPPORT DU " + getTrimestreText(evaluation.getTrimestre()) + " DE LA MAINTENANCE")
                .setFontSize(16)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(title);

        // Header information
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 2}));
        headerTable.setWidth(UnitValue.createPercentValue(100));

        addCellToTable(headerTable, "Lot :", LIGHT_GRAY, BLACK, false);
        addCellToTable(headerTable, evaluation.getLot(), WHITE, BLACK, false);

        addCellToTable(headerTable, "Période :", LIGHT_GRAY, BLACK, false);
        addCellToTable(headerTable, getPeriodeText(evaluation.getTrimestre()), WHITE, BLACK, false);

        addCellToTable(headerTable, "Prestataire :", LIGHT_GRAY, BLACK, false);
        addCellToTable(headerTable, evaluation.getPrestataireNom(), WHITE, BLACK, false);

        addCellToTable(headerTable, "Date évaluation :", LIGHT_GRAY, BLACK, false);
        addCellToTable(headerTable, evaluation.getDateEvaluation().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), WHITE, BLACK, false);

        document.add(headerTable);

        // I. INTRODUCTION
        Paragraph introTitle = new Paragraph("I. INTRODUCTION")
                .setFontSize(12)
                .setBold()
                .setFontColor(BLUE)
                .setMarginBottom(10);
        document.add(introTitle);

        Paragraph introText = new Paragraph(
            "Le Ministère de l'Économie et des Finances (MEF) signe annuellement des contrats " +
            "de maintenance informatique avec des prestataires privés. " +
            "Une évaluation trimestrielle est réalisée pour vérifier si les prestations attendues " +
            "sont respectées conformément aux contrats.")
                .setFontSize(10)
                .setMarginBottom(20);
        document.add(introText);

        // II. ALLOTISSEMENT
        Paragraph allotTitle = new Paragraph("II. ALLOTISSEMENT")
                .setFontSize(12)
                .setBold()
                .setFontColor(BLUE)
                .setMarginBottom(10);
        document.add(allotTitle);

        Paragraph allotText = new Paragraph(
            "Lot " + evaluation.getLot().replace("Lot ", "") + " : Maintenance du matériel informatique et support bureautique " +
            "des bâtiments R+5, R+4, R+1 du MEF.\n" +
            "Direction concernée : BCMP")
                .setFontSize(10)
                .setMarginBottom(20);
        document.add(allotText);

        // III. EXIGENCES À SATISFAIRE
        Paragraph exigencesTitle = new Paragraph("III. EXIGENCES À SATISFAIRE")
                .setFontSize(12)
                .setBold()
                .setFontColor(BLUE)
                .setMarginBottom(10);
        document.add(exigencesTitle);

        // Create requirements table
        Table exigencesTable = new Table(UnitValue.createPercentArray(new float[]{0.5f, 3f, 1.5f, 2f}));
        exigencesTable.setWidth(UnitValue.createPercentValue(100));

        // Table headers
        addCellToTable(exigencesTable, "N°", BLUE, WHITE, true);
        addCellToTable(exigencesTable, "Exigences du DAO", BLUE, WHITE, true);
        addCellToTable(exigencesTable, "Prestataire", BLUE, WHITE, true);
        addCellToTable(exigencesTable, "Observations", BLUE, WHITE, true);

        // Add criteria rows
        String[][] criteres = {
            {"1", "Vérification des techniciens avec chef de site certifié ITIL Foundation",
             evaluation.getTechniciensCertifies() != null && evaluation.getTechniciensCertifies() ? "Liste effective fournie" : "Non fournie",
             evaluation.getObsTechniciens() != null ? evaluation.getObsTechniciens() : (evaluation.getTechniciensCertifies() != null && evaluation.getTechniciensCertifies() ? "RAS" : "À fournir")},

            {"2", "Transmission du rapport d'intervention trimestriel",
             evaluation.getRapportInterventionTransmis() != null && evaluation.getRapportInterventionTransmis() ? "Transmis" : "Non transmis",
             evaluation.getObsRapport() != null ? evaluation.getObsRapport() : (evaluation.getRapportInterventionTransmis() != null && evaluation.getRapportInterventionTransmis() ? "RAS" : "A transmettre au plus tard le " + getDeadlineDate(evaluation.getTrimestre()))},

            {"3", "Remplissage quotidien du registre et fiches d'interventions",
             evaluation.getRegistreRempli() != null && evaluation.getRegistreRempli() ? "Effectué" : "Non effectué",
             evaluation.getObsRegistre() != null ? evaluation.getObsRegistre() : (evaluation.getRegistreRempli() != null && evaluation.getRegistreRempli() ? "RAS" : "À régulariser")},

            {"4", "Respect des horaires d'intervention",
             evaluation.getHorairesRespectes() != null && evaluation.getHorairesRespectes() ? "Respectés" : "Non respectés",
             evaluation.getObsHoraires() != null ? evaluation.getObsHoraires() : (evaluation.getHorairesRespectes() != null && evaluation.getHorairesRespectes() ? "RAS" : "Amélioration requise")},

            {"5", "Respect du délai de réaction (4h)",
             evaluation.getDelaiReactionRespecte() != null && evaluation.getDelaiReactionRespecte() ? "Respecté" : "Non respecté",
             evaluation.getObsDelaiReaction() != null ? evaluation.getObsDelaiReaction() : (evaluation.getDelaiReactionRespecte() != null && evaluation.getDelaiReactionRespecte() ? "RAS" : "Délais dépassés constatés")},

            {"6", "Respect du délai d'intervention (24h)",
             evaluation.getDelaiInterventionRespecte() != null && evaluation.getDelaiInterventionRespecte() ? "Respecté" : "Non respecté",
             evaluation.getObsDelaiIntervention() != null ? evaluation.getObsDelaiIntervention() : (evaluation.getDelaiInterventionRespecte() != null && evaluation.getDelaiInterventionRespecte() ? "RAS" : "Interventions tardives")},

            {"7", "Disponibilité du véhicule de service",
             evaluation.getVehiculeDisponible() != null && evaluation.getVehiculeDisponible() ? "Disponible" : "Non disponible",
             evaluation.getObsVehicule() != null ? evaluation.getObsVehicule() : (evaluation.getVehiculeDisponible() != null && evaluation.getVehiculeDisponible() ? "RAS" : "Véhicule indisponible")},

            {"8", "Disponibilité de la tenue réglementaire",
             evaluation.getTenueDisponible() != null && evaluation.getTenueDisponible() ? "Disponible" : "Non disponible",
             evaluation.getObsTenue() != null ? evaluation.getObsTenue() : (evaluation.getTenueDisponible() != null && evaluation.getTenueDisponible() ? "RAS" : "Tenue manquante")}
        };

        for (int i = 0; i < criteres.length; i++) {
            String[] critere = criteres[i];
            DeviceRgb rowColor = i % 2 == 0 ? WHITE : new DeviceRgb(245, 245, 245);
            addCellToTable(exigencesTable, critere[0], rowColor, BLACK, false);
            addCellToTable(exigencesTable, critere[1], rowColor, BLACK, false);
            addCellToTable(exigencesTable, critere[2], rowColor, BLACK, false);
            addCellToTable(exigencesTable, critere[3], rowColor, BLACK, false);
        }

        document.add(exigencesTable);

        // IV. INSTANCES NON RÉSOLUES
        Paragraph instancesTitle = new Paragraph("IV. INSTANCES NON RÉSOLUES")
                .setFontSize(12)
                .setBold()
                .setFontColor(BLUE)
                .setMarginBottom(10);
        document.add(instancesTitle);

        Table instancesTable = new Table(UnitValue.createPercentArray(new float[]{0.5f, 2f, 1.5f, 1f}));

        addCellToTable(instancesTable, "N°", BLUE, WHITE, true);
        addCellToTable(instancesTable, "Instance", BLUE, WHITE, true);
        addCellToTable(instancesTable, "Direction", BLUE, WHITE, true);
        addCellToTable(instancesTable, "Date début", BLUE, WHITE, true);
        addCellToTable(instancesTable, "Jours pénalité", BLUE, WHITE, true);
        addCellToTable(instancesTable, "Observation", BLUE, WHITE, true);

        if (evaluation.getInstancesNonResolues() != null && !evaluation.getInstancesNonResolues().trim().isEmpty()) {
            addCellToTable(instancesTable, "1", WHITE, BLACK, false);
            addCellToTable(instancesTable, evaluation.getInstancesNonResolues(), WHITE, BLACK, false);
            addCellToTable(instancesTable, "BCMP", WHITE, BLACK, false);
            addCellToTable(instancesTable, evaluation.getDateEvaluation().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), WHITE, BLACK, false);
            addCellToTable(instancesTable, evaluation.getPenalitesCalcul() != null ? evaluation.getPenalitesCalcul().toString() : "0", WHITE, BLACK, false);
            addCellToTable(instancesTable, "Instance en cours de résolution", WHITE, BLACK, false);
        } else {
            addCellToTable(instancesTable, "1", WHITE, BLACK, false);
            addCellToTable(instancesTable, "RAS", WHITE, BLACK, false);
            addCellToTable(instancesTable, "-", WHITE, BLACK, false);
            addCellToTable(instancesTable, "-", WHITE, BLACK, false);
            addCellToTable(instancesTable, "-", WHITE, BLACK, false);
            addCellToTable(instancesTable, "-", WHITE, BLACK, false);
        }

        document.add(instancesTable);

        // V. APPRÉCIATIONS
        Paragraph appreciationsTitle = new Paragraph("V. APPRÉCIATIONS")
                .setFontSize(12)
                .setBold()
                .setFontColor(BLUE)
                .setMarginBottom(10);
        document.add(appreciationsTitle);

        if (evaluation.getObservationsGenerales() != null && !evaluation.getObservationsGenerales().trim().isEmpty()) {
            Paragraph obsTitle = new Paragraph("Observations générales :")
                    .setFontSize(14)
                    .setBold();
            document.add(obsTitle);
            Paragraph obsText = new Paragraph(evaluation.getObservationsGenerales())
                    .setFontSize(10)
                    .setMarginBottom(10);
            document.add(obsText);
        }

        if (evaluation.getAppreciationRepresentant() != null && !evaluation.getAppreciationRepresentant().trim().isEmpty()) {
            Paragraph appTitle = new Paragraph("Appréciation du représentant :")
                    .setFontSize(14)
                    .setBold();
            document.add(appTitle);
            Paragraph appText = new Paragraph(evaluation.getAppreciationRepresentant())
                    .setFontSize(10)
                    .setMarginBottom(10);
            document.add(appText);
        }

        // Score and recommendation
        int score = calculerScore(evaluation);
        Paragraph scoreText = new Paragraph("Note finale : " + score + "/8")
                .setFontSize(14)
                .setBold();
        document.add(scoreText);

        Paragraph recoText = new Paragraph("Recommandation : " + getRecommandationText(score))
                .setFontSize(14)
                .setBold()
                .setMarginBottom(20);
        document.add(recoText);

        // Signatures
        Paragraph signaturesTitle = new Paragraph("Signatures :")
                .setFontSize(14)
                .setBold();
        document.add(signaturesTitle);

        Table signaturesTable = new Table(1);
        signaturesTable.setWidth(UnitValue.createPercentValue(60));

        addCellToTable(signaturesTable, "DGSI : " + (evaluation.getEvaluateurNom() != null ? evaluation.getEvaluateurNom() : "Non spécifié"), WHITE, BLACK, false);
        addCellToTable(signaturesTable, "Correspondant Informatique : " + (evaluation.getCorrespondantId() != null ? "Correspondant " + evaluation.getCorrespondantId() : "Non spécifié"), WHITE, BLACK, false);
        addCellToTable(signaturesTable, "Prestataire : " + evaluation.getPrestataireNom(), WHITE, BLACK, false);

        document.add(signaturesTable);

        // Footer
        Paragraph footer = new Paragraph("Document généré le " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(footer);

        document.close();
        return outputStream.toByteArray();
    }

    private void addCellToTable(Table table, String text, DeviceRgb backgroundColor, DeviceRgb textColor, boolean bold) {
        Cell cell = new Cell();
        Paragraph paragraph = new Paragraph(text)
                .setFontColor(textColor)
                .setFontSize(10);
        if (bold) {
            paragraph.setBold();
        }
        cell.add(paragraph);
        cell.setBackgroundColor(backgroundColor);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private String getTrimestreText(String trimestre) {
        if (trimestre == null) return "TRIMESTRE";
        return switch (trimestre) {
            case "T1" -> "PREMIER TRIMESTRE";
            case "T2" -> "DEUXIÈME TRIMESTRE";
            case "T3" -> "TROISIÈME TRIMESTRE";
            case "T4" -> "QUATRIÈME TRIMESTRE";
            default -> trimestre;
        };
    }

    private String getPeriodeText(String trimestre) {
        if (trimestre == null) return "";
        return switch (trimestre) {
            case "T1" -> "01 Janvier – 31 Mars";
            case "T2" -> "01 Avril – 30 Juin";
            case "T3" -> "01 Juillet – 30 Septembre";
            case "T4" -> "01 Octobre – 31 Décembre";
            default -> trimestre;
        };
    }

    private String getDeadlineDate(String trimestre) {
        if (trimestre == null) return "Date à définir";
        return switch (trimestre) {
            case "T1" -> "1er Avril " + LocalDate.now().getYear();
            case "T2" -> "1er Juillet " + LocalDate.now().getYear();
            case "T3" -> "1er Octobre " + LocalDate.now().getYear();
            case "T4" -> "1er Janvier " + (LocalDate.now().getYear() + 1);
            default -> "Date à définir";
        };
    }

    private int calculerScore(EvaluationTrimestrielle evaluation) {
        int score = 0;
        if (Boolean.TRUE.equals(evaluation.getTechniciensCertifies())) score++;
        if (Boolean.TRUE.equals(evaluation.getRapportInterventionTransmis())) score++;
        if (Boolean.TRUE.equals(evaluation.getRegistreRempli())) score++;
        if (Boolean.TRUE.equals(evaluation.getHorairesRespectes())) score++;
        if (Boolean.TRUE.equals(evaluation.getDelaiReactionRespecte())) score++;
        if (Boolean.TRUE.equals(evaluation.getDelaiInterventionRespecte())) score++;
        if (Boolean.TRUE.equals(evaluation.getVehiculeDisponible())) score++;
        if (Boolean.TRUE.equals(evaluation.getTenueDisponible())) score++;
        return score;
    }

    private String getRecommandationText(int score) {
        if (score >= 7) return "MAINTENIR LE PRESTATAIRE";
        if (score >= 5) return "FORMATION REQUISE";
        return "DÉCLASSER LE PRESTATAIRE";
    }

    public byte[] genererRapportTrimestriel(List<EvaluationTrimestrielle> evaluations, String trimestre) throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc, PageSize.A4);

        // Title
        Paragraph title = new Paragraph("RAPPORT TRIMESTRIEL DE SUIVI DE MAINTENANCE")
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(title);

        // Header information
        Paragraph headerInfo = new Paragraph("Trimestre: " + trimestre + " | Date de génération: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .setFontSize(10)
                .setMarginBottom(20);
        document.add(headerInfo);

        // Summary statistics
        Paragraph summaryTitle = new Paragraph("RÉSUMÉ STATISTIQUE")
                .setFontSize(12)
                .setBold()
                .setFontColor(BLUE)
                .setMarginBottom(10);
        document.add(summaryTitle);

        Table summaryTable = new Table(UnitValue.createPercentArray(new float[]{2f, 1f, 1f}));
        summaryTable.setWidth(UnitValue.createPercentValue(100));

        addCellToTable(summaryTable, "Indicateur", BLUE, WHITE, true);
        addCellToTable(summaryTable, "Nombre", BLUE, WHITE, true);
        addCellToTable(summaryTable, "Pourcentage", BLUE, WHITE, true);

        int totalEvaluations = evaluations.size();
        long evaluationsCompletes = evaluations.stream().filter(e -> e.getNoteFinale() != null).count();
        long bonnesEvaluations = evaluations.stream().filter(e -> e.getNoteFinale() != null && e.getNoteFinale().doubleValue() >= 6.0).count();

        addCellToTable(summaryTable, "Évaluations réalisées", WHITE, BLACK, false);
        addCellToTable(summaryTable, String.valueOf(evaluationsCompletes), WHITE, BLACK, false);
        addCellToTable(summaryTable, String.format("%.1f%%", (double) evaluationsCompletes / totalEvaluations * 100), WHITE, BLACK, false);

        addCellToTable(summaryTable, "Évaluations satisfaisantes (≥6/8)", WHITE, BLACK, false);
        addCellToTable(summaryTable, String.valueOf(bonnesEvaluations), WHITE, BLACK, false);
        addCellToTable(summaryTable, String.format("%.1f%%", (double) bonnesEvaluations / totalEvaluations * 100), WHITE, BLACK, false);

        document.add(summaryTable);
        document.add(new Paragraph("\n"));

        // Detailed evaluations table
        Paragraph detailsTitle = new Paragraph("DÉTAIL DES ÉVALUATIONS")
                .setFontSize(12)
                .setBold()
                .setFontColor(BLUE)
                .setMarginBottom(10);
        document.add(detailsTitle);

        Table detailsTable = new Table(UnitValue.createPercentArray(new float[]{1f, 2f, 1f, 1f, 2f}));
        detailsTable.setWidth(UnitValue.createPercentValue(100));

        addCellToTable(detailsTable, "Lot", BLUE, WHITE, true);
        addCellToTable(detailsTable, "Prestataire", BLUE, WHITE, true);
        addCellToTable(detailsTable, "Note", BLUE, WHITE, true);
        addCellToTable(detailsTable, "Recommandation", BLUE, WHITE, true);
        addCellToTable(detailsTable, "Observations", BLUE, WHITE, true);

        for (EvaluationTrimestrielle evaluation : evaluations) {
            DeviceRgb rowColor = evaluations.indexOf(evaluation) % 2 == 0 ? WHITE : new DeviceRgb(245, 245, 245);
            addCellToTable(detailsTable, evaluation.getLot(), rowColor, BLACK, false);
            addCellToTable(detailsTable, evaluation.getPrestataireNom(), rowColor, BLACK, false);
            addCellToTable(detailsTable, evaluation.getNoteFinale() != null ? String.format("%.1f/8", evaluation.getNoteFinale()) : "N/A", rowColor, BLACK, false);
            addCellToTable(detailsTable, evaluation.getNoteFinale() != null ? getRecommandationText(Math.round(evaluation.getNoteFinale().floatValue())) : "N/A", rowColor, BLACK, false);
            String obs = evaluation.getObservationsGenerales();
            if (obs != null && obs.length() > 50) {
                obs = obs.substring(0, 47) + "...";
            }
            addCellToTable(detailsTable, obs != null ? obs : "Aucune", rowColor, BLACK, false);
        }

        document.add(detailsTable);
        document.add(new Paragraph("\n"));

        // Footer
        Paragraph footer = new Paragraph("Rapport généré par le système DGSI Maintenance - " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(footer);

        document.close();
        return outputStream.toByteArray();
    }

    public byte[] genererRapportAnnuel(List<EvaluationTrimestrielle> evaluations, int annee) throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc, PageSize.A4);

        // Title
        Paragraph title = new Paragraph("RAPPORT ANNUEL DE MAINTENANCE INFORMATIQUE " + annee)
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(title);

        // Header information
        Paragraph headerInfo = new Paragraph("Année: " + annee + " | Date de génération: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .setFontSize(10)
                .setMarginBottom(20);
        document.add(headerInfo);

        // Annual statistics by trimestre
        Paragraph statsTitle = new Paragraph("STATISTIQUES ANNUELLES PAR TRIMESTRE")
                .setFontSize(12)
                .setBold()
                .setFontColor(BLUE)
                .setMarginBottom(10);
        document.add(statsTitle);

        Table annualTable = new Table(UnitValue.createPercentArray(new float[]{1f, 1f, 1f, 1f, 1f, 1f}));
        annualTable.setWidth(UnitValue.createPercentValue(100));

        addCellToTable(annualTable, "Trimestre", BLUE, WHITE, true);
        addCellToTable(annualTable, "Évaluations", BLUE, WHITE, true);
        addCellToTable(annualTable, "Note Moyenne", BLUE, WHITE, true);
        addCellToTable(annualTable, "Satisfaisants (≥6)", BLUE, WHITE, true);
        addCellToTable(annualTable, "Taux Satisfaction", BLUE, WHITE, true);
        addCellToTable(annualTable, "Recommandation", BLUE, WHITE, true);

        String[] trimestres = {"T1", "T2", "T3", "T4"};
        for (String trimestre : trimestres) {
            List<EvaluationTrimestrielle> evalTrimestre = evaluations.stream()
                    .filter(e -> trimestre.equals(e.getTrimestre()))
                    .toList();

            long count = evalTrimestre.size();
            double avgNote = evalTrimestre.stream()
                    .filter(e -> e.getNoteFinale() != null)
                    .mapToDouble(e -> e.getNoteFinale().doubleValue())
                    .average()
                    .orElse(0.0);

            long satisfaisants = evalTrimestre.stream()
                    .filter(e -> e.getNoteFinale() != null && e.getNoteFinale().doubleValue() >= 6.0)
                    .count();

            double tauxSatisfaction = count > 0 ? (double) satisfaisants / count * 100 : 0;

            String recommandation = "N/A";
            if (avgNote >= 7.0) recommandation = "EXCELLENT";
            else if (avgNote >= 6.0) recommandation = "BON";
            else if (avgNote >= 5.0) recommandation = "MOYEN";
            else recommandation = "INSATISFAISANT";

            DeviceRgb rowColor = trimestres[0].equals(trimestre) ? WHITE : new DeviceRgb(245, 245, 245);
            addCellToTable(annualTable, trimestre, rowColor, BLACK, false);
            addCellToTable(annualTable, String.valueOf(count), rowColor, BLACK, false);
            addCellToTable(annualTable, String.format("%.1f", avgNote), rowColor, BLACK, false);
            addCellToTable(annualTable, String.valueOf(satisfaisants), rowColor, BLACK, false);
            addCellToTable(annualTable, String.format("%.1f%%", tauxSatisfaction), rowColor, BLACK, false);
            addCellToTable(annualTable, recommandation, rowColor, BLACK, false);
        }

        document.add(annualTable);
        document.add(new Paragraph("\n"));

        // Global statistics
        Paragraph globalTitle = new Paragraph("BILAN ANNUEL GLOBAL")
                .setFontSize(12)
                .setBold()
                .setFontColor(BLUE)
                .setMarginBottom(10);
        document.add(globalTitle);

        double globalAvg = evaluations.stream()
                .filter(e -> e.getNoteFinale() != null)
                .mapToDouble(e -> e.getNoteFinale().doubleValue())
                .average()
                .orElse(0.0);

        long globalSatisfaisants = evaluations.stream()
                .filter(e -> e.getNoteFinale() != null && e.getNoteFinale().doubleValue() >= 6.0)
                .count();

        double globalTaux = evaluations.size() > 0 ? (double) globalSatisfaisants / evaluations.size() * 100 : 0;

        Paragraph bilan = new Paragraph(
            "Note moyenne annuelle: " + String.format("%.1f/8", globalAvg) + "\n" +
            "Taux de satisfaction global: " + String.format("%.1f%%", globalTaux) + "\n" +
            "Nombre total d'évaluations: " + evaluations.size())
                .setFontSize(10)
                .setMarginBottom(20);
        document.add(bilan);

        // Footer
        Paragraph footer = new Paragraph("Rapport annuel généré par le système DGSI Maintenance - " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(footer);

        document.close();
        return outputStream.toByteArray();
    }

    public byte[] genererOrdreCommandeDetail(OrdreCommande ordre) throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc, PageSize.A4);

        // Title
        Paragraph title = new Paragraph("DÉTAILS DE L'ORDRE DE COMMANDE")
                .setFontSize(16)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(title);

        // Header information
        String numeroOc = ordre.getNumeroOc() != null ? ordre.getNumeroOc().toString() : ordre.getIdOC();
        Paragraph headerInfo = new Paragraph("Numéro OC: " + numeroOc + " | Date de génération: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .setFontSize(10)
                .setMarginBottom(20);
        document.add(headerInfo);

        // Informations générales
        Paragraph generalTitle = new Paragraph("I. INFORMATIONS GÉNÉRALES")
                .setFontSize(12)
                .setBold()
                .setFontColor(BLUE)
                .setMarginBottom(10);
        document.add(generalTitle);

        Table generalTable = new Table(new float[]{1, 2});
        generalTable.setWidth(UnitValue.createPercentValue(100));

        addCellToTable(generalTable, "Numéro OC:", LIGHT_GRAY, BLACK, false);
        addCellToTable(generalTable, numeroOc, WHITE, BLACK, false);

        addCellToTable(generalTable, "Item:", LIGHT_GRAY, BLACK, false);
        addCellToTable(generalTable, ordre.getNomItem() != null ? ordre.getNomItem() : "-", WHITE, BLACK, false);

        addCellToTable(generalTable, "Prestataire:", LIGHT_GRAY, BLACK, false);
        addCellToTable(generalTable, ordre.getPrestataireItem() != null ? ordre.getPrestataireItem() : "-", WHITE, BLACK, false);

        addCellToTable(generalTable, "Statut:", LIGHT_GRAY, BLACK, false);
        addCellToTable(generalTable, ordre.getStatut() != null ? ordre.getStatut().toString() : "-", WHITE, BLACK, false);

        addCellToTable(generalTable, "Observations:", LIGHT_GRAY, BLACK, false);
        addCellToTable(generalTable, ordre.getObservations() != null ? ordre.getObservations() : "-", WHITE, BLACK, false);

        document.add(generalTable);
        document.add(new Paragraph("\n"));

        // Calculate values before using them
        int ecartItem = ordre.calculer_ecart_item();
        Float penalite = ordre.calcul_penalite();

        // Quantités & Prix
        Paragraph quantitesTitle = new Paragraph("II. QUANTITÉS & PRIX")
                .setFontSize(12)
                .setBold()
                .setFontColor(BLUE)
                .setMarginBottom(10);
        document.add(quantitesTitle);

        Table quantitesTable = new Table(UnitValue.createPercentArray(new float[]{1, 2}));
        quantitesTable.setWidth(UnitValue.createPercentValue(100));

        addCellToTable(quantitesTable, "Min prestations:", LIGHT_GRAY, BLACK, false);
        addCellToTable(quantitesTable, String.valueOf(ordre.getMin_prestations() != null ? ordre.getMin_prestations() : 0), WHITE, BLACK, false);

        addCellToTable(quantitesTable, "Max prestations:", LIGHT_GRAY, BLACK, false);
        int maxPrestations = ordre.getMax_prestations() != null ? ordre.getMax_prestations() : 0;
        addCellToTable(quantitesTable, String.valueOf(maxPrestations), WHITE, BLACK, false);

        addCellToTable(quantitesTable, "Prestations réalisées:", LIGHT_GRAY, BLACK, false);
        int prestationsRealisees = ordre.getPrestations() != null ? ordre.getPrestations().size() : 0;
        addCellToTable(quantitesTable, String.valueOf(prestationsRealisees), WHITE, BLACK, false);

        addCellToTable(quantitesTable, "Prix unitaire:", LIGHT_GRAY, BLACK, false);
        addCellToTable(quantitesTable, String.format("%.2f FCFA", ordre.getPrixUnitPrest() != null ? ordre.getPrixUnitPrest() : 0.0f), WHITE, BLACK, false);

        addCellToTable(quantitesTable, "Montant total:", LIGHT_GRAY, BLACK, false);
        addCellToTable(quantitesTable, String.format("%.2f FCFA", ordre.getMontant() != null ? ordre.getMontant() : 0.0), WHITE, BLACK, false);

        addCellToTable(quantitesTable, "Écart:", LIGHT_GRAY, BLACK, false);
        addCellToTable(quantitesTable, String.valueOf(ecartItem), WHITE, BLACK, false);

        addCellToTable(quantitesTable, "Pénalités:", LIGHT_GRAY, BLACK, false);
        addCellToTable(quantitesTable, String.format("%.2f FCFA", penalite), WHITE, BLACK, false);

        document.add(quantitesTable);
        document.add(new Paragraph("\n"));

        // Prestations associées
        if (ordre.getPrestations() != null && !ordre.getPrestations().isEmpty()) {
            Paragraph prestationsTitle = new Paragraph("III. PRESTATIONS ASSOCIÉES")
                    .setFontSize(12)
                    .setBold()
                    .setFontColor(BLUE)
                    .setMarginBottom(10);
            document.add(prestationsTitle);

            Table prestationsTable = new Table(UnitValue.createPercentArray(new float[]{0.5f, 2f, 1.5f, 1f, 1f}));
            prestationsTable.setWidth(UnitValue.createPercentValue(100));

            addCellToTable(prestationsTable, "N°", BLUE, WHITE, true);
            addCellToTable(prestationsTable, "Prestation", BLUE, WHITE, true);
            addCellToTable(prestationsTable, "Prestataire", BLUE, WHITE, true);
            addCellToTable(prestationsTable, "Montant", BLUE, WHITE, true);
            addCellToTable(prestationsTable, "Statut", BLUE, WHITE, true);

            int num = 1;
            for (Prestation prestation : ordre.getPrestations()) {
                DeviceRgb rowColor = num % 2 == 0 ? WHITE : new DeviceRgb(245, 245, 245);
                addCellToTable(prestationsTable, String.valueOf(num), rowColor, BLACK, false);
                addCellToTable(prestationsTable, prestation.getNomPrestation() != null ? prestation.getNomPrestation() : "-", rowColor, BLACK, false);
                addCellToTable(prestationsTable, prestation.getNomPrestataire() != null ? prestation.getNomPrestataire() : "-", rowColor, BLACK, false);
                addCellToTable(prestationsTable, String.format("%.2f FCFA", prestation.getMontantPrest() != null ? prestation.getMontantPrest().doubleValue() : 0.0), rowColor, BLACK, false);
                addCellToTable(prestationsTable, prestation.getStatut() != null ? prestation.getStatut() : "-", rowColor, BLACK, false);
                num++;
            }

            document.add(prestationsTable);
            document.add(new Paragraph("\n"));
        }

        // Footer
        Paragraph footer = new Paragraph("Document généré le " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(footer);

        document.close();
        return outputStream.toByteArray();
    }
}
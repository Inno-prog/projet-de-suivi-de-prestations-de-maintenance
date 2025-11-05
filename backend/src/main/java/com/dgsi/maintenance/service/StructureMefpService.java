package com.dgsi.maintenance.service;

import java.util.List;
import java.util.Optional;
import com.dgsi.maintenance.entity.StructureMefp;
import com.dgsi.maintenance.repository.StructureMefpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StructureMefpService {

    @Autowired
    private StructureMefpRepository structureMefpRepository;

    public List<StructureMefp> getAllStructures() {
        return structureMefpRepository.findAll();
    }

    public Optional<StructureMefp> getStructureById(String id) {
        return structureMefpRepository.findById(id);
    }

    public StructureMefp createStructure(StructureMefp structure) {
        return structureMefpRepository.save(structure);
    }

    public Optional<StructureMefp> updateStructure(String id, StructureMefp structureDetails) {
        return structureMefpRepository.findById(id)
            .map(structure -> {
                structure.setNom(structureDetails.getNom());
                structure.setContact(structureDetails.getContact());
                structure.setEmail(structureDetails.getEmail());
                structure.setVille(structureDetails.getVille());
                structure.setDescription(structureDetails.getDescription());
                return structureMefpRepository.save(structure);
            });
    }

    public boolean deleteStructure(String id) {
        return structureMefpRepository.findById(id)
            .map(structure -> {
                structureMefpRepository.delete(structure);
                return true;
            })
            .orElse(false);
    }

}
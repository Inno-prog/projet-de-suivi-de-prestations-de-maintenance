package com.dgsi.maintenance.controller;

import java.util.List;
import java.util.Optional;
import com.dgsi.maintenance.entity.StructureMefp;
import com.dgsi.maintenance.service.StructureMefpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/structures-mefp")
public class StructureMefpController {

    @Autowired
    private StructureMefpService structureMefpService;

    @GetMapping
    public List<StructureMefp> getAllStructures() {
        return structureMefpService.getAllStructures();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StructureMefp> getStructureById(@PathVariable String id) {
        Optional<StructureMefp> structure = structureMefpService.getStructureById(id);
        return structure.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public StructureMefp createStructure(@RequestBody StructureMefp structure) {
        return structureMefpService.createStructure(structure);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StructureMefp> updateStructure(@PathVariable String id, @RequestBody StructureMefp structureDetails) {
        Optional<StructureMefp> updatedStructure = structureMefpService.updateStructure(id, structureDetails);
        return updatedStructure.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStructure(@PathVariable String id) {
        boolean deleted = structureMefpService.deleteStructure(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
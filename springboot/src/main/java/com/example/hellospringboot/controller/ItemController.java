package com.example.hellospringboot.controller;

import com.example.hellospringboot.model.Item;
import com.example.hellospringboot.repository.ItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * items テーブルに対する REST CRUD API
 * JDBC ベースの DB 操作を利用
 */
@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemRepository itemRepository;

    public ItemController(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    /**
     * Create: POST /api/items
     * Body: { "name": "商品名" }
     */
    @PostMapping
    public ResponseEntity<Item> create(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Item created = itemRepository.create(name);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Read (一覧): GET /api/items
     */
    @GetMapping
    public List<Item> list() {
        return itemRepository.findAll();
    }

    /**
     * Read (単一): GET /api/items/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Item> get(@PathVariable Long id) {
        return itemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update: PUT /api/items/{id}
     * Body: { "name": "新しい名前" }
     */
    @PutMapping("/{id}")
    public ResponseEntity<Item> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return itemRepository.update(id, name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete: DELETE /api/items/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return itemRepository.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}

package com.example.springbootorm.controller;

import com.example.springbootorm.model.Item;
import com.example.springbootorm.repository.ItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Item の CRUD を扱うコントローラ
 * JPA の save / findById / findAll / deleteById を使用
 */
@Controller
@RequestMapping("/items")
public class ItemController {

    private final ItemRepository itemRepository;

    public ItemController(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    /**
     * 一覧表示（Thymeleaf）
     */
    @GetMapping
    public String list(Model model, @RequestParam(required = false) String search) {
        List<Item> items = search != null && !search.isBlank()
                ? itemRepository.findByNameContainingIgnoreCase(search)
                : itemRepository.findAll();
        model.addAttribute("items", items);
        model.addAttribute("search", search);  //model・・・コントローラからビュー（テンプレート）へ渡すデータを一時的に保持するRAM領域、props的な
        return "items/list";
    }

    /**
     * 新規作成フォーム表示
     */
    @GetMapping("/new")
    public String newForm() {
        return "items/form";
    }

    /**
     * 新規作成（POST）
     * JPA: repository.save(new Item(name)) で INSERT
     */
    @PostMapping
    public String create(@RequestParam String name) {
        if (name == null || name.isBlank()) {
            return "redirect:/items/new?error=name_required";
        }
        itemRepository.save(new Item(name));
        return "redirect:/items";
    }

    /**
     * 編集フォーム表示
     */
    @GetMapping("/{id}/edit")
    public String editForm(@PathVariable Long id, Model model) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        model.addAttribute("item", item);
        return "items/form";
    }

    /**
     * 更新（PUT）
     * JPA: 既存エンティティを取得 → setName → save で UPDATE
     */
    @PostMapping("/{id}")
    public String update(@PathVariable Long id, @RequestParam String name) {
        if (name == null || name.isBlank()) {
            return "redirect:/items/" + id + "/edit?error=name_required";
        }
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        item.setName(name);
        itemRepository.save(item);
        return "redirect:/items";
    }

    /**
     * 削除
     * JPA: repository.deleteById(id) で DELETE
     */
    @PostMapping("/{id}/delete")
    public String delete(@PathVariable Long id) {
        itemRepository.deleteById(id);
        return "redirect:/items";
    }
}

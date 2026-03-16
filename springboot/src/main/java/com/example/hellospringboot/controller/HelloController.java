package com.example.hellospringboot.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * シンプルなWebコントローラー
 * - / : トップページ（ThymeleafでHTMLを返す）
 * - /api/hello : REST API（JSONを返す、name を DB に保存）
 */
@Controller
public class HelloController {  //永久インスタンスとして状態を保つことはできるけれど、リクエストごとの状態は持たないように設計してある（jdbcTemplate などの共有リソースだけを保持する）（name などはメソッドの引数で受け取る）

    private final JdbcTemplate jdbcTemplate;

    public HelloController(JdbcTemplate jdbcTemplate) {  
        this.jdbcTemplate = jdbcTemplate;   //ここでJdbcTemplateをHelloControllerに注入　　ちなみにNext.js+Vercel環境ではprisma.tsにおいてdb接続インスタンスをRAMにキャッシュすることでシングルトン化している
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("message", "Spring Boot へようこそ！");
        return "index"; // templates/index.htmlを返す　という意味、フロントエンド的な使い方
    }

    @GetMapping("/hello")
    public String hello(@RequestParam(defaultValue = "World") String name, Model model) {
        model.addAttribute("name", name);
        return "hello";
    }

    @GetMapping("/api/hello")  //API 部分は状態を持つ必要がないため一時的なインスタンス
    @ResponseBody
    public Greeting apiHello(@RequestParam(defaultValue = "World") String name) {
        // DB に未登録の場合のみ保存
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM items WHERE name = ?",
                Integer.class,
                name
        );
        if (count != null && count == 0) {
            jdbcTemplate.update("INSERT INTO items (name) VALUES (?)", name);
        }
        return new Greeting("Hello, " + name + "!");  //ここでpublic record Greeting(String message) {}を元にインスタンスが生成される
    }


















    public record Greeting(String message) {}  //リクエスト処理の間だけメモリ上に持つ（データを保持する）ためのクラス
}

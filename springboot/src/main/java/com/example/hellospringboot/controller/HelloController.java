package com.example.hellospringboot.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * シンプルなWebコントローラー
 * - / : トップページ（ThymeleafでHTMLを返す）
 * - /api/hello : REST API（JSONを返す）
 */
@Controller
public class HelloController {

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

    @GetMapping("/api/hello")
    @ResponseBody
    public Greeting apiHello(@RequestParam(defaultValue = "World") String name) {
        return new Greeting("Hello, " + name + "!");  //ここでpublic record Greeting(String message) {}を元にインスタンスが生成される
    }

    public record Greeting(String message) {}  //リクエスト処理の間だけメモリ上に持つ（データを保持する）ためのクラス
}

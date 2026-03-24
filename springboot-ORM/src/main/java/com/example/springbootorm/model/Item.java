package com.example.springbootorm.model;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * JPA Entity: items テーブルにマッピング
 * @Entity で永続化対象、@Table でテーブル名を指定
 * schema.prisma に書く model的な
 */
@Entity  //永久インスタンスにするという意味
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  //id

    @Column(nullable = false, length = 255)
    private String name;  //name

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;  //created_at

    // JPA はリフレクションでインスタンス化するため、引数なしコンストラクタが必須
    protected Item() {  //JPAの中で管理するやつ
    }

    public Item(String name) {
        this.name = name;
        this.createdAt = Instant.now();
    }

    //以下はメソッド定義

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}

package com.example.springbootorm.repository;

import com.example.springbootorm.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Spring Data JPA リポジトリ
 * JpaRepository を継承するだけで、CRUD メソッドが自動で使える
 *
 * 自動提供される主なメソッド:
 * - save(entity)      : 新規作成 or 更新
 * - findById(id)      : ID で検索 (Optional)
 * - findAll()         : 全件取得
 * - deleteById(id)    : 削除
 * - count()           : 件数
 *
 * メソッド名の規則でクエリを自動生成できる（例: findByName, findByNameContaining）
 */
public interface ItemRepository extends JpaRepository<Item, Long> {

    /**
     * 名前で検索（メソッド名から SELECT * FROM items WHERE name = ? が自動生成される）
     */
    List<Item> findByName(String name);

    /**
     * 名前の部分一致検索（LIKE %?% が自動生成される）
     */
    List<Item> findByNameContainingIgnoreCase(String keyword);
}

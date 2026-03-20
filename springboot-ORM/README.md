# Spring Boot + Spring Data JPA 簡易 Web アプリ

Spring Data JPA の基本的な使い方を学ぶためのサンプルアプリです。

## 起動方法

1. PostgreSQL を起動し、`practice-springboot-orm` データベースを作成
2. `./gradlew bootRun` で起動
3. http://localhost:3001/items にアクセス

## JPA のポイント

### 1. Entity（`model/Item.java`）

- `@Entity` … 永続化対象のクラス
- `@Table(name = "items")` … テーブル名
- `@Id` + `@GeneratedValue` … 主キーと自動採番
- `@Column` … カラム名・制約の指定

### 2. Repository（`repository/ItemRepository.java`）

- `JpaRepository<Item, Long>` を継承するだけで CRUD が使える
- メソッド名の規則でクエリを自動生成:
  - `findByName(String)` → `WHERE name = ?`
  - `findByNameContainingIgnoreCase(String)` → `WHERE LOWER(name) LIKE LOWER('%?%')`

### 3. 主なメソッド

| メソッド | 対応 SQL |
|---------|----------|
| `save(entity)` | INSERT / UPDATE |
| `findById(id)` | SELECT ... WHERE id = ? |
| `findAll()` | SELECT * FROM items |
| `deleteById(id)` | DELETE FROM items WHERE id = ? |

## ディレクトリ構成

```
src/main/java/com/example/springbootorm/
├── SpringBootOrmApplication.java
├── model/Item.java          # JPA Entity
├── repository/ItemRepository.java  # JPA Repository
└── controller/
    ├── HomeController.java
    └── ItemController.java
```

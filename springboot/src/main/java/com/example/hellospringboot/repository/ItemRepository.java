package com.example.hellospringboot.repository;

import com.example.hellospringboot.model.Item;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * JDBC ベースの CRUD 操作
 * JdbcTemplate を使った典型的な DB アクセスパターン
 * prismaClient的なファイル
 */
@Repository
public class ItemRepository {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<Item> ROW_MAPPER = (rs, rowNum) -> new Item(
            rs.getLong("id"),
            rs.getString("name"),
            rs.getTimestamp("created_at").toInstant()
    );

    public ItemRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Create: INSERT（PostgreSQL の RETURNING で id を取得）
     */
    public Item create(String name) {
        String sql = "INSERT INTO items (name) VALUES (?) RETURNING id, name, created_at";
        return jdbcTemplate.queryForObject(sql, ROW_MAPPER, name);
    }

    /**
     * Read (単一): SELECT by id
     */
    public Optional<Item> findById(Long id) {
        String sql = "SELECT id, name, created_at FROM items WHERE id = ?";
        List<Item> items = jdbcTemplate.query(sql, ROW_MAPPER, id);
        return items.isEmpty() ? Optional.empty() : Optional.of(items.get(0));
    }

    /**
     * Read (一覧): SELECT all
     */
    public List<Item> findAll() {
        String sql = "SELECT id, name, created_at FROM items ORDER BY id";
        return jdbcTemplate.query(sql, ROW_MAPPER);
    }

    /**
     * Update: UPDATE
     */
    public Optional<Item> update(Long id, String name) {
        String sql = "UPDATE items SET name = ? WHERE id = ?";
        int updated = jdbcTemplate.update(sql, name, id);
        return updated > 0 ? findById(id) : Optional.empty();
    }

    /**
     * Delete: DELETE
     */
    public boolean delete(Long id) {
        String sql = "DELETE FROM items WHERE id = ?";
        int deleted = jdbcTemplate.update(sql, id);
        return deleted > 0;
    }
}

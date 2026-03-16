-- 初期スキーマ（練習用）
CREATE TABLE IF NOT EXISTS items (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_items_name ON items (name);

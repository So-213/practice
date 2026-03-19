package com.example.hellospringboot.model;

import java.time.Instant;

/**
 * items テーブルに対応するモデル
 * prismaがやっていてくれていた部分（型を合わせるためのクラス）
 */
public record Item(Long id, String name, Instant createdAt) {
}

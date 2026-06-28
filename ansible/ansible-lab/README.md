# Ansible 練習環境（ansible-lab）

Mac 上で Docker を使い、Ansible の **inventory・playbook・SSH 接続・冪等性** を練習するための環境です。

## 構成

```
ansible-lab/
├── docker-compose.yml   # 2 台の Ubuntu コンテナを起動
├── Dockerfile.target    # ターゲットサーバー用イメージ
├── inventory.ini        # 管理対象サーバーの定義
├── playbook.yml         # 実行する playbook
└── README.md            # このファイル
```

| コンテナ | SSH 接続先 | 用途 |
|---------|-----------|------|
| target1 | `localhost:2221` | webservers グループ |
| target2 | `localhost:2222` | webservers グループ |

- SSH ユーザー: `ansible`
- SSH パスワード: `ansible`
- sudo: パスワードなしで利用可能

---

## 前提条件

- Mac に **Docker Desktop** がインストールされていること
- Mac に **Ansible** がインストールされていること

Ansible のインストール例（Homebrew）:

```bash
brew install ansible
```

---

## 起動方法

```bash
cd ansible-lab
docker compose up -d --build
```

起動確認:

```bash
docker compose ps
```

`target1` と `target2` が `running` になっていれば OK です。

---

## SSH 確認方法

コンテナに SSH で接続できるか、Mac のターミナルから確認します。

```bash
# target1 へ接続
ssh -p 2221 ansible@127.0.0.1
# パスワード: ansible

# target2 へ接続
ssh -p 2222 ansible@127.0.0.1
# パスワード: ansible
```

接続できたら、以下も試してみてください。

```bash
# sudo がパスワードなしで使えるか確認
sudo whoami
# → root と表示されれば OK

# 接続を終了
exit
```

---

## ansible ping の実行方法

Ansible から各サーバーに到達できるか確認します。`ansible-lab` ディレクトリで実行してください。

```bash
ansible -i inventory.ini webservers -m ping
```

成功すると、次のような出力になります。

```
target1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
target2 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

---

## playbook の実行方法

```bash
ansible-playbook -i inventory.ini playbook.yml
```

実行内容:

1. `curl` と `vim` がインストールされていることを確認（なければインストール）
2. `/tmp/hello-ansible.txt` を作成（内容: `Hello from Ansible. This file is managed by Ansible.`）

実行後、SSH で接続してファイルを確認できます。

```bash
ssh -p 2221 ansible@127.0.0.1 "cat /tmp/hello-ansible.txt"
```

---

## 冪等性（2 回目実行で changed が減る）

**冪等性（べんとうせい）** とは、「同じ操作を何度実行しても、結果が変わらない」性質のことです。Ansible の重要な特徴のひとつです。

同じ playbook を **もう一度** 実行してみてください。

```bash
ansible-playbook -i inventory.ini playbook.yml
```

1 回目と比べると、多くのタスクが `changed` ではなく **`ok`** になります。

| 実行回数 | 典型的な結果 |
|---------|-------------|
| 1 回目 | `curl` / `vim` の確認、`hello-ansible.txt` の作成などで `changed` が出る |
| 2 回目以降 | すでに望んだ状態なので、ほとんどが `ok`（変更なし） |

例:

```
TASK [Ensure curl is installed] ***
ok: [target1]
ok: [target2]

TASK [Create hello-ansible.txt] ***
ok: [target1]
ok: [target2]
```

これが Ansible の冪等性です。設定管理ツールとして「現在の状態を望んだ状態に合わせる」ため、不要な変更は行いません。

---

## 環境の削除方法

コンテナを停止・削除する:

```bash
docker compose down
```

イメージも含めて完全に削除する場合:

```bash
docker compose down --rmi local
```

---

## トラブルシューティング

### `ansible ping` が失敗する

- コンテナが起動しているか確認: `docker compose ps`
- ポートが使用中でないか確認: `lsof -i :2221` / `lsof -i :2222`
- コンテナを再ビルド: `docker compose up -d --build`

### SSH 接続できない

- パスワードは `ansible` です（ユーザー名も `ansible`）
- ポート番号を間違えていないか確認（target1=2221, target2=2222）

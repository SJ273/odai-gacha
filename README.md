"""
お題ガチャ - Flask + Supabase(PostgreSQL) サーバーサイドWebアプリケーション

構成:
    - アプリ本体: Render などの任意のPythonホスティング
    - データベース: Supabase の PostgreSQL

起動方法:
    1. .env ファイルに DATABASE_URL を設定（.env.example 参照）
    2. pip install -r requirements.txt
    3. python app.py
    -> http://127.0.0.1:5000 にアクセス
"""
import os
import random
from datetime import datetime

import psycopg2
import psycopg2.pool
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from flask import Flask, g, jsonify, render_template, request

load_dotenv()  # .env があれば読み込む（本番はホスティング側の環境変数を使用）

app = Flask(__name__)

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "環境変数 DATABASE_URL が設定されていません。"
        ".env ファイル、または実行環境（Renderなど）の環境変数に "
        "SupabaseのPostgres接続文字列を設定してください。"
    )

# アプリ全体で使い回すコネクションプール（リクエストのたびに新規接続しない）
connection_pool = psycopg2.pool.ThreadedConnectionPool(
    minconn=1,
    maxconn=10,
    dsn=DATABASE_URL,
    cursor_factory=RealDictCursor,
)

# ----------------------------------------------------------------------
# カテゴリ定義（サーバー側の唯一の正=ここがマスタ。フロントはここから取得する）
# ----------------------------------------------------------------------
CATEGORIES = [
    {"key": "絵を描く",     "label": "絵を描く",     "emoji": "🎨", "color": "#FF8FA3"},
    {"key": "文章を書く",   "label": "文章を書く",   "emoji": "✍️", "color": "#FFD166"},
    {"key": "ゲームを作る", "label": "ゲームを作る", "emoji": "🎮", "color": "#6EC6FF"},
    {"key": "写真を撮る",   "label": "写真を撮る",   "emoji": "📷", "color": "#B5E48C"},
    {"key": "プログラムを書く", "label": "プログラムを書く", "emoji": "💻", "color": "#C89BFF"},
    {"key": "暇つぶし",     "label": "暇つぶし",     "emoji": "🍬", "color": "#FFB86B"},
]
CATEGORY_KEYS = {c["key"] for c in CATEGORIES}

# 初期投入するお題データ
SEED_PROMPTS = {
    "絵を描く": [
        "青色だけで絵を描く",
        "利き手じゃない手だけで絵を描く",
        "5分以内に動物を描く",
        "自分の好きな食べ物を描く",
        "目を閉じたまま何かを描く",
        "点だけで絵を完成させる",
        "架空の生き物をデザインする",
        "今座っている場所の風景を描く",
    ],
    "文章を書く": [
        "1分で自己紹介文を書く",
        "「もしも○○だったら」で始まる話を書く",
        "今日あった小さな出来事を100文字で書く",
        "架空の映画のあらすじを考える",
        "友達に送る手紙を書く",
        "3行だけの短編小説を書く",
        "自分の1週間後の目標を書く",
    ],
    "ゲームを作る": [
        "架空のゲームタイトルを考える",
        "ルールが1つだけのゲームを考える",
        "紙とペンだけでできるゲームを考える",
        "じゃんけんを改造したゲームを考える",
        "3分で終わるミニゲームを考える",
        "既存のゲームに新しいルールを1つ追加する",
    ],
    "写真を撮る": [
        "身の回りにある赤いものを撮る",
        "影が印象的な写真を撮る",
        "上から見下ろした写真を撮る",
        "自分の手だけを撮る",
        "「静けさ」をテーマに撮る",
        "普段気づかない場所を撮る",
    ],
    "プログラムを書く": [
        "FizzBuzzを書く",
        "簡単なじゃんけんプログラムを作る",
        "今日の日付を表示するプログラムを書く",
        "文字列を逆順にする関数を書く",
        "簡単なToDoリストを作る",
        "ランダムな名言を表示するプログラムを作る",
        "簡単な電卓を作る",
    ],
    "暇つぶし": [
        "部屋の中で一番古いものを探す",
        "好きな音楽を1曲選んで理由を考える",
        "今の気分を天気で例える",
        "3分間だけ目を閉じて過ごす",
        "スマホの中で一番使うアプリを3つ挙げる",
        "今日の自分を一言で表す",
    ],
}


def get_db():
    """リクエストごとにプールから接続を借りる（Flaskのgオブジェクトで使い回す）"""
    if "db" not in g:
        g.db = connection_pool.getconn()
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        if exception:
            db.rollback()
        connection_pool.putconn(db)


def init_db():
    """テーブル作成 + 初期データ投入（初回起動時のみ）"""
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS prompts (
                    id          SERIAL PRIMARY KEY,
                    category    TEXT NOT NULL,
                    text        TEXT NOT NULL,
                    is_custom   BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at  TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS history (
                    id          SERIAL PRIMARY KEY,
                    prompt_id   INTEGER REFERENCES prompts (id),
                    text        TEXT NOT NULL,
                    category    TEXT NOT NULL,
                    drawn_at    TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS favorites (
                    id          SERIAL PRIMARY KEY,
                    prompt_id   INTEGER,
                    text        TEXT NOT NULL,
                    category    TEXT NOT NULL,
                    added_at    TEXT NOT NULL,
                    UNIQUE (text, category)
                );
                """
            )
        conn.commit()

        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) AS c FROM prompts")
            count = cur.fetchone()["c"]

        if count == 0:
            now = datetime.now().isoformat(timespec="seconds")
            rows = [
                (category, text, False, now)
                for category, texts in SEED_PROMPTS.items()
                for text in texts
            ]
            with conn.cursor() as cur:
                cur.executemany(
                    "INSERT INTO prompts (category, text, is_custom, created_at) VALUES (%s, %s, %s, %s)",
                    rows,
                )
            conn.commit()
    finally:
        conn.close()


def category_color(key: str) -> str:
    for c in CATEGORIES:
        if c["key"] == key:
            return c["color"]
    return "#9A96B5"


def fmt(ts: str) -> str:
    """ISO文字列 -> 'MM/DD HH:MM' 表示用フォーマット"""
    try:
        dt = datetime.fromisoformat(ts)
        return dt.strftime("%m/%d %H:%M")
    except ValueError:
        return ts


# ----------------------------------------------------------------------
# ページ
# ----------------------------------------------------------------------
@app.route("/")
def index():
    return render_template("index.html", categories=CATEGORIES)


# ----------------------------------------------------------------------
# API: カテゴリ一覧
# ----------------------------------------------------------------------
@app.route("/api/categories")
def api_categories():
    return jsonify(CATEGORIES)


# ----------------------------------------------------------------------
# API: ガチャを回す
# ----------------------------------------------------------------------
@app.route("/api/gacha", methods=["POST"])
def api_gacha():
    data = request.get_json(silent=True) or {}
    category = data.get("category", "すべて")

    db = get_db()
    with db.cursor() as cur:
        if category == "すべて" or not category:
            cur.execute("SELECT * FROM prompts")
        else:
            if category not in CATEGORY_KEYS:
                return jsonify({"error": "不明なカテゴリです"}), 400
            cur.execute("SELECT * FROM prompts WHERE category = %s", (category,))
        rows = cur.fetchall()

        if not rows:
            return jsonify({"error": "このカテゴリにはまだお題がありません"}), 404

        picked = random.choice(rows)
        now = datetime.now().isoformat(timespec="seconds")

        cur.execute(
            "INSERT INTO history (prompt_id, text, category, drawn_at) VALUES (%s, %s, %s, %s) RETURNING id",
            (picked["id"], picked["text"], picked["category"], now),
        )
        history_id = cur.fetchone()["id"]
    db.commit()

    return jsonify(
        {
            "history_id": history_id,
            "prompt_id": picked["id"],
            "text": picked["text"],
            "category": picked["category"],
            "color": category_color(picked["category"]),
            "drawn_at": now,
            "drawn_at_label": fmt(now),
        }
    )


# ----------------------------------------------------------------------
# API: 履歴
# ----------------------------------------------------------------------
@app.route("/api/history")
def api_history():
    db = get_db()
    with db.cursor() as cur:
        cur.execute("SELECT * FROM history ORDER BY id DESC LIMIT 200")
        rows = cur.fetchall()
    return jsonify(
        [
            {
                "id": r["id"],
                "text": r["text"],
                "category": r["category"],
                "color": category_color(r["category"]),
                "drawn_at": r["drawn_at"],
                "drawn_at_label": fmt(r["drawn_at"]),
            }
            for r in rows
        ]
    )


# ----------------------------------------------------------------------
# API: お気に入り
# ----------------------------------------------------------------------
@app.route("/api/favorites", methods=["GET"])
def api_favorites_list():
    db = get_db()
    with db.cursor() as cur:
        cur.execute("SELECT * FROM favorites ORDER BY id DESC")
        rows = cur.fetchall()
    return jsonify(
        [
            {
                "id": r["id"],
                "text": r["text"],
                "category": r["category"],
                "color": category_color(r["category"]),
                "added_at": r["added_at"],
                "added_at_label": fmt(r["added_at"]),
            }
            for r in rows
        ]
    )


@app.route("/api/favorites", methods=["POST"])
def api_favorites_add():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    category = (data.get("category") or "").strip()
    prompt_id = data.get("prompt_id")

    if not text or category not in CATEGORY_KEYS:
        return jsonify({"error": "お題の情報が不正です"}), 400

    db = get_db()
    now = datetime.now().isoformat(timespec="seconds")
    already = False
    fav_id = None
    try:
        with db.cursor() as cur:
            cur.execute(
                "INSERT INTO favorites (prompt_id, text, category, added_at) VALUES (%s, %s, %s, %s) RETURNING id",
                (prompt_id, text, category, now),
            )
            fav_id = cur.fetchone()["id"]
        db.commit()
    except psycopg2.IntegrityError:
        # 既にお気に入り済み -> トランザクションを戻してから既存IDを取得
        db.rollback()
        already = True
        with db.cursor() as cur:
            cur.execute(
                "SELECT id FROM favorites WHERE text = %s AND category = %s",
                (text, category),
            )
            row = cur.fetchone()
            fav_id = row["id"] if row else None

    return jsonify({"id": fav_id, "already_favorited": already})


@app.route("/api/favorites/<int:fav_id>", methods=["DELETE"])
def api_favorites_delete(fav_id):
    db = get_db()
    with db.cursor() as cur:
        cur.execute("DELETE FROM favorites WHERE id = %s", (fav_id,))
    db.commit()
    return jsonify({"deleted": fav_id})


# ----------------------------------------------------------------------
# API: お題を自分で追加
# ----------------------------------------------------------------------
@app.route("/api/prompts", methods=["POST"])
def api_prompts_add():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    category = (data.get("category") or "").strip()

    if not text:
        return jsonify({"error": "お題を入力してください"}), 400
    if category not in CATEGORY_KEYS:
        return jsonify({"error": "カテゴリを選んでください"}), 400
    if len(text) > 200:
        return jsonify({"error": "お題は200文字以内で入力してください"}), 400

    db = get_db()
    now = datetime.now().isoformat(timespec="seconds")
    with db.cursor() as cur:
        cur.execute(
            "INSERT INTO prompts (category, text, is_custom, created_at) VALUES (%s, %s, TRUE, %s) RETURNING id",
            (category, text, now),
        )
        new_id = cur.fetchone()["id"]
    db.commit()

    return jsonify(
        {
            "id": new_id,
            "text": text,
            "category": category,
            "color": category_color(category),
            "is_custom": True,
        }
    )


@app.route("/api/prompts", methods=["GET"])
def api_prompts_list():
    """カテゴリごとのお題数などを確認したいとき用（管理・デバッグ向け）"""
    db = get_db()
    with db.cursor() as cur:
        cur.execute("SELECT * FROM prompts ORDER BY category, id")
        rows = cur.fetchall()
    return jsonify(
        [
            {
                "id": r["id"],
                "text": r["text"],
                "category": r["category"],
                "is_custom": bool(r["is_custom"]),
            }
            for r in rows
        ]
    )


init_db()

if __name__ == "__main__":
    app.run(debug=True)

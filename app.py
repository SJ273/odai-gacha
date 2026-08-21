import os
from flask import Flask, render_template
from dotenv import load_dotenv
import psycopg2 # データベース接続用（使っているライブラリに合わせてください）

# 環境変数の読み込み
load_dotenv()

# ✅ これが一番重要！これがないと今回のエラーが出ます
app = Flask(__name__)

# ✅ URLは直書きせず、Renderの設定から読み込む
DATABASE_URL = os.environ.get("DATABASE_URL")

# --- データベース接続の関数 ---
def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

# --- ルーティング（画面の表示処理） ---
@app.route("/")
def index():
    # templatesフォルダの中の index.html を表示する
    return render_template("index.html")

# ガチャを引く処理などのルーティングもここに追加
@app.route("/gacha")
def gacha():
    # （ここにお題を取得する処理を書く）
    pass

if __name__ == "__main__":
    app.run()

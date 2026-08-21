# Supabase の Settings > Database > Connection string からコピーして .env にリネームして使ってください
# ローカル開発では「Session pooler」の接続文字列を推奨（IPv4環境でも接続可能なため）
# 例（実際は自分のプロジェクトのものに置き換える）:
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres

import { Pool } from 'pg';

const pool = new Pool({
    user: "default",
    host: "ep-muddy-silence-73034991-pooler.us-east-1.aws.neon.tech",
    database: "reputationdb",
    password: "s4REzjfPZoX6",
    port: 5432,


//     DB_USER="default"
// DB_HOST="ep-muddy-silence-73034991-pooler.us-east-1.aws.neon.tech"
// DB_NAME="reputationdb"
// DB_PASSWORD="s4REzjfPZoX6"
// DB_PORT="5432"
    ssl: {
        rejectUnauthorized: false,
    
    }
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

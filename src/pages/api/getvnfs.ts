import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const result = await query(`
            
                    SELECT 
                        AVG(score) AS avg_isp_score
                    FROM 
                        isp_review
                    Where
                        name = '$1'
                    GROUP BY

                        name
                    `, [req.query.name]);
            const data = result.rows[0];
            console.log(data);
            return res.status(200).json( data );
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
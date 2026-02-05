import { useEffect, useState } from 'react';
import { fetchTrophies } from '../services/trophyService';

const useTrophies = () => {
    const [trophies, setTrophies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTrophies = async () => {
            try {
                const data = await fetchTrophies();
                setTrophies(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadTrophies();
    }, []);

    return { trophies, loading, error };
};

export default useTrophies;
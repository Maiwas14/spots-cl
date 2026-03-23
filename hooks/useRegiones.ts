import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Region } from '@/types';

export function useRegiones() {
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('regiones')
      .select('*')
      .order('orden')
      .then(({ data }) => {
        if (data) setRegiones(data);
        setLoading(false);
      });
  }, []);

  return { regiones, loading };
}

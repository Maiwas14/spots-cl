import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Comuna } from '@/types';

export function useComunas(regionId: number | null) {
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!regionId) {
      setComunas([]);
      return;
    }
    setLoading(true);
    supabase
      .from('comunas')
      .select('*')
      .eq('region_id', regionId)
      .order('nombre')
      .then(({ data, error }) => {
        if (error) {
          console.error('useComunas error:', error);
        } else if (data) {
          setComunas(data);
        }
        setLoading(false);
      });
  }, [regionId]);

  return { comunas, loading };
}

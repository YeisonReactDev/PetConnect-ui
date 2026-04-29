import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ServiceCard from '../components/servicios/ServiceCard';
import ServiceFilter from '../components/servicios/ServiceFilter';
import { Container, Typography, Grid, Skeleton, Box } from '@mui/material';

export default function Servicios() {
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchServicios = async () => {
      setLoading(true);
      let query = supabase
        .from('servicios')
        .select(`
          *,
          prestadores(nombre_comercial, direccion),
          categorias_servicio(nombre)
        `)
        .eq('estado', 'ACTIVO')
        .order('creado_at', { ascending: false });

      if (search) {
        query = query.ilike('nombre', `%${search}%`);
      }
      if (category) {
        query = query.eq('categoria_id', category);
      }

      const { data } = await query;
      if (data) setServicios(data);
      setLoading(false);
    };

    const debounce = setTimeout(() => {
      fetchServicios();
    }, 500);

    return () => clearTimeout(debounce);
  }, [search, category]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Explorar Servicios
      </Typography>

      <ServiceFilter 
        search={search} 
        setSearch={setSearch} 
        category={category} 
        setCategory={setCategory} 
      />

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Box sx={{ height: 250 }}>
                <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                <Skeleton variant="text" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="60%" />
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {servicios.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No se encontraron servicios que coincidan con tu búsqueda.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {servicios.map((s) => (
                <Grid item xs={12} sm={6} md={4} key={s.id}>
                  <ServiceCard service={s} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
}
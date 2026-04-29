import React, { useEffect, useState } from 'react';
import { TextField, Select, MenuItem, FormControl, InputLabel, Box, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { supabase } from '../../lib/supabaseClient';

export default function ServiceFilter({ 
  search, 
  setSearch, 
  category, 
  setCategory 
}: { 
  search: string, 
  setSearch: (s: string) => void, 
  category: string, 
  setCategory: (c: string) => void 
}) {
  const [categories, setCategories] = useState<{id: number, nombre: string}[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categorias_servicio').select('id, nombre');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
      <TextField
        label="Buscar servicio"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <FormControl sx={{ flex: { xs: '1 1 100%', sm: '0 0 250px' } }}>
        <InputLabel id="category-filter-label">Categoría</InputLabel>
        <Select
          labelId="category-filter-label"
          value={category}
          label="Categoría"
          onChange={(e) => setCategory(e.target.value)}
        >
          <MenuItem value="">Todas las categorías</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id.toString()}>{c.nombre}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
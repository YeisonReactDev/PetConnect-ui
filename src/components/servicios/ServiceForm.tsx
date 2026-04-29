import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthProvider';
import { TextField, Button, Box, MenuItem, Select, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';

export default function ServiceForm({ existing, onSuccess }: { existing?: any, onSuccess?: () => void }) {
  const { user } = useAuth();
  const [nombre, setNombre] = useState(existing?.nombre || '');
  const [descripcion, setDescripcion] = useState(existing?.descripcion || '');
  const [precio, setPrecio] = useState(existing?.precio || '');
  const [duracion_minutos, setDuracionMinutos] = useState(existing?.duracion_minutos || '');
  const [categoria_id, setCategoriaId] = useState(existing?.categoria_id || '');
  
  const [categories, setCategories] = useState<{id: number, nombre: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categorias_servicio').select('id, nombre');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    
    try {
      const { data: prestador } = await supabase.from('prestadores').select('id').eq('usuario_id', user.id).maybeSingle();
      if (!prestador) throw new Error("Debes completar tu perfil de prestador antes de gestionar servicios.");

      const payload = {
        prestador_id: prestador.id,
        nombre,
        descripcion,
        precio: parseFloat(String(precio)),
        duracion_minutos: parseInt(String(duracion_minutos)),
        categoria_id: parseInt(String(categoria_id)),
        estado: 'ACTIVO'
      };

      if (existing) {
        const { error: updErr } = await supabase.from('servicios').update(payload).eq('id', existing.id);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase.from('servicios').insert([payload]);
        if (insErr) throw insErr;
      }
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar el servicio.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      
      <TextField
        label="Nombre del Servicio"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
        fullWidth
      />
      
      <TextField
        label="Descripción"
        multiline
        rows={3}
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        required
        fullWidth
      />

      <FormControl fullWidth required>
        <InputLabel id="categoria-label">Categoría</InputLabel>
        <Select
          labelId="categoria-label"
          value={categoria_id}
          label="Categoría"
          onChange={(e) => setCategoriaId(e.target.value)}
        >
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Precio ($)"
          type="number"
          inputProps={{ step: "0.01", min: "0" }}
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Duración (minutos)"
          type="number"
          inputProps={{ step: "1", min: "1" }}
          value={duracion_minutos}
          onChange={(e) => setDuracionMinutos(e.target.value)}
          required
          fullWidth
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        disabled={loading}
        startIcon={loading && <CircularProgress size={20} color="inherit" />}
        sx={{ mt: 2 }}
      >
        {loading ? 'Guardando...' : 'Guardar Servicio'}
      </Button>
    </Box>
  );
}
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthProvider';
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function CaninoForm({ existing, onSuccess }: { existing?: any, onSuccess?: () => void }) {
  const { user } = useAuth();
  const [nombre, setNombre] = useState(existing?.nombre || '');
  const [raza, setRaza] = useState(existing?.raza || '');
  const [edad, setEdad] = useState(existing?.edad || '');
  const [peso, setPeso] = useState(existing?.peso || '');
  const [sexo, setSexo] = useState(existing?.sexo || 'MACHO');
  const [observaciones, setObservaciones] = useState(existing?.observaciones || '');
  const [foto, setFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFoto = async (file: File, caninoId: string) => {
    const filePath = `caninos/${caninoId}/${file.name}`;
    const { error } = await supabase.storage.from('caninos').upload(filePath, file);
    if (error) throw error;
    const publicUrl = supabase.storage.from('caninos').getPublicUrl(filePath).data.publicUrl;
    return publicUrl;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    
    try {
      // Use maybeSingle() — returns null (not an error) when no propietario row exists yet.
      const { data: propData } = await supabase.from('propietarios').select('id').eq('usuario_id', user.id).maybeSingle();

      if (!propData) {
        setError('Debes completar tu perfil antes de agregar mascotas.');
        setLoading(false);
        return;
      }

      const propietario_id = propData.id;

      const payload: any = { 
        nombre, 
        raza, 
        edad: parseInt(String(edad || 0)), 
        peso: parseFloat(String(peso || 0)), 
        sexo,
        observaciones,
        propietario_id 
      };

      if (existing) {
        await supabase.from('caninos').update(payload).eq('id', existing.id);
        const caninoId = existing.id;
        if (foto) {
          const url = await uploadFoto(foto, caninoId);
          await supabase.from('caninos').update({ foto_url: url }).eq('id', caninoId);
        }
      } else {
        const res = await supabase.from('caninos').insert([payload]).select().single();
        const caninoId = res.data?.id;
        if (foto && caninoId) {
          const url = await uploadFoto(foto, caninoId);
          await supabase.from('caninos').update({ foto_url: url }).eq('id', caninoId);
        }
      }
      
      if (onSuccess) onSuccess();
      
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar la mascota.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
        fullWidth
      />
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Raza"
          value={raza}
          onChange={(e) => setRaza(e.target.value)}
          fullWidth
        />
        
        <FormControl fullWidth required>
          <InputLabel id="sexo-label">Sexo</InputLabel>
          <Select
            labelId="sexo-label"
            value={sexo}
            label="Sexo"
            onChange={(e) => setSexo(e.target.value)}
          >
            <MenuItem value="MACHO">Macho</MenuItem>
            <MenuItem value="HEMBRA">Hembra</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Edad (años)"
          type="number"
          value={edad}
          onChange={(e) => setEdad(e.target.value)}
          fullWidth
        />
        <TextField
          label="Peso (kg)"
          type="number"
          inputProps={{ step: "0.1" }}
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          fullWidth
        />
      </Box>

      <TextField
        label="Observaciones"
        multiline
        rows={3}
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        fullWidth
      />

      <Button
        component="label"
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        fullWidth
        sx={{ py: 1.5, borderStyle: 'dashed' }}
      >
        {foto ? foto.name : 'Subir Foto de la Mascota'}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => setFoto(e.target.files?.[0] || null)}
        />
      </Button>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        disabled={loading}
        startIcon={loading && <CircularProgress size={20} color="inherit" />}
      >
        {loading ? 'Guardando...' : 'Guardar Mascota'}
      </Button>
    </Box>
  );
}
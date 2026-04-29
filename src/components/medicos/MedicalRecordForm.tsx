import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthProvider';
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function MedicalRecordForm({ caninoId, onSuccess }: { caninoId: string, onSuccess?: () => void }) {
  const { user } = useAuth();
  
  const [citas, setCitas] = useState<any[]>([]);
  const [citaId, setCitaId] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [medicamentos, setMedicamentos] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [proximaConsulta, setProximaConsulta] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPrestador = user?.user_metadata?.rol === 'PRESTADOR';

  useEffect(() => {
    const fetchCitas = async () => {
      if (!isPrestador || !user) return;
      const { data: prestador } = await supabase.from('prestadores').select('id').eq('usuario_id', user.id).single();
      
      if (prestador) {
        const { data } = await supabase
          .from('citas')
          .select('id, fecha_hora_cita, servicios(nombre)')
          .eq('canino_id', caninoId)
          .eq('prestador_id', prestador.id)
          .eq('estado', 'COMPLETADA');
        
        if (data) setCitas(data);
      }
    };
    fetchCitas();
  }, [user, caninoId, isPrestador]);

  const uploadArchivo = async (file: File) => {
    const filePath = `medicos/${caninoId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('registros_medicos').upload(filePath, file);
    if (error) throw error;
    const publicUrl = supabase.storage.from('registros_medicos').getPublicUrl(filePath).data.publicUrl;
    return publicUrl;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    
    try {
      const { data: prestador } = await supabase.from('prestadores').select('id').eq('usuario_id', user.id).single();
      if (!prestador) throw new Error("No se encontró el prestador");

      let archivo_adjunto_url = null;
      if (archivo) {
        archivo_adjunto_url = await uploadArchivo(archivo);
      }

      const payload = {
        canino_id: caninoId,
        prestador_id: prestador.id,
        cita_id: citaId || null,
        diagnostico,
        tratamiento,
        medicamentos,
        observaciones,
        proxima_consulta: proximaConsulta || null,
        archivo_adjunto_url
      };

      const { error: insErr } = await supabase.from('registros_medicos').insert([payload]);
      if (insErr) throw insErr;
      
      // Reset form
      setCitaId('');
      setDiagnostico('');
      setTratamiento('');
      setMedicamentos('');
      setObservaciones('');
      setProximaConsulta('');
      setArchivo(null);
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar el registro.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isPrestador) return null;

  return (
    <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      
      <FormControl fullWidth>
        <InputLabel id="cita-label">Cita Asociada (Opcional)</InputLabel>
        <Select
          labelId="cita-label"
          value={citaId}
          label="Cita Asociada (Opcional)"
          onChange={(e) => setCitaId(e.target.value)}
        >
          <MenuItem value=""><em>Ninguna</em></MenuItem>
          {citas.map((c) => (
            <MenuItem key={c.id} value={c.id.toString()}>
              {new Date(c.fecha_hora_cita).toLocaleDateString()} - {c.servicios?.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Diagnóstico"
        value={diagnostico}
        onChange={(e) => setDiagnostico(e.target.value)}
        required
        fullWidth
        multiline
        rows={2}
      />
      
      <TextField
        label="Tratamiento"
        value={tratamiento}
        onChange={(e) => setTratamiento(e.target.value)}
        required
        fullWidth
        multiline
        rows={2}
      />
      
      <TextField
        label="Medicamentos"
        value={medicamentos}
        onChange={(e) => setMedicamentos(e.target.value)}
        fullWidth
        multiline
        rows={2}
      />
      
      <TextField
        label="Observaciones"
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        fullWidth
        multiline
        rows={2}
      />
      
      <TextField
        label="Próxima Consulta"
        type="date"
        value={proximaConsulta}
        onChange={(e) => setProximaConsulta(e.target.value)}
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
      />

      <Button
        component="label"
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        fullWidth
        sx={{ py: 1.5, borderStyle: 'dashed' }}
      >
        {archivo ? archivo.name : 'Adjuntar Archivo (PDF, Imagen, etc)'}
        <input
          type="file"
          hidden
          onChange={(e) => setArchivo(e.target.files?.[0] || null)}
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
        sx={{ mt: 2 }}
      >
        {loading ? 'Guardando...' : 'Guardar Registro Médico'}
      </Button>
    </Box>
  );
}
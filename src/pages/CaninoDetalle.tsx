import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthProvider';
import MedicalRecordForm from '../components/medicos/MedicalRecordForm';
import MedicalRecordList, { MedicalRecord } from '../components/medicos/MedicalRecordList';
import { Container, Typography, Card, CardContent, Tabs, Tab, Box, CircularProgress, Button, Grid, Avatar, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function CaninoDetalle() {
  const { id } = useParams();
  const { user } = useAuth();
  const [canino, setCanino] = useState<any | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);

      const { data: caninoData } = await supabase.from('caninos').select('*').eq('id', id).single();
      setCanino(caninoData);

      const { data: recordsData } = await supabase
        .from('registros_medicos')
        .select('*')
        .eq('canino_id', id)
        .order('creado_at', { ascending: false });

      setMedicalRecords(recordsData || []);

      if (user) {
        setIsStaff(user.user_metadata?.rol === 'PRESTADOR');
      }

      setLoading(false);
    };

    fetchData();
  }, [id, user]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
      <CircularProgress />
    </Box>
  );

  if (!canino) return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h6" color="error">Mascota no encontrada.</Typography>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button 
        component={Link} 
        to="/caninos" 
        startIcon={<ArrowBackIcon />} 
        sx={{ mb: 3 }}
      >
        Volver a mis mascotas
      </Button>

      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        {canino.nombre}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="Información General" />
          <Tab label="Historial Médico" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Card elevation={2}>
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                {canino.foto_url ? (
                  <Avatar 
                    src={canino.foto_url} 
                    alt={canino.nombre} 
                    sx={{ width: 200, height: 200, borderRadius: 2 }}
                    variant="rounded"
                  />
                ) : (
                  <Avatar 
                    sx={{ width: 200, height: 200, borderRadius: 2, fontSize: 64, bgcolor: 'primary.main' }}
                    variant="rounded"
                  >
                    {canino.nombre.charAt(0).toUpperCase()}
                  </Avatar>
                )}
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant="h6" gutterBottom>Detalles de la Mascota</Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  <Chip label={`Raza: ${canino.raza}`} />
                  <Chip label={`Edad: ${canino.edad} años`} />
                  <Chip label={`Peso: ${canino.peso} kg`} />
                  <Chip label={`Sexo: ${canino.sexo}`} />
                </Box>

                {canino.observaciones && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Observaciones:</Typography>
                    <Typography variant="body1" color="text.secondary">{canino.observaciones}</Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Box>
          {isStaff && id && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">Nuevo Registro Médico</Typography>
              <Card elevation={1}>
                <CardContent>
                  <MedicalRecordForm caninoId={id} onSuccess={() => {}} />
                </CardContent>
              </Card>
            </Box>
          )}
          
          {!isStaff && (
            <>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mt: 0 }}>
                Registros Anteriores
              </Typography>
              <MedicalRecordList records={medicalRecords} loading={loading} isStaff={isStaff} />
            </>
          )}

          {isStaff && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              El historial médico es visible únicamente para el propietario de la mascota.
            </Typography>
          )}
        </Box>
      )}
    </Container>
  );
}
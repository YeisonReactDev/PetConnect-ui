import React from 'react';
import { List, ListItem, ListItemText, Typography, Chip, Box, Button, CircularProgress, Paper, Divider, Grid } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export interface MedicalRecord {
  id: number;
  creado_at: string;
  diagnostico: string;
  tratamiento: string;
  medicamentos?: string;
  observaciones?: string;
  proxima_consulta?: string;
  archivo_adjunto_url?: string;
}

export default function MedicalRecordList({ 
  records, 
  loading, 
  isStaff 
}: { 
  records: MedicalRecord[], 
  loading: boolean, 
  isStaff: boolean 
}) {
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
      <CircularProgress size={30} />
    </Box>
  );

  if (records.length === 0) return (
    <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
      <Typography variant="body1" color="text.secondary">
        No hay registros médicos para esta mascota.
      </Typography>
    </Box>
  );

  return (
    <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
      <List disablePadding>
        {records.map((record, index) => (
          <React.Fragment key={record.id}>
            <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                  Registro del {new Date(record.creado_at).toLocaleDateString()}
                </Typography>
                {record.proxima_consulta && (
                  <Chip 
                    label={`Próxima cita: ${new Date(record.proxima_consulta).toLocaleDateString()}`} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                )}
              </Box>

              <Grid container spacing={2} sx={{ width: '100%' }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Diagnóstico</Typography>
                  <Typography variant="body1" paragraph>{record.diagnostico}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Tratamiento</Typography>
                  <Typography variant="body1" paragraph>{record.tratamiento}</Typography>
                </Grid>
                
                {record.medicamentos && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">Medicamentos</Typography>
                    <Typography variant="body2" paragraph>{record.medicamentos}</Typography>
                  </Grid>
                )}
                
                {record.observaciones && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">Observaciones</Typography>
                    <Typography variant="body2" paragraph>{record.observaciones}</Typography>
                  </Grid>
                )}
              </Grid>

              {record.archivo_adjunto_url && (
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<InsertDriveFileIcon />}
                    href={record.archivo_adjunto_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Ver archivo adjunto
                  </Button>
                </Box>
              )}
            </ListItem>
            {index < records.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}


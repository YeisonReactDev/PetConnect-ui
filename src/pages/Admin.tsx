import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, CircularProgress, Alert, 
  Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, 
  Paper, TableContainer, Chip, Badge
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthProvider';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS, AppointmentStatus } from '../lib/appointmentSchema';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [citas, setCitas] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.user_metadata?.rol === 'ADMINISTRADOR') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: uData, error: uError } = await supabase
        .from('usuarios')
        .select('id, nombre, apellido, email, rol, creado_at')
        .order('creado_at', { ascending: false });
      
      if (uError) throw uError;
      setUsuarios(uData || []);

      const { data: pData, error: pError } = await supabase
        .from('prestadores')
        .select('nombre_comercial, ciudad, telefono, usuario_id');
      
      if (pError) throw pError;
      setPrestadores(pData || []);

      const { data: cData, error: cError } = await supabase
        .from('citas')
        .select(`
          id,
          fecha,
          estado,
          servicios (nombre),
          caninos (nombre),
          propietarios (nombre, apellido),
          prestadores (nombre_comercial)
        `)
        .order('fecha', { ascending: false });
      
      if (cError) throw cError;
      setCitas(cData || []);

    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (user?.user_metadata?.rol !== 'ADMINISTRADOR') {
    return <Container><Typography variant="h6" sx={{mt:4}}>Acceso denegado</Typography></Container>;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Panel de Administración</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab 
            label={<Badge badgeContent={usuarios.length} color="primary" sx={{ '& .MuiBadge-badge': { right: -15, top: 0 } }}>Usuarios</Badge>} 
            sx={{ mr: 2 }}
          />
          <Tab 
            label={<Badge badgeContent={prestadores.length} color="primary" sx={{ '& .MuiBadge-badge': { right: -15, top: 0 } }}>Prestadores</Badge>} 
            sx={{ mr: 2 }}
          />
          <Tab 
            label={<Badge badgeContent={citas.length} color="primary" sx={{ '& .MuiBadge-badge': { right: -15, top: 0 } }}>Citas</Badge>} 
          />
        </Tabs>
      </Box>

      {/* Tab Usuarios */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Fecha Registro</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.nombre} {u.apellido}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><Chip label={u.rol} size="small" /></TableCell>
                  <TableCell>{new Date(u.creado_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Tab Prestadores */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre Comercial</TableCell>
                <TableCell>Ciudad</TableCell>
                <TableCell>Teléfono</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prestadores.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{p.nombre_comercial}</TableCell>
                  <TableCell>{p.ciudad}</TableCell>
                  <TableCell>{p.telefono}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Tab Citas */}
      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Servicio</TableCell>
                <TableCell>Mascota</TableCell>
                <TableCell>Propietario</TableCell>
                <TableCell>Prestador</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {citas.map((c) => {
                const status = c.estado as AppointmentStatus;
                const color = APPOINTMENT_STATUS_COLORS[status] || 'default';
                const label = APPOINTMENT_STATUS_LABELS[status] || status;
                
                return (
                  <TableRow key={c.id}>
                    <TableCell>{new Date(c.fecha).toLocaleString()}</TableCell>
                    <TableCell>{c.servicios?.nombre}</TableCell>
                    <TableCell>{c.caninos?.nombre}</TableCell>
                    <TableCell>{c.propietarios?.nombre} {c.propietarios?.apellido}</TableCell>
                    <TableCell>{c.prestadores?.nombre_comercial}</TableCell>
                    <TableCell>
                      <Chip label={label} color={color as any} size="small" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Container>
  );
}
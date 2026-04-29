import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

export default function Home() {
  const features = [
    {
      title: 'Agenda Citas',
      description: 'Encuentra horarios disponibles fácilmente.',
      icon: <CalendarMonthIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />,
    },
    {
      title: 'Historial Médico',
      description: 'Mantén los registros de tu mascota centralizados.',
      icon: <MedicalServicesIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />,
    },
    {
      title: 'Prestadores Verificados',
      description: 'Servicios de alta calidad y confianza.',
      icon: <VerifiedUserIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />,
    },
  ];

  return (
    <Box>
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 8, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Conecta con el mejor cuidado para tu mascota
          </Typography>
          <Typography variant="h6" component="p" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
            Encuentra veterinarios, estilistas y cuidadores en un solo lugar.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" color="secondary" size="large" component={Link} to="/servicios">
              Explorar Servicios
            </Button>
            <Button variant="outlined" color="inherit" size="large" component={Link} to="/auth">
              Registrarse
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {feature.icon}
                  <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

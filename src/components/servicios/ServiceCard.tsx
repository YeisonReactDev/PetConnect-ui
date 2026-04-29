import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardActions, Typography, Button, Chip, Box } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export default function ServiceCard({ service }: { service: any }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }} elevation={2}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography gutterBottom variant="h6" component="h2" fontWeight="bold">
            {service.nombre}
          </Typography>
          <Chip 
            label={service.categorias_servicio?.nombre || 'General'} 
            size="small" 
            color="primary" 
            variant="outlined" 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {service.descripcion}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            icon={<AttachMoneyIcon />} 
            label={service.precio} 
            size="small" 
            color="success" 
            sx={{ fontWeight: 'bold' }} 
          />
          <Chip 
            icon={<AccessTimeIcon />} 
            label={`${service.duracion_minutos} min`} 
            size="small" 
          />
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button 
          component={Link} 
          to={`/servicios/${service.id}`} 
          variant="contained" 
          color="primary"
          fullWidth
        >
          Ver Detalles
        </Button>
      </CardActions>
    </Card>
  );
}
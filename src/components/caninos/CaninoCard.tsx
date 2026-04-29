import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Chip, Box, Avatar } from '@mui/material';

export default function CaninoCard({ canino }: { canino: any }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden' }} elevation={2}>
      {canino.foto_url ? (
        <CardMedia
          component="img"
          image={canino.foto_url}
          alt={canino.nombre}
          sx={{ width: '100%', height: 240, objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <Box sx={{ height: 240, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
            {canino.nombre.charAt(0).toUpperCase()}
          </Avatar>
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2" fontWeight="bold">
          {canino.nombre}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <Chip label={canino.raza || 'Raza desconocida'} size="small" color="primary" variant="outlined" />
          <Chip label={`${canino.edad} años`} size="small" />
          <Chip label={canino.sexo} size="small" />
          {canino.peso && <Chip label={`${canino.peso} kg`} size="small" />}
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button 
          component={Link} 
          to={`/caninos/${canino.id}`} 
          variant="contained" 
          fullWidth
        >
          Ver Detalle
        </Button>
      </CardActions>
    </Card>
  );
}
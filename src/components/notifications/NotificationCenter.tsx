import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { 
  IconButton, Badge, Popover, List, ListItem, 
  ListItemText, Typography, Box, Button, Divider 
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';

export default function NotificationCenter() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleClick}
        aria-describedby={id}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 350, maxHeight: 400, display: 'flex', flexDirection: 'column' }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'grey.50' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Notificaciones
          </Typography>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              startIcon={<DoneAllIcon />} 
              onClick={handleMarkAllAsRead}
            >
              Marcar leídas
            </Button>
          )}
        </Box>
        <Divider />
        
        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary={<Typography variant="body2" color="text.secondary" align="center">No tienes notificaciones</Typography>} 
              />
            </ListItem>
          ) : (
            notifications.map((notif, index) => (
              <React.Fragment key={notif.id}>
                <ListItem 
                  alignItems="flex-start" 
                  sx={{ 
                    bgcolor: notif.leida ? 'transparent' : 'action.hover',
                    borderLeft: notif.leida ? 'none' : '4px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  <ListItemText
                    primary={notif.mensaje}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      fontWeight: notif.leida ? 'normal' : 'bold'
                    }}
                    secondary={new Date(notif.creado_at).toLocaleString()}
                    secondaryTypographyProps={{ variant: 'caption', display: 'block', mt: 0.5 }}
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))
          )}
        </List>
      </Popover>
    </>
  );
}
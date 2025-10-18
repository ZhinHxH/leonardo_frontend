import { Card, CardContent, Typography, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';

const cards = [
  { title: 'Ingresos Pagos: Hoy', value: '800.00', icon: <PeopleIcon sx={{ color: '#1976d2', fontSize: 40 }} />, color: '#e3f2fd' },
  { title: 'Ingresos Ventas: Hoy', value: '4,200.00', icon: <ShoppingCartIcon sx={{ color: '#fbc02d', fontSize: 40 }} />, color: '#fffde7' },
  { title: 'Ingresos Pagos: Mes', value: '184,900.00', icon: <PeopleIcon sx={{ color: '#1976d2', fontSize: 40 }} />, color: '#e3f2fd' },
  { title: 'Ingresos Ventas: Mes', value: '275,331.00', icon: <ShoppingCartIcon sx={{ color: '#fbc02d', fontSize: 40 }} />, color: '#fffde7' },
  { title: 'Reportes', value: 'Ver más', icon: <AssessmentIcon sx={{ color: '#43a047', fontSize: 40 }} />, color: '#e8f5e9' },
];

export default function DashboardCards() {
  return (
    <Box display="flex" flexWrap="wrap" gap={3}>
      {cards.map((card) => (
        <Card key={card.title} sx={{ minWidth: 250, background: card.color, boxShadow: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              {card.icon}
              <Box>
                <Typography variant="subtitle2" color="text.secondary">{card.title}</Typography>
                <Typography variant="h5" fontWeight={700}>{card.value}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
} 
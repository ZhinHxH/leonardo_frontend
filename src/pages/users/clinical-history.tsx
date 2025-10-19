import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  Toolbar,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Autocomplete,
  InputAdornment,
  Tabs,
  Tab,
  Divider,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack
} from '@mui/material';
import {
  MedicalServices as MedicalIcon,
  Add,
  Scale as WeightIcon,
  Restaurant,
  FitnessCenter,
  Assignment,
  CameraAlt,
  TrendingUp,
  Timeline as TimelineIcon,
  Assessment,
  Person,
  Search,
  StraightenOutlined as MeasurementIcon
} from '@mui/icons-material';
import { AdminRoute } from '../../components/AdminRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { getClients } from '../../services/clients';
import clinicalHistoryService from '../../services/clinical-history';

interface User {
  id: number;
  name: string;
  email: string;
  dni: string;
  phone: string;
  current_weight?: number;
  target_weight?: number;
  height?: number;
  bmi?: number;
}

interface ClinicalRecord {
  id: number;
  user_id: number;
  date: string;
  type: 'initial_assessment' | 'progress_check' | 'body_composition' | 'measurements' | 'medical_clearance' | 'injury_report' | 'nutrition_plan' | 'training_plan';
  weight?: number;
  height?: number;
  body_fat?: number;
  muscle_mass?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  notes: string;
  recommendations?: string;
  created_by: string;
  attachment_url?: string;
}

// Datos de ejemplo
const mockUsers: User[] = [
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan@email.com',
    dni: '12345678',
    phone: '3001234567',
    current_weight: 75.5,
    target_weight: 70,
    height: 175,
    bmi: 24.7
  },
  {
    id: 2,
    name: 'María García',
    email: 'maria@email.com',
    dni: '87654321',
    phone: '3009876543',
    current_weight: 65,
    target_weight: 60,
    height: 165,
    bmi: 23.9
  }
];

const mockClinicalHistory: ClinicalRecord[] = [
  {
    id: 1,
    user_id: 1,
    date: '2024-01-15T10:00:00',
    type: 'initial_assessment',
    weight: 75.5,
    notes: 'Peso inicial registrado al comenzar el programa',
    created_by: 'Dr. Smith',
  },
  {
    id: 2,
    user_id: 1,
    date: '2024-01-20T14:30:00',
    type: 'nutritionist_note',
    notes: 'Plan nutricional ajustado. Reducir carbohidratos en la cena. Aumentar proteína post-entrenamiento.',
    recommendations: 'Consumir 2L de agua diarios. Evitar azúcares procesados.',
    created_by: 'Nutricionista López',
  },
  {
    id: 3,
    user_id: 1,
    date: '2024-01-25T09:15:00',
    type: 'measurement',
    measurements: {
      chest: 95,
      waist: 85,
      hips: 90,
      arms: 35,
      thighs: 55
    },
    notes: 'Medidas corporales tomadas para seguimiento de progreso',
    created_by: 'Entrenador Martínez',
  },
  {
    id: 4,
    user_id: 1,
    date: '2024-02-01T11:00:00',
    type: 'initial_assessment',
    weight: 74.2,
    notes: 'Pérdida de 1.3kg en 2 semanas. Excelente progreso.',
    created_by: 'Dr. Smith',
  }
];

export default function ClinicalHistory() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [clinicalHistory, setClinicalHistory] = useState<ClinicalRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ClinicalRecord[]>([]);
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [activeTab, setActiveTab] = useState(0);
  const [addRecordDialog, setAddRecordDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newRecord, setNewRecord] = useState<Partial<ClinicalRecord>>({
    type: 'initial_assessment',
    notes: '',
    recommendations: ''
  });

  // Cargar usuarios al inicializar
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getClients({
        search: '',
        page: 1,
        limit: 1000
      });
      
      const usersList = response.users || response.items || response || [];
      setUsers(usersList.filter((u: any) => u.role === 'member')); // Solo miembros
      
    } catch (err: any) {
      setError(err.message || 'Error cargando usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar historial por tipo
  useEffect(() => {
    if (!selectedUser) return;
    
    let filtered = clinicalHistory.filter(record => record.user_id === selectedUser.id);
    
    if (typeFilter !== 'Todos') {
      filtered = filtered.filter(record => record.type === typeFilter);
    }
    
    setFilteredHistory(filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [selectedUser, clinicalHistory, typeFilter]);

  const handleUserSelect = async (user: User | null) => {
    setSelectedUser(user);
    if (user) {
      setLoading(true);
      try {
        const history = await clinicalHistoryService.getClinicalHistory(user.id);
        setClinicalHistory(history);
      } catch (err: any) {
        setError(err.message || 'Error cargando historia clínica');
        setClinicalHistory([]);
      } finally {
        setLoading(false);
      }
    } else {
      setClinicalHistory([]);
    }
  };

  const handleAddRecord = async () => {
    if (!selectedUser || !newRecord.notes) return;
    
    setLoading(true);
    setError('');
    
    try {
      const recordData = {
        user_id: selectedUser.id,
        record_type: newRecord.type,
        weight: newRecord.weight,
        height: newRecord.height,
        body_fat: newRecord.body_fat,
        muscle_mass: newRecord.muscle_mass,
        measurements: newRecord.measurements,
        notes: newRecord.notes,
        recommendations: newRecord.recommendations,
        record_date: new Date().toISOString()
      };
      
      const newRecordResponse = await clinicalHistoryService.createClinicalRecord(recordData);
      
      // Recargar la historia clínica
      const history = await clinicalHistoryService.getClinicalHistory(selectedUser.id);
      setClinicalHistory(history);
      
      setAddRecordDialog(false);
      setNewRecord({
        type: 'initial_assessment',
        notes: '',
        recommendations: ''
      });
      
    } catch (err: any) {
      setError(err.message || 'Error creando registro clínico');
    } finally {
      setLoading(false);
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'weight_update': return <WeightIcon color="primary" />;
      case 'measurement': return <MeasurementIcon color="info" />;
      case 'nutritionist_note': return <Restaurant color="success" />;
      case 'trainer_note': return <FitnessCenter color="warning" />;
      case 'medical_note': return <MedicalIcon color="error" />;
      case 'goal_update': return <TrendingUp color="secondary" />;
      case 'progress_photo': return <CameraAlt color="info" />;
      default: return <Assignment />;
    }
  };

  const getRecordTitle = (type: string) => {
    switch (type) {
      case 'weight_update': return 'Actualización de Peso';
      case 'measurement': return 'Medidas Corporales';
      case 'nutritionist_note': return 'Nota Nutricional';
      case 'trainer_note': return 'Nota del Entrenador';
      case 'medical_note': return 'Nota Médica';
      case 'goal_update': return 'Actualización de Objetivos';
      case 'progress_photo': return 'Foto de Progreso';
      default: return 'Registro';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWeightProgress = () => {
    if (!selectedUser) return [];
    
    const weightRecords = filteredHistory
      .filter(record => (record.type === 'initial_assessment' || record.type === 'progress_check' || record.type === 'body_composition') && record.weight)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return weightRecords.map(record => ({
      date: new Date(record.date).toLocaleDateString('es-CO'),
      weight: record.weight!
    }));
  };

  return (
    <AdminRoute allowedRoles={['ADMIN', 'MANAGER', 'TRAINER', 'RECEPTIONIST']}>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Toolbar />
          <Box p={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                  <MedicalIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h4" component="h1">
                    Historial Clínico
                  </Typography>
                </Box>
                {selectedUser && (
                  <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => setAddRecordDialog(true)}
                  >
                    Nuevo Registro
                  </Button>
                )}
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" mb={2}>Seleccionar Usuario</Typography>
                      <Autocomplete
                        options={users}
                        getOptionLabel={(user) => `${user.name} - ${user.dni}`}
                        value={selectedUser}
                        onChange={(_, newValue) => handleUserSelect(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Buscar usuario por nombre o DNI"
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                          />
                        )}
                        renderOption={(props, user) => (
                          <Box component="li" {...props}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {user.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1">{user.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                DNI: {user.dni} | {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      />
                      
                      {selectedUser && (
                        <Box mt={3}>
                          <Typography variant="subtitle2" mb={2}>Información Actual:</Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Peso Actual</Typography>
                              <Typography variant="h6">{selectedUser.current_weight || 'N/A'} kg</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Objetivo</Typography>
                              <Typography variant="h6">{selectedUser.target_weight || 'N/A'} kg</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Altura</Typography>
                              <Typography variant="h6">{selectedUser.height || 'N/A'} cm</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">IMC</Typography>
                              <Typography variant="h6">{selectedUser.bmi || 'N/A'}</Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                  {selectedUser ? (
                    <Card>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="h6">
                            Historial de {selectedUser.name}
                          </Typography>
                          <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Filtrar por tipo</InputLabel>
                            <Select
                              value={typeFilter}
                              label="Filtrar por tipo"
                              onChange={(e) => setTypeFilter(e.target.value)}
                            >
                              <MenuItem value="Todos">Todos</MenuItem>
                              <MenuItem value="weight_update">Peso</MenuItem>
                              <MenuItem value="measurement">Medidas</MenuItem>
                              <MenuItem value="nutritionist_note">Nutrición</MenuItem>
                              <MenuItem value="trainer_note">Entrenamiento</MenuItem>
                              <MenuItem value="medical_note">Médico</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>

                        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                          <Tab label="Timeline" icon={<TimelineIcon />} />
                          <Tab label="Gráficos" icon={<Assessment />} />
                        </Tabs>

                        {activeTab === 0 && (
                          <Box>
                            {filteredHistory.map((record, index) => (
                              <Box key={record.id} display="flex" mb={3}>
                                {/* Timeline dot */}
                                <Box display="flex" flexDirection="column" alignItems="center" mr={3}>
                                  <Avatar 
                                    sx={{ 
                                      bgcolor: 'primary.main', 
                                      width: 50, 
                                      height: 50,
                                      mb: 1
                                    }}
                                  >
                                    {getRecordIcon(record.type)}
                                  </Avatar>
                                  {index < filteredHistory.length - 1 && (
                                    <Box 
                                      sx={{ 
                                        width: 2, 
                                        height: 60, 
                                        bgcolor: 'divider',
                                        borderRadius: 1
                                      }} 
                                    />
                                  )}
                                </Box>

                                {/* Content */}
                                <Box flexGrow={1}>
                                  <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                          {getRecordTitle(record.type)}
                                        </Typography>
                                        <Chip 
                                          label={formatDate(record.date)} 
                                          size="small" 
                                          variant="outlined"
                                        />
                                      </Box>
                                      
                                      <Typography variant="body2" color="text.secondary" mb={1}>
                                        Por: {record.created_by}
                                      </Typography>

                                      {record.weight && (
                                        <Box mb={1}>
                                          <Typography variant="body2">
                                            <strong>Peso:</strong> {record.weight} kg
                                          </Typography>
                                        </Box>
                                      )}

                                      {record.measurements && (
                                        <Box mb={1}>
                                          <Typography variant="body2" fontWeight="bold">Medidas:</Typography>
                                          <Grid container spacing={1}>
                                            {Object.entries(record.measurements).map(([key, value]) => (
                                              <Grid item xs={6} key={key}>
                                                <Typography variant="caption">
                                                  {key}: {value} cm
                                                </Typography>
                                              </Grid>
                                            ))}
                                          </Grid>
                                        </Box>
                                      )}

                                      <Typography variant="body2" mb={1}>
                                        {record.notes}
                                      </Typography>

                                      {record.recommendations && (
                                        <Alert severity="info" sx={{ mt: 1 }}>
                                          <Typography variant="body2">
                                            <strong>Recomendaciones:</strong> {record.recommendations}
                                          </Typography>
                                        </Alert>
                                      )}
                                    </CardContent>
                                  </Card>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}

                        {activeTab === 1 && (
                          <Box>
                            <Typography variant="h6" mb={2}>Progreso de Peso</Typography>
                            {getWeightProgress().length > 0 ? (
                              <Card>
                                <CardContent>
                                  <Typography variant="body2" color="text.secondary" mb={2}>
                                    Evolución del peso a lo largo del tiempo
                                  </Typography>
                                  {/* Aquí iría un gráfico real con Chart.js o similar */}
                                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography color="text.secondary">
                                      📊 Gráfico de progreso (implementar con Chart.js)
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            ) : (
                              <Alert severity="info">
                                No hay suficientes datos de peso para mostrar el gráfico
                              </Alert>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent sx={{ textAlign: 'center', py: 8 }}>
                        <Person sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          Selecciona un usuario para ver su historial clínico
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Dialog para agregar nuevo registro */}
      <Dialog
        open={addRecordDialog}
        onClose={() => setAddRecordDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nuevo Registro Clínico</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Registro</InputLabel>
                <Select
                  value={newRecord.type}
                  label="Tipo de Registro"
                  onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value as any })}
                >
                  <MenuItem value="initial_assessment">Evaluación Inicial</MenuItem>
                  <MenuItem value="progress_check">Control de Progreso</MenuItem>
                  <MenuItem value="body_composition">Composición Corporal</MenuItem>
                  <MenuItem value="measurements">Medidas Corporales</MenuItem>
                  <MenuItem value="medical_clearance">Autorización Médica</MenuItem>
                  <MenuItem value="injury_report">Reporte de Lesión</MenuItem>
                  <MenuItem value="nutrition_plan">Plan Nutricional</MenuItem>
                  <MenuItem value="training_plan">Plan de Entrenamiento</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {(newRecord.type === 'initial_assessment' || newRecord.type === 'progress_check' || newRecord.type === 'body_composition') && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Peso"
                    type="number"
                    value={newRecord.weight || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, weight: Number(e.target.value) })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Altura"
                    type="number"
                    value={newRecord.height || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, height: Number(e.target.value) })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas y Observaciones"
                multiline
                rows={4}
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recomendaciones"
                multiline
                rows={2}
                value={newRecord.recommendations}
                onChange={(e) => setNewRecord({ ...newRecord, recommendations: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddRecordDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAddRecord} 
            variant="contained"
            disabled={!newRecord.notes || loading}
          >
            {loading ? 'Guardando...' : 'Guardar Registro'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminRoute>
  );
}

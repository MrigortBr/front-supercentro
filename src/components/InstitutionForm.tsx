import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  Paper,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import { Plus, Pencil, Trash2, Calendar, X } from 'lucide-react';
import { Institution, Activity, InstitutionStatus, ActivityStatus } from '../types';

interface InstitutionFormProps {
  institution: Institution | null;
  onSave: (data: Omit<Institution, 'id'>) => void;
  onCancel: () => void;
  onEdit?: () => void;
  readOnly?: boolean;
}

const STATUS_OPTIONS: InstitutionStatus[] = ['Não iniciado', 'Em andamento', 'Concluído', 'Atrasado', 'Pendente'];
const ACTIVITY_STATUS_OPTIONS: ActivityStatus[] = ['Projetado', 'Em andamento', 'Concluído'];
const BRAZIL_STATES = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];

const emptyActivity: Activity = { name: '', responsible: '', start_date: '', end_date: '', status: 'Projetado' };

const activityStatusColors: Record<ActivityStatus, { bg: string; color: string }> = {
  'Concluído': { bg: '#168821', color: '#fff' },
  'Em andamento': { bg: '#1351B4', color: '#fff' },
  'Projetado': { bg: '#FF8C00', color: '#fff' },
  'Planejado': { bg: '#FF8C00', color: '#fff' },
};

export default function InstitutionForm({ institution, onSave, onCancel, onEdit, readOnly = false }: InstitutionFormProps) {
  const [formData, setFormData] = useState<Omit<Institution, 'id'>>(
    institution
      ? { ...institution }
      : { name: '', state: '', responsible: '', status: 'Não iniciado', observations: '', activities: [] }
  );
  const [newActivity, setNewActivity] = useState<Activity>({ ...emptyActivity });
  const [editingActivityIdx, setEditingActivityIdx] = useState<number | null>(null);
  const [editingActivityData, setEditingActivityData] = useState<Activity>({ ...emptyActivity });

  const startEditActivity = (idx: number) => {
    setEditingActivityIdx(idx);
    setEditingActivityData({ ...formData.activities[idx] });
  };

  const saveEditActivity = () => {
    if (editingActivityIdx === null) return;
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.map((a, i) => i === editingActivityIdx ? { ...editingActivityData } : a),
    }));
    setEditingActivityIdx(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addActivity = () => {
    if (newActivity.name.trim()) {
      setFormData((prev) => ({ ...prev, activities: [...(prev.activities || []), { ...newActivity }] }));
      setNewActivity({ ...emptyActivity });
    }
  };

  const removeActivity = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== idx),
    }));
  };

  return (
    <Dialog open fullWidth maxWidth="md" PaperProps={{ sx: { maxHeight: '90vh' } }}>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#f8f9fa',
          borderBottom: '1px solid #dee2e6',
          py: 2,
        }}
      >
        <Typography variant="h2" sx={{ color: 'primary.main', fontSize: '1.5rem' }}>
          {readOnly ? 'Detalhes da Instituição' : institution ? 'Editar Instituição' : 'Nova Instituição'}
        </Typography>
        <IconButton onClick={onCancel} size="small" sx={{ color: '#666' }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          {/* Institution name */}
          <Box sx={{ mb: 2.5 }}>
            <TextField
              label="Nome da Instituição"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: FCECON – Manaus"
              required
              disabled={readOnly}
            />
          </Box>

          {/* State + Status row */}
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" required disabled={readOnly}>
                <InputLabel>Estado</InputLabel>
                <Select
                  label="Estado"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                >
                  <MenuItem value=""><em>Selecione</em></MenuItem>
                  {BRAZIL_STATES.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" required disabled={readOnly}>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as InstitutionStatus })}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Responsible */}
          <Box sx={{ mb: 2.5 }}>
            <TextField
              label="Responsável"
              fullWidth
              value={formData.responsible}
              onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
              placeholder="Ex: ACC"
              disabled={readOnly}
            />
          </Box>

          {/* Observations */}
          <Box sx={{ mb: 2.5 }}>
            <TextField
              label="Observações"
              fullWidth
              multiline
              rows={3}
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Informações adicionais..."
              disabled={readOnly}
            />
          </Box>

          {/* Activities */}
          <Paper variant="outlined" sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
            <Typography variant="body1" fontWeight={600} sx={{ mb: 2, color: '#495057' }}>
              Atividades e Cronograma
            </Typography>

            {/* Existing activities */}
            {formData.activities.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                {formData.activities.map((activity, idx) => {
                  const colors = activityStatusColors[activity.status] || { bg: '#1351B4', color: '#fff' };
                  const isEditing = editingActivityIdx === idx;

                  if (!readOnly && isEditing) {
                    return (
                      <Box key={idx} sx={{ bgcolor: 'white', p: 1.5, borderRadius: 1, border: '1px solid #1351B4', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Grid container spacing={1.5}>
                          <Grid item xs={12} sm={8}>
                            <TextField size="small" fullWidth placeholder="Nome da atividade *" value={editingActivityData.name} onChange={(e) => setEditingActivityData({ ...editingActivityData, name: e.target.value })} />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField size="small" fullWidth placeholder="Responsável" value={editingActivityData.responsible} onChange={(e) => setEditingActivityData({ ...editingActivityData, responsible: e.target.value })} />
                          </Grid>
                        </Grid>
                        <Grid container spacing={1.5} alignItems="flex-end">
                          <Grid item xs={12} sm={3}>
                            <Typography variant="caption" sx={{ display: 'block', color: '#666', mb: 0.5, fontWeight: 500 }}>Data Início</Typography>
                            <TextField size="small" fullWidth type="date" value={editingActivityData.start_date} onChange={(e) => setEditingActivityData({ ...editingActivityData, start_date: e.target.value })} InputLabelProps={{ shrink: true }} />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="caption" sx={{ display: 'block', color: '#666', mb: 0.5, fontWeight: 500 }}>Data Fim</Typography>
                            <TextField size="small" fullWidth type="date" value={editingActivityData.end_date} onChange={(e) => setEditingActivityData({ ...editingActivityData, end_date: e.target.value })} InputLabelProps={{ shrink: true }} />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="caption" sx={{ display: 'block', color: '#666', mb: 0.5, fontWeight: 500 }}>Status</Typography>
                            <FormControl fullWidth size="small">
                              <Select value={editingActivityData.status} onChange={(e) => setEditingActivityData({ ...editingActivityData, status: e.target.value as ActivityStatus })}>
                                {ACTIVITY_STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button variant="outlined" fullWidth onClick={() => setEditingActivityIdx(null)} sx={{ height: 40 }}>Cancelar</Button>
                              <Button variant="contained" fullWidth onClick={saveEditActivity} sx={{ height: 40 }}>Salvar</Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    );
                  }

                  return (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: 'white',
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid #dee2e6',
                        gap: 2,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                          {activity.name}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                          <Chip
                            label={activity.status}
                            size="small"
                            sx={{
                              bgcolor: colors.bg,
                              color: colors.color,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              height: 20,
                            }}
                          />
                          {activity.responsible && (
                            <Chip
                              label={`Resp: ${activity.responsible}`}
                              size="small"
                              sx={{ bgcolor: '#e7f1ff', color: '#1351B4', fontSize: '0.65rem', height: 20 }}
                            />
                          )}
                          {activity.start_date && activity.end_date && (
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#f0fdf4', color: '#168821', px: 0.75, py: 0.25, borderRadius: 1 }}>
                              <Calendar size={11} />
                              <Typography variant="caption" sx={{ color: '#168821', fontSize: '0.65rem' }}>
                                {new Date(activity.start_date).toLocaleDateString('pt-BR')} –{' '}
                                {new Date(activity.end_date).toLocaleDateString('pt-BR')}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      {!readOnly && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                          <IconButton
                            size="small"
                            onClick={() => startEditActivity(idx)}
                            sx={{ bgcolor: '#e7f1ff', border: '1px solid #1351B4', color: 'primary.main', borderRadius: 1, '&:hover': { bgcolor: '#cce0ff' } }}
                          >
                            <Pencil size={14} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => removeActivity(idx)}
                            sx={{ bgcolor: '#ffe5e5', border: '1px solid #E52207', color: 'error.main', borderRadius: 1, '&:hover': { bgcolor: '#ffcccc' } }}
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}

            {!readOnly && <Divider sx={{ my: 2 }} />}

            {/* Add new activity */}
            {!readOnly && <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Nome da atividade *"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Responsável"
                    value={newActivity.responsible}
                    onChange={(e) => setNewActivity({ ...newActivity, responsible: e.target.value })}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={1.5} alignItems="flex-end">
                <Grid item xs={12} sm={3}>
                  <Typography variant="caption" sx={{ display: 'block', color: '#666', mb: 0.5, fontWeight: 500 }}>
                    Data Início
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    type="date"
                    value={newActivity.start_date}
                    onChange={(e) => setNewActivity({ ...newActivity, start_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="caption" sx={{ display: 'block', color: '#666', mb: 0.5, fontWeight: 500 }}>
                    Data Fim
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    type="date"
                    value={newActivity.end_date}
                    onChange={(e) => setNewActivity({ ...newActivity, end_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="caption" sx={{ display: 'block', color: '#666', mb: 0.5, fontWeight: 500 }}>
                    Status
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={newActivity.status}
                      onChange={(e) => setNewActivity({ ...newActivity, status: e.target.value as ActivityStatus })}
                    >
                      {ACTIVITY_STATUS_OPTIONS.map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Plus size={16} />}
                    onClick={addActivity}
                    sx={{
                      height: 40,
                      bgcolor: '#e7f1ff',
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': { bgcolor: '#cce0ff' },
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Adicionar
                  </Button>
                </Grid>
              </Grid>
            </Box>}
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid #dee2e6', gap: 1.5 }}>
          {readOnly ? (
            <>
              {onEdit && (
                <Button variant="contained" color="primary" onClick={onEdit}>
                  Editar
                </Button>
              )}
              <Button variant="contained" onClick={onCancel} sx={{ bgcolor: '#6c757d', color: 'white', '&:hover': { bgcolor: '#5a6268' } }}>
                Fechar
              </Button>
            </>
          ) : (
            <>
              <Button variant="contained" color="inherit" onClick={onCancel} sx={{ bgcolor: '#6c757d', color: 'white', '&:hover': { bgcolor: '#5a6268' } }}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Salvar
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}

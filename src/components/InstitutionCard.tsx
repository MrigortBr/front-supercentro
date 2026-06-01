import { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Collapse,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Edit2,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronRight,
  Printer,
} from 'lucide-react';
import { Institution } from '../types';
import StatusChip from './StatusChip';
import { exportInstitutionDetailPDF } from '../utils/exportInstitutionPDF';

interface InstitutionCardProps {
  institution: Institution;
  onView: (institution: Institution) => void;
  onEdit: (institution: Institution) => void;
  onDelete: (id: number) => void;
}

export default function InstitutionCard({ institution, onView, onEdit, onDelete }: InstitutionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleExport = (withGantt: boolean) => {
    setExportDialogOpen(false);
    exportInstitutionDetailPDF(institution, withGantt);
  };

  const activityStatusColors: Record<string, { bg: string; color: string }> = {
    'Concluído': { bg: '#168821', color: '#fff' },
    'Em andamento': { bg: '#1351B4', color: '#fff' },
    'Projetado': { bg: '#FF8C00', color: '#fff' },
    'Planejado': { bg: '#FF8C00', color: '#fff' },
  };

  return (
    <Card onClick={() => onView(institution)} sx={{ overflow: 'hidden', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
      {/* Card Header */}
      <Box sx={{ p: '1.25rem', bgcolor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            sx={{ color: '#666', '&:hover': { color: 'primary.main' } }}
          >
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </IconButton>

          <Typography
            variant="h3"
            sx={{ flex: 1, fontSize: '1.125rem', fontWeight: 600, color: 'primary.main' }}
          >
            {institution.name}
          </Typography>

          <StatusChip status={institution.status} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <IconButton
            size="small"
            title="Exportar PDF"
            onClick={(e) => { e.stopPropagation(); setExportDialogOpen(true); }}
            sx={{
              border: '1px solid #dee2e6',
              borderRadius: 1,
              bgcolor: 'white',
              color: '#666',
              '&:hover': { bgcolor: '#f0fff4', color: '#168821', borderColor: '#168821' },
            }}
          >
            <Printer size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onEdit(institution); }}
            sx={{
              border: '1px solid #dee2e6',
              borderRadius: 1,
              bgcolor: 'white',
              color: '#666',
              '&:hover': { bgcolor: '#e7f1ff', color: 'primary.main', borderColor: 'primary.main' },
            }}
          >
            <Edit2 size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onDelete(institution.id); }}
            sx={{
              border: '1px solid #dee2e6',
              borderRadius: 1,
              bgcolor: 'white',
              color: '#666',
              '&:hover': { bgcolor: '#ffe5e5', color: 'error.main', borderColor: 'error.main' },
            }}
          >
            <Trash2 size={16} />
          </IconButton>
        </Box>
      </Box>

      {/* Card Body */}
      <CardContent sx={{ p: '1.25rem !important' }}>
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, fontSize: '0.925rem' }}>
          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, minWidth: 100 }}>
            Estado:
          </Typography>
          <Typography variant="body2">{institution.state}</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, fontSize: '0.925rem' }}>
          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, minWidth: 100 }}>
            Responsável:
          </Typography>
          <Typography variant="body2">{institution.responsible}</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, minWidth: 100 }}>
            Observações:
          </Typography>
          <Typography variant="body2" sx={{ color: institution.observations ? '#495057' : '#adb5bd', lineHeight: 1.5, fontStyle: institution.observations ? 'normal' : 'italic' }}>
            {institution.observations || 'Nenhuma'}
          </Typography>
        </Box>
      </CardContent>

      {/* Export dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Exportar PDF</DialogTitle>
        <DialogContent>
          <Typography>Deseja incluir o Gantt da instituição no final do PDF?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleExport(false)}>Sem Gantt</Button>
          <Button onClick={() => handleExport(true)} variant="contained">Com Gantt</Button>
        </DialogActions>
      </Dialog>

      {/* Activities (expandable) */}
      <Collapse in={isExpanded}>
        {institution.activities && institution.activities.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: '1.25rem', bgcolor: '#f8f9fa' }}>
              <Typography variant="h4" sx={{ mb: 2, color: '#666' }}>
                Atividades ({institution.activities.length})
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {institution.activities.map((activity, idx) => {
                  const colors = activityStatusColors[activity.status] || { bg: '#1351B4', color: '#fff' };
                  return (
                    <Box
                      key={idx}
                      sx={{
                        bgcolor: 'white',
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid #dee2e6',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {activity.name}
                        </Typography>
                        {activity.status && (
                          <Chip
                            label={activity.status}
                            size="small"
                            sx={{
                              bgcolor: colors.bg,
                              color: colors.color,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              height: 20,
                            }}
                          />
                        )}
                      </Box>

                      {activity.responsible && (
                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                          Responsável: {activity.responsible}
                        </Typography>
                      )}

                      {activity.start_date && activity.end_date && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main' }}>
                          <Calendar size={12} />
                          <Typography variant="caption" sx={{ color: 'primary.main' }}>
                            {new Date(activity.start_date).toLocaleDateString('pt-BR')} até{' '}
                            {new Date(activity.end_date).toLocaleDateString('pt-BR')}
                          </Typography>
                        </Box>
                      )}
                      {activity.observations && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#555', fontStyle: 'italic' }}>
                          {activity.observations}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </>
        )}
      </Collapse>
    </Card>
  );
}

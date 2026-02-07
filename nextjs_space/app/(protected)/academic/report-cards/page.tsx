'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, FileText, Download, Eye, Edit2, Loader2, Search, Filter, BookOpen, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ReportCard {
  id: string;
  schoolYear: string;
  period: string;
  status: string;
  finalAverage: number | null;
  attendance: number | null;
  absences: number;
  tardies: number;
  teacherComments: string | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    group: { name: string } | null;
  };
  grades: Array<{
    grade: number;
    subject: { name: string; color: string };
    comments: string | null;
  }>;
  pdfUrl: string | null;
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  group: { id: string; name: string } | null;
}

const periodLabels: Record<string, string> = {
  BIMESTRE_1: '1er Bimestre',
  BIMESTRE_2: '2do Bimestre',
  BIMESTRE_3: '3er Bimestre',
  BIMESTRE_4: '4to Bimestre',
  BIMESTRE_5: '5to Bimestre',
  TRIMESTRE_1: '1er Trimestre',
  TRIMESTRE_2: '2do Trimestre',
  TRIMESTRE_3: '3er Trimestre',
  SEMESTRE_1: '1er Semestre',
  SEMESTRE_2: '2do Semestre',
  ANUAL: 'Anual',
};

export default function ReportCardsPage() {
  const { data: session } = useSession() || {};
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ReportCard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const user = session?.user as { role: string } | undefined;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PROFESOR';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cardsRes, subjectsRes, studentsRes] = await Promise.all([
        fetch('/api/academic/report-cards'),
        fetch('/api/subjects'),
        isAdmin ? fetch('/api/student') : Promise.resolve({ json: () => [] }),
      ]);

      if (cardsRes.ok) setReportCards(await cardsRes.json());
      if (subjectsRes.ok) setSubjects(await subjectsRes.json());
      if (studentsRes && 'ok' in studentsRes && studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data.students || data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async (id: string) => {
    try {
      const res = await fetch(`/api/academic/report-cards/${id}/pdf`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.pdfUrl) {
          window.open(data.pdfUrl, '_blank');
        } else {
          // Fallback to HTML view
          const htmlBlob = await res.blob();
          const url = URL.createObjectURL(htmlBlob);
          window.open(url, '_blank');
        }
        toast.success('PDF generado');
        fetchData();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar PDF');
    }
  };

  const filteredCards = reportCards.filter(card => {
    const matchesSearch = `${card.student.firstName} ${card.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || card.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return 'text-green-600 bg-green-50';
    if (grade >= 7) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Boletas de Calificaciones</h1>
          <p className="text-gray-600 mt-1">Gestiona y genera boletas por período</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Nueva Boleta
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reportCards.length}</p>
              <p className="text-sm text-gray-500">Total Boletas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {reportCards.filter(c => c.status === 'PUBLISHED').length}
              </p>
              <p className="text-sm text-gray-500">Publicadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Edit2 className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {reportCards.filter(c => c.status === 'DRAFT').length}
              </p>
              <p className="text-sm text-gray-500">Borradores</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {reportCards.length > 0 ? 
                  (reportCards.filter(c => c.finalAverage).reduce((sum, c) => sum + (c.finalAverage || 0), 0) / 
                   reportCards.filter(c => c.finalAverage).length).toFixed(1) : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">Promedio General</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Todos los estados</option>
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicada</option>
            <option value="ARCHIVED">Archivada</option>
          </select>
        </div>
      </div>

      {/* Report Cards List */}
      <div className="space-y-4">
        {filteredCards.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No hay boletas</h3>
            <p className="text-gray-500 mt-1">
              {isAdmin ? 'Crea una nueva boleta para comenzar' : 'Aún no hay boletas publicadas'}
            </p>
          </div>
        ) : (
          filteredCards.map(card => (
            <div key={card.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {card.student.firstName} {card.student.lastName}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      card.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                      card.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {card.status === 'PUBLISHED' ? 'Publicada' : 
                       card.status === 'DRAFT' ? 'Borrador' : 'Archivada'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {card.student.group?.name} • {periodLabels[card.period]} • {card.schoolYear}
                  </p>
                  
                  {/* Grades Summary */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {card.grades.slice(0, 5).map((g, idx) => (
                      <span 
                        key={idx} 
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${getGradeColor(g.grade)}`}
                      >
                        {g.subject.name}: {g.grade.toFixed(1)}
                      </span>
                    ))}
                    {card.grades.length > 5 && (
                      <span className="px-3 py-1 rounded-lg text-sm bg-gray-100 text-gray-600">
                        +{card.grades.length - 5} más
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {card.finalAverage && (
                    <div className={`text-3xl font-bold ${getGradeColor(card.finalAverage).split(' ')[0]}`}>
                      {card.finalAverage.toFixed(1)}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCard(card)}
                      className="gap-1"
                    >
                      <Eye className="w-4 h-4" /> Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGeneratePDF(card.id)}
                      className="gap-1"
                    >
                      <Download className="w-4 h-4" /> PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                Boleta de {selectedCard.student.firstName} {selectedCard.student.lastName}
              </h2>
              <p className="text-gray-500">
                {periodLabels[selectedCard.period]} - {selectedCard.schoolYear}
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">
                    {selectedCard.finalAverage?.toFixed(1) || 'N/A'}
                  </p>
                  <p className="text-sm text-blue-600">Promedio</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-700">
                    {selectedCard.attendance?.toFixed(0) || 'N/A'}%
                  </p>
                  <p className="text-sm text-green-600">Asistencia</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-700">
                    {selectedCard.absences} / {selectedCard.tardies}
                  </p>
                  <p className="text-sm text-orange-600">Faltas / Retardos</p>
                </div>
              </div>

              {/* Grades Table */}
              <div>
                <h3 className="font-semibold mb-3">Calificaciones por Materia</h3>
                <div className="space-y-2">
                  {selectedCard.grades.map((g, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: g.subject.color }}
                        />
                        <span className="font-medium">{g.subject.name}</span>
                      </div>
                      <span className={`font-bold ${getGradeColor(g.grade).split(' ')[0]}`}>
                        {g.grade.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              {selectedCard.teacherComments && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Observaciones del Profesor</h4>
                  <p className="text-yellow-700">{selectedCard.teacherComments}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedCard(null)}>
                Cerrar
              </Button>
              <Button onClick={() => handleGeneratePDF(selectedCard.id)} className="gap-2">
                <Download className="w-4 h-4" /> Descargar PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal - Simplified for space */}
      {showCreate && isAdmin && (
        <CreateReportCardModal 
          students={students}
          subjects={subjects}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function CreateReportCardModal({ 
  students, 
  subjects, 
  onClose, 
  onCreated 
}: { 
  students: Student[]; 
  subjects: Subject[]; 
  onClose: () => void; 
  onCreated: () => void;
}) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [schoolYear, setSchoolYear] = useState('2025-2026');
  const [period, setPeriod] = useState('BIMESTRE_1');
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedStudent) {
      toast.error('Selecciona un estudiante');
      return;
    }

    setSaving(true);
    try {
      const gradesArray = Object.entries(grades).map(([subjectId, grade]) => ({
        subjectId,
        grade,
      }));

      const res = await fetch('/api/academic/report-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          schoolYear,
          period,
          grades: gradesArray,
          teacherComments: comments,
        }),
      });

      if (res.ok) {
        toast.success('Boleta creada exitosamente');
        onCreated();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al crear boleta');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear boleta');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Nueva Boleta de Calificaciones</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estudiante</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Seleccionar...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} {s.group ? `(${s.group.name})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ciclo Escolar</label>
              <Input value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Período</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {Object.entries(periodLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Calificaciones</label>
            <div className="space-y-2">
              {subjects.map(subject => (
                <div key={subject.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    />
                    <span>{subject.name}</span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={grades[subject.id] || ''}
                    onChange={(e) => setGrades({ ...grades, [subject.id]: parseFloat(e.target.value) })}
                    className="w-24"
                    placeholder="0-10"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Observaciones</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg h-24"
              placeholder="Comentarios del profesor..."
            />
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Boleta'}
          </Button>
        </div>
      </div>
    </div>
  );
}

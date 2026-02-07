"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  PiggyBank,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  Users,
  Receipt,
  Loader2,
  Edit,
  Trash2,
  Plus,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  parents: Array<{ id: string; name: string; email: string }>;
}

interface Contribution {
  id: string;
  studentId: string;
  amount: number;
  status: string;
  paidAt: string | null;
  paymentMethod: string | null;
  paymentReference: string | null;
  notes: string | null;
  student: Student;
  recordedBy: { id: string; name: string } | null;
}

interface Expense {
  id: string;
  concept: string;
  amount: number;
  receiptUrl: string | null;
  expenseDate: string;
  notes: string | null;
  createdBy: { id: string; name: string };
}

interface Fund {
  id: string;
  title: string;
  description: string | null;
  amountPerStudent: number;
  goalAmount: number | null;
  totalCollected: number;
  dueDate: string | null;
  eventDate: string | null;
  status: string;
  createdAt: string;
  group: {
    id: string;
    name: string;
    students: Student[];
  };
  createdBy: { id: string; name: string };
  contributions: Contribution[];
  expenses: Expense[];
  linkedEvent: { id: string; title: string; startDate: string } | null;
  stats: {
    totalStudents: number;
    paidCount: number;
    pendingCount: number;
    totalCollected: number;
    totalExpenses: number;
    balance: number;
    percentageCollected: number;
  };
}

export default function FundDetailPage() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const params = useParams();
  const fundId = params.id as string;

  const [fund, setFund] = useState<Fund | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newExpense, setNewExpense] = useState({
    concept: "",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    notes: ""
  });

  const [paymentData, setPaymentData] = useState({
    status: "PAID",
    paymentMethod: "efectivo",
    paymentReference: "",
    notes: ""
  });

  const user = session?.user as { role?: string; id?: string } | undefined;
  const isVocal = user?.role === "VOCAL" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (session && fundId) {
      fetchFund();
    }
  }, [session, fundId]);

  const fetchFund = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/vocal/funds/${fundId}`);
      if (res.ok) {
        const data = await res.json();
        setFund(data);
      } else {
        toast.error("Colecta no encontrada");
        router.push("/vocal/funds");
      }
    } catch (error) {
      console.error("Error fetching fund:", error);
      toast.error("Error al cargar colecta");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpdate = async () => {
    if (!selectedStudent) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/vocal/funds/${fundId}/contributions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          ...paymentData
        })
      });

      if (res.ok) {
        toast.success("Pago actualizado");
        setShowPaymentModal(false);
        setSelectedStudent(null);
        fetchFund();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al actualizar pago");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Error al actualizar pago");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.concept || !newExpense.amount) {
      toast.error("Completa los campos requeridos");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/vocal/funds/${fundId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense)
      });

      if (res.ok) {
        toast.success("Gasto registrado");
        setShowExpenseModal(false);
        setNewExpense({
          concept: "",
          amount: "",
          expenseDate: new Date().toISOString().split("T")[0],
          notes: ""
        });
        fetchFund();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al registrar gasto");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Error al registrar gasto");
    } finally {
      setSubmitting(false);
    }
  };

  const openPaymentModal = (student: Student) => {
    setSelectedStudent(student);
    const contribution = fund?.contributions.find(c => c.studentId === student.id);
    setPaymentData({
      status: contribution?.status || "PENDING",
      paymentMethod: contribution?.paymentMethod || "efectivo",
      paymentReference: contribution?.paymentReference || "",
      notes: contribution?.notes || ""
    });
    setShowPaymentModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case "EXEMPT":
        return <Badge className="bg-gray-100 text-gray-800">Exento</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4079]"></div>
      </div>
    );
  }

  if (!fund) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/vocal/funds">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{fund.title}</h1>
          <p className="text-gray-600">{fund.group.name}</p>
        </div>
        {isVocal && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowExpenseModal(true)}>
              <Receipt className="w-4 h-4 mr-2" />
              Registrar Gasto
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pagados</p>
                <p className="text-xl font-bold text-green-700">
                  {fund.stats.paidCount}/{fund.stats.totalStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recaudado</p>
                <p className="text-xl font-bold text-blue-700">
                  ${fund.stats.totalCollected.toLocaleString("es-MX")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <Receipt className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Gastos</p>
                <p className="text-xl font-bold text-red-700">
                  ${fund.stats.totalExpenses.toLocaleString("es-MX")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <PiggyBank className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Balance</p>
                <p className="text-xl font-bold text-purple-700">
                  ${fund.stats.balance.toLocaleString("es-MX")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Progreso de recaudación ({fund.stats.percentageCollected}%)
            </span>
            <span className="text-sm font-semibold">
              ${fund.amountPerStudent} por alumno
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${fund.stats.percentageCollected}%` }}
            />
          </div>
          {fund.dueDate && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Fecha límite: {new Date(fund.dueDate).toLocaleDateString("es-MX")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">
            <Users className="w-4 h-4 mr-2" />
            Pagos ({fund.contributions.length})
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <Receipt className="w-4 h-4 mr-2" />
            Gastos ({fund.expenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Padre/Tutor</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Pago</TableHead>
                    {isVocal && <TableHead className="text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fund.group.students.map(student => {
                    const contribution = fund.contributions.find(c => c.studentId === student.id);
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>
                          {student.parents.length > 0
                            ? student.parents[0].name
                            : "-"}
                        </TableCell>
                        <TableCell>
                          ${(contribution?.amount || fund.amountPerStudent).toLocaleString("es-MX")}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(contribution?.status || "PENDING")}
                        </TableCell>
                        <TableCell>
                          {contribution?.paidAt
                            ? new Date(contribution.paidAt).toLocaleDateString("es-MX")
                            : "-"}
                        </TableCell>
                        {isVocal && (
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPaymentModal(student)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Registro de Gastos</CardTitle>
              {isVocal && (
                <Button onClick={() => setShowExpenseModal(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {fund.expenses.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay gastos registrados</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Registrado por</TableHead>
                      <TableHead>Comprobante</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fund.expenses.map(expense => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          {expense.concept}
                          {expense.notes && (
                            <p className="text-xs text-gray-500">{expense.notes}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          -${expense.amount.toLocaleString("es-MX")}
                        </TableCell>
                        <TableCell>
                          {new Date(expense.expenseDate).toLocaleDateString("es-MX")}
                        </TableCell>
                        <TableCell>{expense.createdBy.name}</TableCell>
                        <TableCell>
                          {expense.receiptUrl ? (
                            <a
                              href={expense.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Ver
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Registrar Pago - {selectedStudent?.firstName} {selectedStudent?.lastName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Estado</Label>
              <Select
                value={paymentData.status}
                onValueChange={(value) => setPaymentData({ ...paymentData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">Pagado</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="EXEMPT">Exento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentData.status === "PAID" && (
              <>
                <div>
                  <Label>Método de pago</Label>
                  <Select
                    value={paymentData.paymentMethod}
                    onValueChange={(value) => setPaymentData({ ...paymentData, paymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="deposito">Depósito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Referencia (opcional)</Label>
                  <Input
                    value={paymentData.paymentReference}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentReference: e.target.value })}
                    placeholder="Número de referencia o comprobante"
                  />
                </div>
              </>
            )}

            <div>
              <Label>Notas (opcional)</Label>
              <Textarea
                value={paymentData.notes}
                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                placeholder="Observaciones adicionales..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handlePaymentUpdate}
              disabled={submitting}
              className="bg-[#1B4079] hover:bg-[#1B4079]/90"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Modal */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Gasto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="concept">Concepto *</Label>
              <Input
                id="concept"
                value={newExpense.concept}
                onChange={(e) => setNewExpense({ ...newExpense, concept: e.target.value })}
                placeholder="Ej: Compra de dulces"
              />
            </div>

            <div>
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="expenseDate">Fecha</Label>
              <Input
                id="expenseDate"
                type="date"
                value={newExpense.expenseDate}
                onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={newExpense.notes}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                placeholder="Detalles adicionales..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExpenseModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddExpense}
              disabled={submitting}
              className="bg-[#1B4079] hover:bg-[#1B4079]/90"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Registrar Gasto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

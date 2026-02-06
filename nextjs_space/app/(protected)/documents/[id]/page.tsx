'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  FileSignature,
  Loader2,
  Users,
  Download,
  Shield,
  XCircle,
  Copy,
  Check
} from 'lucide-react';

interface DocumentSignature {
  id: string;
  signedAt: string;
  signatureType: string;
  verificationCode: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface DocumentDetail {
  id: string;
  title: string;
  description: string | null;
  content: string;
  type: string;
  status: string;
  targetRole: string | null;
  expiresAt: string | null;
  completedAt: string | null;
  createdAt: string;
  userSigned: boolean;
  signatureCount: number;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  group: {
    id: string;
    name: string;
  } | null;
  signatures: DocumentSignature[];
  userSignature?: DocumentSignature;
}

const DOCUMENT_TYPES: Record<string, string> = {
  PERMISO: 'Permiso',
  AUTORIZACION: 'Autorización',
  REGLAMENTO: 'Reglamento',
  CONTRATO: 'Contrato',
  CONSTANCIA: 'Constancia',
  CIRCULAR: 'Circular',
  OTRO: 'Otro',
};

const ROLES: Record<string, string> = {
  ADMIN: 'Administrador',
  PROFESOR: 'Profesor',
  PADRE: 'Padre de Familia',
  ALUMNO: 'Alumno',
  VOCAL: 'Vocal de Grupo',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  DRAFT: { label: 'Borrador', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: <FileText className="h-5 w-5" /> },
  PENDING: { label: 'Pendiente de Firma', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: <Clock className="h-5 w-5" /> },
  PARTIALLY_SIGNED: { label: 'Firmado Parcialmente', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: <FileSignature className="h-5 w-5" /> },
  COMPLETED: { label: 'Completado', color: 'text-green-700', bgColor: 'bg-green-100', icon: <CheckCircle className="h-5 w-5" /> },
  EXPIRED: { label: 'Expirado', color: 'text-red-700', bgColor: 'bg-red-100', icon: <AlertCircle className="h-5 w-5" /> },
  CANCELLED: { label: 'Cancelado', color: 'text-gray-500', bgColor: 'bg-gray-100', icon: <XCircle className="h-5 w-5" /> },
};

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [signatureResult, setSignatureResult] = useState<{ verificationCode: string; signedAt: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/documents/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Documento no encontrado');
          router.push('/documents');
          return;
        }
        throw new Error('Error al cargar documento');
      }
      const data = await res.json();
      setDocument(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar documento');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!acceptTerms) {
      toast.error('Debes aceptar los términos para firmar');
      return;
    }

    try {
      setSigning(true);
      const res = await fetch(`/api/documents/${id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signatureType: 'ACCEPT'
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al firmar');
      }

      const result = await res.json();
      setSignatureResult(result.signature);
      toast.success('Documento firmado exitosamente');
      fetchDocument();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al firmar documento');
    } finally {
      setSigning(false);
    }
  };

  const copyVerificationCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Código copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  const canSign = document && 
    !document.userSigned && 
    document.status !== 'DRAFT' && 
    document.status !== 'COMPLETED' && 
    document.status !== 'EXPIRED' && 
    document.status !== 'CANCELLED';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  if (!document) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[document.status] || STATUS_CONFIG.DRAFT;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Back button */}
      <Link href="/documents" className="inline-flex items-center text-gray-600 hover:text-[#1B4079] mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a documentos
      </Link>

      {/* Document Header */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {DOCUMENT_TYPES[document.type] || document.type}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
            {document.description && (
              <p className="text-gray-600 mt-2">{document.description}</p>
            )}
          </div>

          {document.userSigned && document.userSignature && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800">Documento Firmado</p>
              <p className="text-xs text-green-600 mt-1">
                {new Date(document.userSignature.signedAt).toLocaleString('es-MX')}
              </p>
            </div>
          )}
        </div>

        {/* Document Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t pt-4">
          <div>
            <span className="text-gray-500">Creado por</span>
            <p className="font-medium">{document.createdBy.name}</p>
          </div>
          <div>
            <span className="text-gray-500">Fecha de creación</span>
            <p className="font-medium">{new Date(document.createdAt).toLocaleDateString('es-MX')}</p>
          </div>
          {document.expiresAt && (
            <div>
              <span className="text-gray-500">Fecha límite</span>
              <p className="font-medium">{new Date(document.expiresAt).toLocaleDateString('es-MX')}</p>
            </div>
          )}
          <div>
            <span className="text-gray-500">Firmas</span>
            <p className="font-medium flex items-center gap-1">
              <Users className="h-4 w-4" />
              {document.signatureCount}
            </p>
          </div>
        </div>

        {(document.group || document.targetRole) && (
          <div className="flex gap-4 mt-4 text-sm">
            {document.group && (
              <span className="text-gray-600">
                <strong>Grupo:</strong> {document.group.name}
              </span>
            )}
            {document.targetRole && (
              <span className="text-gray-600">
                <strong>Destinatarios:</strong> {ROLES[document.targetRole] || document.targetRole}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Document Content */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contenido del Documento
        </h2>
        <div 
          className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg border"
          dangerouslySetInnerHTML={{ __html: document.content }}
        />
      </div>

      {/* Sign Button */}
      {canSign && (
        <div className="bg-[#1B4079]/5 border border-[#1B4079]/20 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#1B4079] p-3 rounded-full">
              <FileSignature className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Firma Digital Requerida</h3>
              <p className="text-sm text-gray-600">
                Este documento requiere tu firma. Al firmar, aceptas los términos y condiciones descritos.
              </p>
            </div>
            <Button
              onClick={() => setShowSignDialog(true)}
              className="bg-[#1B4079] hover:bg-[#143156]"
            >
              <FileSignature className="h-4 w-4 mr-2" />
              Firmar Documento
            </Button>
          </div>
        </div>
      )}

      {/* Signatures List (Admin only) */}
      {isAdmin && document.signatures.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Firmas Registradas ({document.signatures.length})
          </h2>
          <div className="divide-y">
            {document.signatures.map((sig) => (
              <div key={sig.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{sig.user.name}</p>
                  <p className="text-sm text-gray-500">
                    {sig.user.email} • {ROLES[sig.user.role] || sig.user.role}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(sig.signedAt).toLocaleString('es-MX')}
                  </p>
                  <button
                    onClick={() => copyVerificationCode(sig.verificationCode)}
                    className="text-xs text-[#1B4079] hover:underline flex items-center gap-1 justify-end"
                  >
                    <Copy className="h-3 w-3" />
                    Código: {sig.verificationCode.slice(0, 8)}...
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User's signature verification */}
      {document.userSigned && document.userSignature && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5" />
            Tu firma ha sido registrada
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-700">Fecha de firma</span>
              <p className="font-medium text-green-900">
                {new Date(document.userSignature.signedAt).toLocaleString('es-MX')}
              </p>
            </div>
            <div>
              <span className="text-green-700">Código de verificación</span>
              <div className="flex items-center gap-2">
                <code className="font-mono text-green-900 bg-green-100 px-2 py-1 rounded text-xs">
                  {document.userSignature.verificationCode}
                </code>
                <button
                  onClick={() => copyVerificationCode(document.userSignature!.verificationCode)}
                  className="text-green-700 hover:text-green-900"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-3">
            Guarda este código para verificar tu firma en cualquier momento.
          </p>
        </div>
      )}

      {/* Sign Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Firmar Documento</DialogTitle>
            <DialogDescription>
              Estás a punto de firmar: <strong>{document.title}</strong>
            </DialogDescription>
          </DialogHeader>

          {signatureResult ? (
            <div className="text-center py-4">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ¡Documento Firmado!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Tu firma ha sido registrada exitosamente.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Código de verificación</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="font-mono text-sm bg-white px-3 py-2 rounded border">
                    {signatureResult.verificationCode}
                  </code>
                  <button
                    onClick={() => copyVerificationCode(signatureResult.verificationCode)}
                    className="p-2 hover:bg-gray-200 rounded"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                onClick={() => setShowSignDialog(false)}
                className="mt-4 w-full"
              >
                Cerrar
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Al firmar este documento confirmas que has leído y aceptas su contenido. Esta acción no puede deshacerse.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept-terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <label htmlFor="accept-terms" className="text-sm text-gray-700 cursor-pointer">
                  He leído el documento completo y acepto su contenido. Entiendo que mi firma digital tiene validez legal.
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSignDialog(false)}
                  className="flex-1"
                  disabled={signing}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSign}
                  disabled={!acceptTerms || signing}
                  className="flex-1 bg-[#1B4079] hover:bg-[#143156]"
                >
                  {signing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <FileSignature className="h-4 w-4 mr-2" />
                  )}
                  Firmar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

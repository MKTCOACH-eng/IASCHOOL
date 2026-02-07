"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  Image as ImageIcon, Plus, Upload, X, Calendar, Users, Eye, EyeOff,
  Loader2, ChevronLeft, ChevronRight, Download, Tag, Trash2, User,
  Camera, FolderOpen, Search, Globe, Lock, UserCheck, Sparkles, Settings, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-context";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  takenAt: string | null;
  tags: {
    id: string;
    studentId: string | null;
    student: { id: string; firstName: string; lastName: string } | null;
  }[];
}

interface Album {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  eventDate: string | null;
  visibility: "PUBLIC" | "GROUP_ONLY" | "PRIVATE";
  photoCount: number;
  group: { id: string; name: string } | null;
  createdBy: { name: string };
  photos?: Photo[];
  _count?: { photos: number };
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

export default function GalleryPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Modals
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedPhotoForTag, setSelectedPhotoForTag] = useState<Photo | null>(null);
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // AI Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingPhotoId, setAnalyzingPhotoId] = useState<string | null>(null);
  const [showProfilesModal, setShowProfilesModal] = useState(false);
  const [studentsWithPhotos, setStudentsWithPhotos] = useState<{students: any[], stats: any}>({ students: [], stats: {} });
  
  // Form
  const [albumForm, setAlbumForm] = useState({
    title: "", description: "", groupId: "", visibility: "PUBLIC", eventDate: ""
  });

  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const isTeacher = (session?.user as any)?.role === "PROFESOR";
  const canManage = isAdmin || isTeacher;

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [session, status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [albumsRes, groupsRes] = await Promise.all([
        fetch("/api/gallery/albums"),
        fetch("/api/groups/my-groups")
      ]);

      if (albumsRes.ok) setAlbums(await albumsRes.json());
      if (groupsRes.ok) {
        const data = await groupsRes.json();
        setGroups(data.map((g: any) => ({ id: g.id, name: g.name })));
      }

      // Fetch students for tagging (admins/teachers only)
      if (canManage) {
        const studentsRes = await fetch("/api/academic/students");
        if (studentsRes.ok) setStudents(await studentsRes.json());
      }
    } catch (error) {
      console.error("Error fetching gallery data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbum = async (id: string) => {
    try {
      const res = await fetch(`/api/gallery/albums/${id}`);
      if (res.ok) {
        const album = await res.json();
        setSelectedAlbum(album);
      }
    } catch (error) {
      console.error("Error fetching album:", error);
    }
  };

  const filteredAlbums = albums.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.description?.toLowerCase().includes(search.toLowerCase())
  );

  const createAlbum = async () => {
    if (!albumForm.title) {
      toast.error("T\u00edtulo requerido");
      return;
    }
    try {
      const res = await fetch("/api/gallery/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(albumForm)
      });
      if (res.ok) {
        toast.success("\u00c1lbum creado");
        setShowAlbumModal(false);
        setAlbumForm({ title: "", description: "", groupId: "", visibility: "PUBLIC", eventDate: "" });
        fetchData();
      }
    } catch (error) {
      toast.error("Error al crear \u00e1lbum");
    }
  };

  const uploadPhotos = async (files: FileList) => {
    if (!selectedAlbum) return;
    setUploading(true);
    setUploadProgress(0);

    const total = files.length;
    let uploaded = 0;

    for (const file of Array.from(files)) {
      try {
        // Get presigned URL
        const presignedRes = await fetch("/api/upload/presigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            isPublic: true
          })
        });

        if (!presignedRes.ok) continue;
        const { uploadUrl, cloud_storage_path } = await presignedRes.json();

        // Upload to S3
        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type }
        });

        // Get public URL from the presigned URL (remove query params)
        const photoUrl = uploadUrl.split('?')[0];
        
        await fetch("/api/gallery/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            albumId: selectedAlbum.id,
            url: photoUrl,
            thumbnailUrl: photoUrl
          })
        });

        uploaded++;
        setUploadProgress(Math.round((uploaded / total) * 100));
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    setUploading(false);
    toast.success(`${uploaded} fotos subidas`);
    fetchAlbum(selectedAlbum.id);
  };

  const deletePhoto = async (photoId: string) => {
    if (!confirm("\u00bfEliminar esta foto?")) return;
    try {
      const res = await fetch(`/api/gallery/photos?id=${photoId}`, { method: "DELETE" });
      if (res.ok && selectedAlbum) {
        toast.success("Foto eliminada");
        fetchAlbum(selectedAlbum.id);
      }
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const tagStudent = async (studentId: string) => {
    if (!selectedPhotoForTag) return;
    try {
      const res = await fetch(`/api/gallery/photos/${selectedPhotoForTag.id}/tag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId })
      });
      if (res.ok) {
        toast.success("Estudiante etiquetado");
        setShowTagModal(false);
        if (selectedAlbum) fetchAlbum(selectedAlbum.id);
      }
    } catch (error) {
      toast.error("Error al etiquetar");
    }
  };

  // AI Facial Recognition
  const analyzePhoto = async (photoId: string) => {
    setAnalyzingPhotoId(photoId);
    try {
      const res = await fetch(`/api/gallery/photos/${photoId}/analyze`, {
        method: "POST"
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.needsProfiles) {
          toast.error("No hay fotos de perfil de estudiantes. Configura las fotos primero.");
          setShowProfilesModal(true);
          await fetchStudentProfiles();
        } else {
          toast.error(data.error || "Error en el análisis");
        }
        return;
      }

      if (data.tagsCreated > 0) {
        toast.success(`¡${data.tagsCreated} estudiante(s) identificado(s)!`);
        if (selectedAlbum) fetchAlbum(selectedAlbum.id);
      } else if (data.facesDetected > 0) {
        toast.info(`${data.facesDetected} rostro(s) detectado(s), pero no se identificaron estudiantes conocidos.`);
      } else {
        toast.info("No se detectaron rostros en esta foto.");
      }
    } catch (error) {
      toast.error("Error al analizar la foto");
    } finally {
      setAnalyzingPhotoId(null);
    }
  };

  const analyzeAllPhotos = async () => {
    if (!selectedAlbum?.photos?.length) return;
    
    const unprocessedPhotos = selectedAlbum.photos.filter(p => !(p as any).isProcessed);
    if (unprocessedPhotos.length === 0) {
      toast.info("Todas las fotos ya han sido analizadas.");
      return;
    }

    setAnalyzing(true);
    let successCount = 0;
    let tagsCreated = 0;

    for (const photo of unprocessedPhotos) {
      try {
        const res = await fetch(`/api/gallery/photos/${photo.id}/analyze`, {
          method: "POST"
        });
        const data = await res.json();
        
        if (res.ok) {
          successCount++;
          tagsCreated += data.tagsCreated || 0;
        }
      } catch (error) {
        console.error("Error analyzing photo:", photo.id);
      }
    }

    setAnalyzing(false);
    toast.success(`Análisis completado: ${successCount} fotos procesadas, ${tagsCreated} estudiantes identificados.`);
    if (selectedAlbum) fetchAlbum(selectedAlbum.id);
  };

  const fetchStudentProfiles = async () => {
    try {
      const res = await fetch("/api/student/photos");
      if (res.ok) {
        const data = await res.json();
        setStudentsWithPhotos(data);
      }
    } catch (error) {
      console.error("Error fetching student profiles:", error);
    }
  };

  const uploadStudentPhoto = async (studentId: string, file: File) => {
    try {
      // Get presigned URL
      const presignedRes = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: `student-profile-${studentId}-${file.name}`,
          contentType: file.type,
          isPublic: true
        })
      });

      if (!presignedRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, cloud_storage_path } = await presignedRes.json();

      // Upload to S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      });

      // The presigned URL upload already stored the file, we need to get the final URL
      // For public files, construct the S3 URL directly
      const photoUrl = uploadUrl.split('?')[0]; // Get the base URL without query params

      // Update student
      const updateRes = await fetch(`/api/student/${studentId}/photo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl })
      });

      if (updateRes.ok) {
        toast.success("Foto de perfil actualizada");
        await fetchStudentProfiles();
      }
    } catch (error) {
      toast.error("Error al subir la foto");
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "PUBLIC": return <Globe className="w-4 h-4 text-green-500" />;
      case "GROUP_ONLY": return <Users className="w-4 h-4 text-blue-500" />;
      case "PRIVATE": return <Lock className="w-4 h-4 text-red-500" />;
    }
  };

  const photos = selectedAlbum?.photos || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  // Album Detail View
  if (selectedAlbum) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setSelectedAlbum(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver a Galer\u00eda
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                {selectedAlbum.title}
                {getVisibilityIcon(selectedAlbum.visibility)}
              </h1>
              {selectedAlbum.description && (
                <p className="text-gray-500 mt-1">{selectedAlbum.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                {selectedAlbum.eventDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedAlbum.eventDate).toLocaleDateString()}
                  </span>
                )}
                {selectedAlbum.group && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {selectedAlbum.group.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  {photos.length} fotos
                </span>
              </div>
            </div>
            {canManage && (
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={e => e.target.files && uploadPhotos(e.target.files)}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => { fetchStudentProfiles(); setShowProfilesModal(true); }}
                  className="border-[#1B4079] text-[#1B4079] hover:bg-[#1B4079]/10"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Fotos de Perfil
                </Button>
                <Button
                  onClick={analyzeAllPhotos}
                  disabled={analyzing || !photos.length}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Análisis IA
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-[#1B4079] hover:bg-[#4D7C8A]"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Fotos
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay fotos en este \u00e1lbum</p>
            {canManage && (
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 bg-[#1B4079] hover:bg-[#4D7C8A]"
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Fotos
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => { setLightboxIndex(index); setShowLightbox(true); }}
              >
                <Image
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.caption || "Photo"}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                {/* Tags indicator */}
                {photo.tags.length > 0 && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    <UserCheck className="w-3 h-3" />
                    {photo.tags.length}
                  </div>
                )}
                {/* Actions overlay */}
                {canManage && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={e => { e.stopPropagation(); analyzePhoto(photo.id); }}
                      disabled={analyzingPhotoId === photo.id}
                      className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full hover:from-purple-700 hover:to-indigo-700 text-white"
                      title="Análisis IA"
                    >
                      {analyzingPhotoId === photo.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedPhotoForTag(photo); setShowTagModal(true); }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                      title="Etiquetar manualmente"
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); deletePhoto(photo.id); }}
                      className="p-2 bg-white rounded-full hover:bg-red-50 text-red-500"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {showLightbox && photos[lightboxIndex] && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={() => setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length)}
              className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={() => setLightboxIndex((lightboxIndex + 1) % photos.length)}
              className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <div className="max-w-4xl max-h-[90vh] relative">
              <Image
                src={photos[lightboxIndex].url}
                alt={photos[lightboxIndex].caption || "Photo"}
                width={1200}
                height={800}
                className="object-contain max-h-[90vh]"
              />
              {/* Tags */}
              {photos[lightboxIndex].tags.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                  {photos[lightboxIndex].tags.map(tag => tag.student && (
                    <span key={tag.id} className="bg-white/90 text-gray-900 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {tag.student.firstName} {tag.student.lastName}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="absolute bottom-4 text-white text-sm">
              {lightboxIndex + 1} / {photos.length}
            </div>
          </div>
        )}

        {/* Tag Modal */}
        {showTagModal && selectedPhotoForTag && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between">
                <h3 className="font-semibold">Etiquetar Estudiante</h3>
                <button onClick={() => setShowTagModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4">
                <Input
                  placeholder="Buscar estudiante..."
                  className="mb-4"
                />
                <div className="space-y-1 max-h-[50vh] overflow-y-auto">
                  {students.map(student => (
                    <button
                      key={student.id}
                      onClick={() => tagStudent(student.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left"
                    >
                      <div className="w-8 h-8 bg-[#1B4079]/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-[#1B4079]" />
                      </div>
                      <span>{student.firstName} {student.lastName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Profiles Modal for AI Recognition */}
        {showProfilesModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Fotos de Perfil para Reconocimiento Facial
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Sube fotos de perfil de los estudiantes para que la IA pueda identificarlos automáticamente
                  </p>
                </div>
                <button onClick={() => setShowProfilesModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Stats */}
              <div className="p-4 bg-gray-50 border-b grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{studentsWithPhotos.stats.total || 0}</p>
                  <p className="text-xs text-gray-500">Total Estudiantes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{studentsWithPhotos.stats.withPhoto || 0}</p>
                  <p className="text-xs text-gray-500">Con Foto</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{studentsWithPhotos.stats.withoutPhoto || 0}</p>
                  <p className="text-xs text-gray-500">Sin Foto</p>
                </div>
              </div>

              <div className="p-4 overflow-y-auto max-h-[50vh]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {studentsWithPhotos.students.map(student => (
                    <div key={student.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200">
                        {student.photoUrl ? (
                          <Image
                            src={student.photoUrl}
                            alt={`${student.firstName} ${student.lastName}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <User className="w-8 h-8 mb-1" />
                            <span className="text-xs">Sin foto</span>
                          </div>
                        )}
                        
                        {/* Upload overlay */}
                        <label className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadStudentPhoto(student.id, file);
                            }}
                          />
                          <div className="p-2 bg-white rounded-full">
                            <Camera className="w-5 h-5 text-[#1B4079]" />
                          </div>
                        </label>
                        
                        {/* Status indicator */}
                        <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${student.photoUrl ? 'bg-green-500' : 'bg-amber-500'}`} />
                      </div>
                      <p className="text-sm font-medium text-center mt-2 truncate">
                        {student.firstName} {student.lastName}
                      </p>
                      {student.group && (
                        <p className="text-xs text-gray-400 text-center truncate">{student.group.name}</p>
                      )}
                    </div>
                  ))}
                </div>
                
                {studentsWithPhotos.students.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay estudiantes registrados</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  💡 Para mejores resultados, usa fotos frontales claras de cada estudiante.
                  La IA comparará estas fotos con los rostros detectados en el álbum.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Albums List View
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ImageIcon className="w-7 h-7 text-[#1B4079]" />
            {t.nav.gallery || "Galer\u00eda de Fotos"}
          </h1>
          <p className="text-gray-500 mt-1">Momentos y recuerdos escolares</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowAlbumModal(true)} className="bg-[#1B4079] hover:bg-[#4D7C8A]">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo \u00c1lbum
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar \u00e1lbumes..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Albums Grid */}
      {filteredAlbums.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay \u00e1lbumes disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAlbums.map(album => (
            <div
              key={album.id}
              onClick={() => fetchAlbum(album.id)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="aspect-[4/3] bg-gray-100 relative">
                {album.coverUrl ? (
                  <Image src={album.coverUrl} alt={album.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getVisibilityIcon(album.visibility)}
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {album._count?.photos || album.photoCount} fotos
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{album.title}</h3>
                {album.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">{album.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  {album.eventDate && (
                    <span>{new Date(album.eventDate).toLocaleDateString()}</span>
                  )}
                  {album.group && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {album.group.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Album Modal */}
      {showAlbumModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-5 border-b">
              <h3 className="text-lg font-semibold">Nuevo \u00c1lbum</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">T\u00edtulo *</label>
                <Input
                  value={albumForm.title}
                  onChange={e => setAlbumForm({...albumForm, title: e.target.value})}
                  placeholder="Ej: D\u00eda del Ni\u00f1o 2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripci\u00f3n</label>
                <textarea
                  value={albumForm.description}
                  onChange={e => setAlbumForm({...albumForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
                  rows={3}
                  placeholder="Descripci\u00f3n del evento o \u00e1lbum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Evento</label>
                <Input
                  type="date"
                  value={albumForm.eventDate}
                  onChange={e => setAlbumForm({...albumForm, eventDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grupo (opcional)</label>
                <select
                  value={albumForm.groupId}
                  onChange={e => setAlbumForm({...albumForm, groupId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="">Sin grupo espec\u00edfico</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visibilidad</label>
                <div className="space-y-2">
                  {[
                    { value: "PUBLIC", label: "P\u00fablico", desc: "Todos los padres pueden ver", icon: Globe },
                    { value: "GROUP_ONLY", label: "Solo grupo", desc: "Solo padres del grupo", icon: Users },
                    { value: "PRIVATE", label: "Privado", desc: "Solo administradores", icon: Lock }
                  ].map(opt => (
                    <label key={opt.value} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                      albumForm.visibility === opt.value ? "border-[#1B4079] bg-[#1B4079]/5" : "border-gray-200"
                    }`}>
                      <input
                        type="radio"
                        name="visibility"
                        value={opt.value}
                        checked={albumForm.visibility === opt.value}
                        onChange={e => setAlbumForm({...albumForm, visibility: e.target.value})}
                        className="hidden"
                      />
                      <opt.icon className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-sm">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <Button variant="outline" onClick={() => setShowAlbumModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={createAlbum} className="flex-1 bg-[#1B4079] hover:bg-[#4D7C8A]">
                Crear \u00c1lbum
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
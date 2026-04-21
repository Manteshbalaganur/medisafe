'use client';

import { useState, useRef } from 'react';
import { useStore, Medicine, Interaction } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, Camera, FileText, CheckCircle, AlertTriangle, Loader2, Sparkles, Plus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addPrescription } = useStore();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && (dropped.type.startsWith('image/') || dropped.type === 'application/pdf')) {
      setFile(dropped);
      setError(null);
      if (dropped.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(dropped);
      } else {
        setPreview(null);
      }
    } else {
      setError("Please upload an image or PDF file.");
    }
  };

  const analyzeFile = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (res.ok) {
        // Map FastAPI response to Store Prescription type
        const mappedResult = {
          id: data.id,
          dateAdded: new Date().toISOString(),
          overallScore: data.data.safety_score,
          fullExplanation: data.data.explanation,
          medicines: data.data.medicines.map((m: any) => ({
            id: Math.random().toString(36).substring(7),
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            purpose: m.purpose,
            instructions: m.precautions || "Take as directed",
            warnings: [],
            sideEffects: []
          })),
          interactions: [
            {
              medicines: data.data.medicines.map((m: any) => m.name),
              description: data.data.drug_drug_interactions,
              severity: data.data.safety_score === "Risk" ? "High" : data.data.safety_score === "Caution" ? "Medium" : "Low"
            }
          ] as Interaction[]
        };
        setResult(mappedResult);
      } else {
        throw new Error(data.detail || "Analysis failed");
      }
    } catch (err: any) {
      setError("Failed to analyze prescription. " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (result) {
      addPrescription(result);
      router.push(`/prescription/${result.id}`);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 mt-16 max-w-5xl space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Upload Prescription</h1>
          <p className="text-slate-500 mt-2 font-medium">Let your AI model securely extract and analyze your medications.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <div className="space-y-6">
          <Card 
            className={`border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${file ? 'border-teal-400 bg-teal-50/30 shadow-md ring-4 ring-teal-50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <CardContent className="flex flex-col items-center justify-center min-h-[320px] p-8 text-center relative">
              {file ? (
                <div className="space-y-6 w-full flex flex-col items-center z-10">
                  {preview ? (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200">
                      <img src={preview} alt="Preview" className="h-40 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent flex items-end p-3">
                         <p className="text-white text-xs font-medium truncate">{file.name}</p>
                      </div>
                    </motion.div>
                  ) : (
                    <FileText className="h-16 w-16 text-teal-500 mx-auto" />
                  )}
                  
                  <div className="flex gap-3 w-full max-w-xs">
                    <Button variant="outline" className="flex-1 bg-white border-slate-200" onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); setPreview(null); }}>
                      Clear
                    </Button>
                    <Button className="flex-1 bg-teal-600 hover:bg-teal-700 shadow-sm" onClick={(e) => { e.stopPropagation(); analyzeFile(); }} disabled={isAnalyzing}>
                      {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /></> : <><Sparkles className="w-4 h-4 mr-2" /> Analyze</>}
                    </Button>
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 flex flex-col items-center z-10">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-2">
                    <UploadCloud className="h-7 w-7 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Select a file or drag and drop</h3>
                    <p className="text-sm text-slate-500 mt-1 font-medium">JPG, PNG or PDF, file size no more than 10MB</p>
                  </div>
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 mt-2">Browse Files</Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
          
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
          
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-rose-50 text-rose-700 text-sm font-medium rounded-xl border border-rose-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
        </div>

        {/* AI Analysis Area */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm"
              >
                <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-slate-100 border-t-teal-500 border-r-teal-500"
                  />
                  <Sparkles className="w-8 h-8 text-teal-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">Backend AI is analyzing...</h3>
                <p className="text-sm font-medium text-slate-500 mt-2 text-center max-w-xs">Extracting medical entities and dosages using your local AI model.</p>
              </motion.div>
            ) : result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="h-full"
              >
                <Card className="border-teal-200 shadow-lg shadow-teal-500/5 bg-white h-full flex flex-col overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-5 flex justify-between items-center text-white shrink-0">
                    <h3 className="font-semibold flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Analysis Complete</h3>
                    <Badge variant="outline" className="bg-white/20 text-white border-transparent hover:bg-white/30 font-medium">
                      {result.overallScore}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-0 flex-1 overflow-y-auto">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">{result.fullExplanation}</p>
                    </div>
                    
                    <div className="p-5">
                      <h4 className="font-semibold text-slate-900 mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                        Extracted Medications <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200">{result.medicines.length}</Badge>
                      </h4>
                      <div className="space-y-3">
                        {result.medicines.map((med: any, i: number) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-200 transition-colors gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 hidden sm:flex">
                              💊
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-slate-900 tracking-tight">{med.name} <span className="text-teal-600 ml-1 font-semibold">{med.dosage}</span></p>
                              <p className="text-xs font-medium text-slate-500 mt-1">{med.instructions} • {med.frequency}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  
                  <div className="p-5 border-t border-slate-100 bg-white shrink-0 flex gap-3">
                    <Button variant="outline" className="flex-1 bg-white border-slate-200" onClick={() => setResult(null)}>Discard</Button>
                    <Button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white shadow-sm" onClick={handleSave}>
                      Save & View Details <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <div className="absolute inset-0 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm mb-4">
                  <Sparkles className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Waiting for upload</h3>
                <p className="text-sm font-medium text-slate-500 mt-2 max-w-[200px]">Upload a prescription to see the backend AI analysis results here.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exporta el nodo referenciado (plantilla PDF en DOM) a un archivo PDF.
 */
const usePDFExport = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const pdfRef = useRef(null);

  const generatePDF = useCallback(async (mealPlan, patient) => {
    if (!pdfRef.current) {
      setError('PDF reference not found');
      return { success: false, error: 'PDF reference not found' };
    }

    setIsGenerating(true);
    setError(null);

    try {
      const element = pdfRef.current;
      await new Promise((r) => setTimeout(r, 200));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector('.pdf-meal-plan');
          if (el) {
            el.style.opacity = '1';
            el.style.visibility = 'visible';
            el.style.position = 'relative';
            el.style.left = '0';
            el.style.top = '0';
          }
        },
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 15;
      const contentWidth = pdfWidth - 2 * margin;
      const contentHeight = pdfHeight - 2 * margin;

      const imgWmm = contentWidth;
      const imgHmm = (canvas.height * contentWidth) / canvas.width;
      const scale = Math.min(1, contentHeight / imgHmm);
      const drawW = imgWmm * scale;
      const drawH = imgHmm * scale;
      const offsetX = margin + (contentWidth - drawW) / 2;
      const offsetY = margin + (contentHeight - drawH) / 2;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      const headerText = `NutriPro — ${patient?.firstName || 'Paciente'} ${patient?.lastName || ''}`;
      pdf.text(headerText, pdfWidth / 2, 9, { align: 'center' });

      pdf.addImage(imgData, 'PNG', offsetX, offsetY + 4, drawW, drawH);

      const date = new Date().toISOString().split('T')[0];
      const patientName = patient
        ? `${patient.firstName || ''}_${patient.lastName || ''}`.replace(/\s+/g, '_').replace(/_+$/, '') || 'paciente'
        : 'paciente';
      const planName = (mealPlan?.name || 'plan').replace(/\s+/g, '_').substring(0, 40);
      const filename = `${planName}_${patientName}_${date}.pdf`;
      pdf.save(filename);

      return { success: true, filename };
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err.message || 'Error al generar el PDF');
      return { success: false, error: err.message };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    pdfRef,
    isGenerating,
    error,
    generatePDF,
  };
};

export default usePDFExport;

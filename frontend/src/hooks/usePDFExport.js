import { useState, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Custom hook for exporting meal plans to PDF
 * @returns {Object} - PDF export utilities
 */
const usePDFExport = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const pdfRef = useRef(null);

    const generatePDF = useCallback(async (mealPlan, patient) => {
        if (!pdfRef.current) {
            setError('PDF reference not found');
            return null;
        }

        setIsGenerating(true);
        setError(null);

        try {
            // Get the PDF content element
            const element = pdfRef.current;

            // Wait a bit for any images to load
            await new Promise(resolve => setTimeout(resolve, 100));

            // Convert the HTML element to canvas with higher quality
            const canvas = await html2canvas(element, {
                scale: 2.5, // Higher quality for better text rendering
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
            });

            // PDF dimensions for A4
            const pdfWidth = 210; // A4 width in mm
            const pdfHeight = 297; // A4 height in mm
            const margin = 15; // 15mm margins on all sides
            const contentWidth = pdfWidth - (2 * margin);
            const contentHeight = pdfHeight - (2 * margin);

            // Calculate image dimensions
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * contentWidth) / canvas.width;

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgData = canvas.toDataURL('image/png', 1.0);

            let heightLeft = imgHeight;
            let position = 0;
            let pageNumber = 1;

            // Helper function to add header on each page
            const addPageHeader = (pdf, pageNum) => {
                // Add a simple header line
                pdf.setFontSize(10);
                pdf.setTextColor(100, 100, 100);
                const headerText = `Plan Nutricional - ${patient?.firstName || 'Paciente'} ${patient?.lastName || ''} - Página ${pageNum}`;
                pdf.text(headerText, pdfWidth / 2, 10, { align: 'center' });

                // Add a line below header
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.5);
                pdf.line(margin, 12, pdfWidth - margin, 12);
            };

            // Add first page with content
            pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
            heightLeft -= contentHeight;

            // Add additional pages if content is longer than one page
            while (heightLeft > 0) {
                pageNumber++;
                position = -(imgHeight - heightLeft);

                pdf.addPage();

                // Add header to new page
                addPageHeader(pdf, pageNumber);

                // Add content with proper positioning
                // Start content below header (at margin + header space)
                const contentStartY = margin + 5; // 5mm extra space after header
                pdf.addImage(imgData, 'PNG', margin, position + contentStartY, imgWidth, imgHeight);

                heightLeft -= (contentHeight - 5); // Subtract space used by header
            }

            // Generate filename
            const date = new Date().toISOString().split('T')[0];
            const patientName = patient
                ? `${patient.firstName}_${patient.lastName}`.replace(/\s+/g, '_')
                : 'paciente';
            const planName = mealPlan.name
                ? mealPlan.name.replace(/\s+/g, '_').substring(0, 30)
                : 'plan';

            const filename = `${planName}_${patientName}_${date}.pdf`;

            // Save the PDF
            pdf.save(filename);

            setIsGenerating(false);
            return { success: true, filename };

        } catch (err) {
            console.error('Error generating PDF:', err);
            setError(err.message || 'Error al generar el PDF');
            setIsGenerating(false);
            return { success: false, error: err.message };
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

import { jsPDF } from "jspdf";

export async function convertImageToPDF(imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result;

            img.onload = function () {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                const maxWidth = 800;
                const maxHeight = 1000;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const aspectRatio = width / height;
                    if (width > height) {
                        width = maxWidth;
                        height = maxWidth / aspectRatio;
                    } else {
                        height = maxHeight;
                        width = maxHeight * aspectRatio;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                const compressedImage = canvas.toDataURL("image/jpeg", 0.8); // 80% compression rate

                const pdf = new jsPDF({
                    orientation: width > height ? "landscape" : "portrait",
                    unit: "px",
                    format: [width, height]
                });

                pdf.addImage(compressedImage, "JPEG", 0, 0, width, height);

                const originalName = imageFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
                const pdfFileName = `${originalName}.pdf`;

                const pdfBlob = pdf.output("blob");

                const pdfFile = new File([pdfBlob], pdfFileName, { type: "application/pdf" });

                resolve(pdfFile);
            };
        };

        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(imageFile);
    });
}

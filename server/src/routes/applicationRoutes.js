router.post("/:id/generate-pdf", restrictTo("admin"), generateApplicationPdf);

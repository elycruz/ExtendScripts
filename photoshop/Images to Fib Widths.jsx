(function () {
    
    var originalRulerUnits = app.preferences.rulerUnits,
    
    // suffixes and widths map to resize to
    imagePrefixesSizes = {
		'-12': 4181,
        '-8': 2548,
        '-7': 1597,
        '-6': 987,
        '-5': 610,
        '-4': 377,
        '-3': 233,
        '-2': 144,
        '-1': 89
    },

    outputFolderSrcName = "JPEGs",
    
    allowedImageTypesRegex = /\.(jpg|jpeg|png|tiff|bmp)$/i;

    app.preferences.rulerUnits = Units.PIXELS;

    function ensureOutputFolderFromActiveDoc () {
        var outFolder = new Folder(app.activeDocument.path + '/' + outputFolderSrcName);
        outFolder.create();
    }

    function exportAsJpeg( inFileName, inQuality, inEmbedICC ) {
        inEmbedICC = inEmbedICC || false;
        inQuality = inQuality || 12;        
        var exportOptions = new ExportOptionsSaveForWeb;
        exportOptions.quality = 60;
        exportOptions.format = SaveDocumentType.JPEG;
        exportOptions.includeProfile = inEmbedICC;
        app.activeDocument.exportDocument( File( inFileName ),  ExportType.SAVEFORWEB, exportOptions );
    }

    function resizeImageWithinLimits(width) {
        var file = app.activeDocument,
        tH;
        if (file.height > file.width) {
           tH = width * file.height / file.width;     
           app.activeDocument.resizeImage(width, tH);
        }
        else {
            app.activeDocument.resizeImage(width);
        }
    }

    function splitActiveDocFileName() {
        var fileName = app.activeDocument.name,
            extMatch = allowedImageTypesRegex.exec(fileName);
        return {
            fileName: fileName.split(fileName.lastIndexOf('.'))[0],
            extension: extMatch !== null ? extMatch[0] : ['']
        };
    }

    function init () {
        var w,
        
        fileParts, filesList, key,
        savedHistoryState;
        
        // Choose source images
        filesList = app.openDialog();
    
        // Loop through image list
        for (file in filesList) {
            app.activeDocument = app.open(filesList[file]);;
            ensureOutputFolderFromActiveDoc();
            fileParts = splitActiveDocFileName();            
            savedHistoryState = app.activeDocument.activeHistoryState;
            
            if (allowedImageTypesRegex.test(fileParts.extension)) {                    
                
                // Save an image for each prefix size
                for (key in imagePrefixesSizes) {
                    
                    // Resize image within limits
                    resizeImageWithinLimits(imagePrefixesSizes[key]);
     
                    // Save image
                    exportAsJpeg(app.activeDocument.path + '/' + outputFolderSrcName 
                        + '/' + fileParts.fileName + key + '.jpg');
                }

                // Reset doc changes
                app.activeDocument.activeHistoryState = savedHistoryState;
                app.activeDocument.coordinate = savedHistoryState;
                
                // Close active document
                app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
            }
        }
    
        // Release meomo
        w = fileParts = filesList = key = null;
    }

    // Run image resize and save process
    init ();

    // Reset ruler units
    app.preferences.rulerUnits = originalRulerUnits;

    // Release memory
    imagePrefixesSizes = allowedImageTypesRegex = 
        originalRulerUnits = outputFolderSrcName = null;

})();

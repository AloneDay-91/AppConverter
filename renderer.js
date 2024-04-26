const { ipcRenderer, shell } = require('electron');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

let inputFolder = null; // Dossier source
let outputFolder = null; // Dossier de sortie

// Afficher la fenêtre modale
function showModal(message) {
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    modalMessage.textContent = message;
    modal.style.display = 'flex'; // Afficher la modale
}

// Masquer la fenêtre modale
function hideModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// Afficher la barre de progression
function showProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    progressBar.value = 0; // Réinitialiser
    progressBar.style.display = 'block'; // Afficher la barre
}

// Masquer la barre de progression
function hideProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.display = 'none'; // Masquer la barre
}

// Mettre à jour la barre de progression
function updateProgressBar(value, max) {
    const progressBar = document.getElementById('progress-bar');
    progressBar.value = value; // Mettre à jour la valeur
    progressBar.max = max; // Définir la valeur maximale
}

// Vérifier si le bouton Convertir doit être affiché
function checkIfCanConvert() {
    const hasInputFolder = inputFolder !== null;
    const hasOutputFolder = outputFolder !== null;
    const convertButton = document.getElementById('convert');

    convertButton.style.display = (hasInputFolder && hasOutputFolder) ? 'block' : 'none';
}

// Sélection du dossier source
document.getElementById('select-input-folder').addEventListener('click', () => {
    ipcRenderer.send('select-folder-input'); // Demander la sélection du dossier source
});

// Dossier source sélectionné
ipcRenderer.on('folder-input-selected', (event, folderPath) => {
    inputFolder = folderPath;
    document.getElementById('selected-input-folder').textContent = `Dossier source : ${folderPath}`;
    checkIfCanConvert(); // Vérifier si le bouton "Convertir" doit être affiché
});

// Sélection du dossier de sortie
document.getElementById('select-folder').addEventListener('click', () => {
    ipcRenderer.send('select-folder-output'); // Demander la sélection du dossier de sortie
});

// Dossier de sortie sélectionné
ipcRenderer.on('folder-output-selected', (event, folderPath) => {
    outputFolder = folderPath;
    document.getElementById('selected-folder').textContent = `Dossier de sortie : ${folderPath}`;
    checkIfCanConvert(); // Vérifier si le bouton "Convertir" doit être affiché
});

// Lorsqu'on clique sur "Convertir"
document.getElementById('convert').addEventListener('click', async () => {
    if (!inputFolder || !outputFolder) {
        return;
    }

    // Afficher la fenêtre modale et la barre de progression
    showModal('Conversion en cours...');
    showProgressBar(); // Afficher la barre de progression

    fs.readdir(inputFolder, async (err, files) => {
        if (err) {
            document.getElementById('status').textContent = `Erreur : ${err.message}`;
            return;
        }

        const totalFiles = files.length; // Nombre total de fichiers
        let processedFiles = 0; // Nombre de fichiers traités

        const format = document.getElementById('format').value;

        for (const file of files) {
            const inputPath = path.join(inputFolder, file);

            // Vérifier si le fichier est une image
            const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
            if (!validExtensions.includes(path.extname(inputPath).toLowerCase())) {
                continue; // Ignorer les fichiers non-images
            }

            const outputPath = path.join(outputFolder, `${path.basename(file, path.extname(file))}.${format}`);

            try {
                await sharp(inputPath).toFile(outputPath); // Conversion de l'image
                processedFiles++; // Augmenter le compteur
                updateProgressBar(processedFiles, totalFiles); // Mettre à jour la barre de progression
            } catch (error) {
                document.getElementById('status').textContent = `Erreur lors de la conversion : ${error.message}`;
                console.error(`Erreur lors de la conversion : ${error.message}`);
            }
        }

        document.getElementById('modal-message').textContent = 'Conversion terminée.';
        hideProgressBar(); // Masquer la barre de progression
        document.getElementById('open-folder').style.display = 'inline-block'; // Afficher le bouton pour ouvrir le dossier
    });
});

// Lorsqu'on clique sur le bouton pour ouvrir le dossier de sortie
document.getElementById('open-folder').addEventListener('click', () => {
    if (outputFolder) {
        shell.openPath(outputFolder); // Ouvrir le dossier de sortie
    }
});

// Lorsqu'on clique sur le bouton "Fermer"
document.getElementById('close-modal').addEventListener('click', hideModal); // Fermer la modale

// On récupère le mode dans l'URL (ex: live.html?mode=EQUIPE)
const urlParams = new URLSearchParams(window.location.search);
const currentMode = urlParams.get('mode') || "SOLO"; // Par défaut SOLO

// On ajoute le mode à l'URL de l'API pour que le Script sache quoi renvoyer
const API_URL = "https://script.google.com/macros/s/AKfycbxlBxpSqv1-oDxlqgm_ZFK8o9FEo0ZGQiRSlEumJLbcNRbUO1nH3qm3HChRALVupFt-/exec" + "?mode=" + currentMode;

async function refreshScores() {
    // --- MISE À JOUR DU TITRE IMMÉDIATE ---
    // On le fait avant le 'try' pour que l'utilisateur voit le changement sans attendre le réseau
    const titleElement = document.getElementById('liveTitle'); // Vérifie bien que ton <h1> a cet ID
    if (titleElement) {
        titleElement.innerText = (currentMode === "EQUIPE") ? "🏆Classement ÉQUIPES🏆" : "🏆Classement SOLO🏆";
    }

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        const statusBadge = document.getElementById('statusBadge');
        if(statusBadge){
            if(data.statut==='OUVERT'){
                if(data.statut === 'OUVERT'){
                    statusBadge.innerText="● Concours Ouvert";
                    statusBadge.style.backgroundColor="#28a745";
                    statusBadge.style.color="white"
                } else{
                    statusBadge.innerText="● Concours Fermé";
                    statusBadge.style.backgroundColor="#dc3545"
                    statusBadge.style.color="white"
                }
            }
        }
        // 1. Mise à jour de l'heure
        const statusDiv = document.getElementById('lastUpdate');
        if (statusDiv) {
            const now = new Date();
            statusDiv.innerText = "Dernière mise à jour : " + now.toLocaleTimeString();
        }

        // 2. Gestion du rideau STOP (basé sur la feuille active : Votes ou Equipes)
        const overlay = document.getElementById('overlayStop');
        if (overlay) {
            overlay.style.display = (data.statut === "OUVERT") ? "none": "flex";
        }

        // 3. Mise à jour de la liste
        const listElement = document.getElementById('leaderboardList');
        const leaderboard = data.scores;

        if (listElement && leaderboard) {
            listElement.innerHTML = ""; 
            
            if (leaderboard.length === 0) {
                listElement.innerHTML = "<li style='text-align:center; padding:20px; font-style:italic;'>Aucun score enregistré pour le moment.</li>";
            } else {
                leaderboard.forEach((player, index) => {
                    const li = document.createElement('li');
                    li.className = "playerRow"; 
                    li.innerHTML = `
                        <div class="rankBadge">${index + 1}</div>
                        <span class="pseudo">${player.pseudo}</span>
                        <span class="score">${player.score} pts</span>
                    `;
                    listElement.appendChild(li);
                });
            }
        }
    } catch (e) {
        console.error("Erreur Live:", e);
        // Optionnel : afficher un message d'erreur discret à l'écran
        const statusDiv = document.getElementById('lastUpdate');
        if (statusDiv) statusDiv.innerText = "⚠️ Erreur de connexion au serveur...";
    }
}

// Rafraîchissement automatique
setInterval(refreshScores, 4000); // 4 sec pour être zen avec les quotas Google
refreshScores();



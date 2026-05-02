const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxlBxpSqv1-oDxlqgm_ZFK8o9FEo0ZGQiRSlEumJLbcNRbUO1nH3qm3HChRALVupFt-/exec";

// 1. DÉTECTION DU MODE ET DU TITRE
const urlParams = new URLSearchParams(window.location.search);
let quizMode = urlParams.get('mode');

if (quizMode && quizMode.toUpperCase() === "EQUIPE") {
    quizMode = "EQUIPE";
    document.getElementById('liveTitle').innerText = "🏆 Classement Équipes 🏆";
} else {
    quizMode = "SOLO";
    document.getElementById('liveTitle').innerText = "🏆 Classement Solo 🏆";
}

// 2. FONCTION PRINCIPALE DE RÉCUPÉRATION
async function updateLeaderboard() {
    const badge = document.getElementById('statusBadge');
    const list = document.getElementById('leaderboardList');
    const overlay = document.getElementById('overlayStop');
    const timeDisplay = document.getElementById('lastUpdate');

    try {
        // Appel au script avec le paramètre mode
        const response = await fetch(`${SCRIPT_URL}?mode=${quizMode}`);
        const data = await response.json();

        // Gestion du badge de statut (OUVERT / FERMÉ)
        if (data.statut === "FERMÉ") {
            badge.innerText = "SESSIONS CLOSES";
            badge.style.background = "#dc3545"; // Rouge
            badge.style.color = "white";
            overlay.style.display = "flex"; // Affiche l'écran de fin
        } else {
            badge.innerText = "QUIZ EN COURS";
            badge.style.background = "#28a745"; // Vert
            badge.style.color = "white";
            overlay.style.display = "none";
        }

        // Mise à jour de l'heure
        const now = new Date();
        timeDisplay.innerText = "Dernière mise à jour : " + now.toLocaleTimeString();

        // Nettoyage et remplissage de la liste
        list.innerHTML = "";
        
        if (data.scores.length === 0) {
            list.innerHTML = "<li class='item'>Aucune donnée pour le moment...</li>";
            return;
        }

        data.scores.forEach((player, index) => {
            const li = document.createElement('li');
            li.className = "item";
            
            // Animation décalée pour chaque ligne
            li.style.animationDelay = (index * 0.1) + "s";

            // Gestion des médailles pour le podium
            let rankLabel = index + 1;
            if (index === 0) rankLabel = "🥇";
            if (index === 1) rankLabel = "🥈";
            if (index === 2) rankLabel = "🥉";

            li.innerHTML = `
                <span class="rank">${rankLabel}</span>
                <span class="pseudo">${player.pseudo}</span>
                <span class="score">${player.score} pts</span>
            `;
            list.appendChild(li);
        });

    } catch (err) {
        console.error("Erreur de connexion :", err);
        badge.innerText = "ERREUR RÉSEAU";
        badge.style.background = "#ffc107"; // Orange/Jaune
    }
}

// 3. LANCEMENT ET RECHARGEMENT AUTO
updateLeaderboard(); // Premier lancement immédiat
setInterval(updateLeaderboard, 10000); // Rafraîchit toutes les 10 secondes
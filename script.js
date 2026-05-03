// --- CONFIGURATION ---
const API_URL = "https://script.google.com/macros/s/AKfycbxlBxpSqv1-oDxlqgm_ZFK8o9FEo0ZGQiRSlEumJLbcNRbUO1nH3qm3HChRALVupFt-/exec";

// Ordre des question. URL modifier pour empecher la triche
const ORDER = ["intro", "27x2p", "3m9w4", "4k5vj", "53b8n"]
const totalQuestions = ORDER.length;

const params = new URLSearchParams(window.location.search)

// Liste Questions: t=texte, r=proposition réponse, ok=réponse, img=image, type=type de quesiton (choice, image, input texte, input number, choix multiple)
const QUESTIONS = {
    "intro": {
        t: "Question 1 : Quelle est la capitale de la France",
        r: ["Lyon", "Marseille", "Paris", "Bordeaux"],
        ok: "Paris",
        img: "images/question1.png",
        type: "choice" // choix multiple
    },
    "27x2p": {
        t: "Question 2: Clique sur le personnage ayant un pull rouge ?",
        r: ["images/Q2i1.png", "images/Q2i2.png", "images/Q2i3.png", "images/Q2i4.png"],
        ok: "images/Q2i2.png",
        img: "images/question2.png",
        type: "image" // image
    },
    "3m9w4": {
        t: "Question 3: Dans quel ville se situe la Tour Eiffel",
        ok: "Paris",
        img: "images/question3.png",
        type: "text" // input texte
    },
    "4k5vj": {
        t: "Question 4: En quelle année a eu lieu la dernière Armada à Rouen",
        ok: "2023",
        img: "images/question4.png",
        type: "number" // input number
    },
    "53b8n": {
        t: "Question 5: Sélectionne les trois premières lettres de l'alphabet?",
        r: ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "A", "N", "O", "P", "Q", "R", "S", "T", "C", "U", "V", "W", "X", "Y", "B", "Z"],
        ok: ["A", "B", "C"],
        img: "images/question5.png",
        type: "multiple" // choix multiple
    },
};

const keys = ORDER
const qId = params.get('q') || keys[0]; // Par défaut question intro


// Chargement de la page.
// Vérification présence d'un pseudo.

window.onload = () => {
    const pseudo = localStorage.getItem('pseudo');
    if (!pseudo && qId !== ORDER[0]) {
        document.getElementById('stepLogin').innerHTML = `
            <div class="error">
                <span class="emoji">🧐</span><br>
                <strong>Erreur de départ</strong><br><br>
                Tu dois scanner l'<strong>Affiche n°1</strong> pour créer ton profil et commencer l'aventure !
            </div>
        `;
        return;
    }
    if (pseudo) {
        checkIfAlreadyDone();
    }
};

// Compte combien de questions sont faites
function getFinishedCount() {
    let count = 0;
    const keys = ORDER;

    keys.forEach(key => {
        if (localStorage.getItem('q_' + key)) {
            count++;
        }
    });

    return count;
}

// --- LOGIQUE ---

// Lancement du quiz
function startQuiz() {
    const user = document.getElementById('username').value.trim();

    // Vérifie si on est bien sur l'affiche 1 (intro)
    if (qId !== ORDER[0]) {
        alert("Désolé ! Tu dois scanner l'affiche n°1 pour commencer le quiz.");
        return; // On arrête tout
    }

    // Vérifie si le pseudo fait plus de 2 lettres
    if (user.length < 2) {
        alert("Choisis un pseudo d'au moins 2 lettres.");
        return;
    }

    localStorage.setItem('pseudo', user);

    // Quiz SOLO par defaut 
    if (!localStorage.getItem('quizMode')) {
        localStorage.setItem('quizMode', 'SOLO');
    }
    checkIfAlreadyDone();
}

// Verifie la progression du joueur

function checkIfAlreadyDone() {
   
    const pseudo = localStorage.getItem('pseudo');
    const keys = ORDER;
    const currentIndex = keys.indexOf(qId)

    
    let nextRequiredIndex = 0;
    // Verification si la question est déjà faite
    for (let i = 0; i < keys.length; i++) {
        // Si la question à déjà été faite on continue de boucler 
        if (localStorage.getItem('q_' + keys[i])) {
            nextRequiredIndex = i + 1;
        } else {
            break;
        }
    }

    // Verification si l'affiche scanner est bien la bonne
    if (currentIndex > nextRequiredIndex) {
        showStep('stepThanks');
        document.getElementById('feedbackMsg').innerHTML = `
            <span class="emoji">✋​</span><br>
            <strong>Pas si vite !</strong><br><br>
            Tu as sauté des étapes. Avant de t'attaquer à l'affiche <strong>${currentIndex + 1}</strong>, 
            tu dois d'abord trouver et répondre à l'<strong>affiche ${nextRequiredIndex + 1}</strong>.<br><br>
            Bonne recherche ! 🔍
        `;
        return;
    }

    // Logique habituelle (déjà fait ou affichage)    
    if (localStorage.getItem('q_' + qId)) {
        
        showStep('stepThanks');

        const finishedCount = getFinishedCount();
        // Si toutes les questions sont terminées alors message de fin
        if (finishedCount >= totalQuestions) {
            document.getElementById('feedbackMsg').innerHTML = `
                Félicitations <span>${pseudo}</span> !<br><br>
                Tu as terminé le quiz ! Rend toi sur le grand écran pour voir ton résultat 🏆
            `;
        } else {
            // Sinon message de progression + prochaine étape
            document.getElementById('feedbackMsg').innerHTML = `
                Hello <span>${pseudo}</span> !<br><br>
                Tu as déjà validé cette affiche.<br>
                Tu as fait <strong>${finishedCount}</strong> question(s) sur <strong>${totalQuestions}</strong>
                Ta prochaine mission est l'<strong>affiche ${nextRequiredIndex + 1}</strong> ! 🏃‍♂️
            `;
        }
    } else {
        // La question n'a jamais été faite on l'affiche
        showQuestion();
    }
}

// Affichage de la question

let selectedOptions = []; 

function showQuestion() {
    
    
    showStep('stepQuiz');
    
    const q = QUESTIONS[qId];

    // Question inexistante, message erreur
    if (!q) {
        document.getElementById('qTitle').innerText = "Question non trouvée.";
        return;
    }

    document.getElementById('qTitle').innerText = q.t;

    const imgElement = document.getElementById('qImg');
    
    if (q.img) {
        imgElement.src = q.img;
        imgElement.classList.remove('hidden');
    } else {
        imgElement.classList.add('hidden');
    }

    const optionsContainer = document.getElementById('qOptions');
    const inputZone = document.getElementById('inputZone');
    const freeInput = document.getElementById('freeInput');
    const validateBtn = inputZone.querySelector('button');

    optionsContainer.innerHTML = "";
    optionsContainer.classList.add('hidden');
    inputZone.classList.remove('hidden'); // TOUJOURS visible
    freeInput.classList.add('hidden');    // Caché par défaut
    selectedOptions = [];

    // Question type texte ou nombre
    if (q.type === "text" || q.type === "number") {

        freeInput.classList.remove('hidden');
        freeInput.type = q.type;
        freeInput.value = "";
        
        validateBtn.onclick = () => validateFreeInput();
        
        setTimeout(() => freeInput.focus(), 100);
    }

    // Question type choix multiples
    else if (q.type === "multiple") {
        optionsContainer.classList.remove('hidden');
        validateBtn.onclick = () => checkMultipleChoice(q);
        optionsContainer.style.flexDirection = "column";
        
        q.r.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'btnOpt';
            btn.innerText = option;
            
            btn.onclick = () => {
                
                btn.classList.toggle('selected');
                
                if (selectedOptions.includes(option)) {
                    
                    selectedOptions = selectedOptions.filter(item => item !== option);
                } else {
                    
                    selectedOptions.push(option);
                }
            };
            optionsContainer.appendChild(btn);
        });
    }

    // Question type choix unique (image ou bouton)
    else {
        optionsContainer.classList.remove('hidden');
        
        validateBtn.onclick = () => {
            
            if (selectedOptions.length === 0) {
                alert("Sélectionne une réponse !");
                return;
            }
            const choice = selectedOptions[0];
            
            submit(choice === q.ok, choice);
        };
        
        q.r.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'btnOpt';
            
            if (q.type === "image") {
                btn.style.flex = "0 1 calc(50% - 5px)";
                btn.style.aspectRatio = "1 / 1";
                btn.innerHTML = `<img class="imgOption" src="${option}">`;
            } else {
                
                btn.innerText = option;
            }
            
            btn.onclick = () => {
                
                document.querySelectorAll('.btnOpt').forEach(b => b.classList.remove('selected'));
                
                btn.classList.add('selected');
                
                selectedOptions = [option];
            };
            
            optionsContainer.appendChild(btn);
        });
    }
}


// Fonction de validation pour question à saisie libre
function validateFreeInput() {
    const q = QUESTIONS[qId];
    // Supression espace inutile (.trim)
    const userVal = document.getElementById('freeInput').value.trim();

    if (!userVal) return;

    // verification si la réponse est bonne, mise en minuscule, conversion en texte et comparaison strictement identique.
    // Retour par true ou false.
    const isCorrect = userVal.toLowerCase() === q.ok.toString().toLowerCase();
   
    submit(isCorrect, userVal);
}

// Fonction de vérification des questions à choix multiples
function checkMultipleChoice(q) {
    
    if (selectedOptions.length === 0) return;
    
    // Verification nombre de selections et si elles sont identiques. 
    const isCorrect = selectedOptions.length === q.ok.length &&
        selectedOptions.every(val => q.ok.includes(val));

    submit(isCorrect, selectedOptions.join(', '));
}

// Fonction d'après validation et transmission au serveur des résultats
function submit(isCorrect, answer) {
    
    const pseudo = localStorage.getItem('pseudo');
    
    const modeActuel = localStorage.getItem('quizMode') || "SOLO";
    
    localStorage.setItem('q_' + qId, 'done');
    
    fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
            pseudo: pseudo,
            questionId: qId,
            isCorrect: isCorrect,
            userAnswer: answer,
            quizMode: modeActuel
        })
    });
    // Nettoyage de l'écran (supression du titre et des boutons)
    document.getElementById('qTitle').innerText = "";
    document.getElementById('qOptions').innerHTML = "";
    
    const imgElement = document.getElementById('qImg');
    if (imgElement) imgElement.classList.add('hidden');

    showStep('stepThanks');

    
    const finishedCount = getFinishedCount();

    // Message sur le nombre de bonne et mauvaise réponse
    const currentMsg = isCorrect ? "<span class='emoji'>😁</span>​<br /> Bonne réponse ! +1 point." : "<span class='emoji'>🙁​</span><br/>​ Mauvaise réponse... Dommage !";

    
    if (finishedCount >= ORDER.length) {
        // Message fin du quiz
        document.getElementById('feedbackMsg').innerHTML = `
            <strong>${currentMsg}</strong><br><br>
            🎉 Félicitations <span>${pseudo}</span> !<br>
            Tu as répondu aux <strong>${totalQuestions}</strong> questions du quiz.<br><br>
            Tu peux maintenant aller voir le classement final sur le grand écran !
        `;
    } else {
        // Message progression
        document.getElementById('feedbackMsg').innerHTML = `
            <strong>${currentMsg}</strong><br><br>
            Bravo <span>${pseudo}</span> !<br>
            Tu as validé <strong>${finishedCount}</strong> question(s) sur <strong>${totalQuestions}</strong> .<br><br>
            Passe à la suite en scannant l'affiche suivante !
        `;
    }
}

// Fonction de gestion des écrans
function showStep(id) {
    
    const steps = ['stepLogin', 'stepQuiz', 'stepThanks'];

    steps.forEach(stepId => {
        
        const el = document.getElementById(stepId);
        
        if (el) {
            if (stepId === id) {
                el.classList.remove('hidden');
                el.style.display = "block"; 
            } else {
                el.classList.add('hidden');
                el.style.display = "none";  
            }
        }
    });
}

// Fonction admin choix mode (code: 2026)-- 1: Solo -- 2: Equipe
function adminReset() {
    
    const code = prompt("Code secret :");
    
    if (code === "2026") {
        
        const choix = prompt("1: Mode SOLO\n2: Mode ÉQUIPE");
        
        let mode;
        
        if (choix === "1") {
            mode = "SOLO"; 
        } else if (choix === "2") {
            mode = "EQUIPE"; 
        } else {
            alert("Choix invalide"); 
            return;
        }

       
        localStorage.clear();
        
        localStorage.setItem('quizMode', mode);
        
        alert("Mode " + mode + " activé. Prêt pour un nouveau pseudo.");
        
        window.location.href = window.location.pathname + "?q=intro";

    } else if (code !== null) {
        
        alert("Code faux");
    }
}

console.log("JS OK")

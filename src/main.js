import './style.scss'
import { Wheel } from './wheel.js'
import modal_data from './data/questions.js';
import confetti from 'canvas-confetti';


const wheelTouch = document.querySelector('.wheel-touchzone');
const wheelElm = wheelTouch.querySelector('#wheel');
const slotAmount = 8;
const slotCap = 600;
let currentQuestion = {};
let currentSlot;


let wheel = new Wheel(wheelTouch);
wheel.slots.setCount(slotAmount); // number of slots on your wheel
wheel.slots.setWeights([1, 1, 1, 1, 1, 1, 1, 1]); // weights for each slot (affects probability)
for (let slot = 1; slot <= slotAmount; slot++) {
    wheel.slots.setSlotCap(slot - 1, slotCap / slotAmount); // per-slot cap (null = no cap)
};

const modal = document.getElementById('modal');
let randomIndex = 0;

let size;
setSize();

clearMessage();

window.addEventListener('resize', setSize);

wheelElm.addEventListener('wheelStop', (e) => {
    // Show the modal
    showModal(e.detail.slot);
});

// document.querySelector(".count-btn").addEventListener('click', updateCap);

document.querySelector('.modal-close').addEventListener('click', closeModal);

// Update answer buttons
modal.querySelectorAll('.answer-button').forEach(button => {
    button.addEventListener('click', handleAnswer);
});

function setSize() {
    size = window.innerHeight / 800;
}

function showModal(slot) {
    InsertQuestion(slot);
    modal.querySelector('.modal-container').classList.add('active');
    modal.classList.add('isVisible');
}

function closeModal() {
    modal.classList.remove('isVisible');
    document.querySelector('.logo_title').src = './assets/Logos/logo.png';
    clearMessage();
}

function InsertQuestion(slot) {
    let category;
    switch (slot) {
        case 4:
        case 7:
            category = "asi_empezo_todo";
            break;
        default:
            category = "tus_favoritos";
    }
    const questions = modal_data.questions[category];
    randomIndex = Math.floor(Math.random() * questions.length);
    const questionObj = questions[randomIndex];

    clearMessage();
    modal.querySelector('.modal-message').style.display = 'block';
    modal.querySelector('.modal-answers').style.display = 'flex';
    modal.querySelector('.modal-message').innerHTML = `<p class="modal-question">${questionObj.question}</p>`;
    currentQuestion = questionObj;
    currentSlot = slot;
}

function handleAnswer(e) {
        const selectedAnswer = parseInt(e.target.getAttribute('data-answer'));
        if (selectedAnswer === currentQuestion.solution) {
            wheel.slots.recordSelection(currentSlot - 1); // Record the selection for the correct answer
            correctAnswer(currentQuestion);
            console.log("correctAnswer", selectedAnswer);
        } else {
            tryAgain(currentQuestion);
            console.log("tryAgain", selectedAnswer);
        }
    }

function clearMessage() {
    modal.querySelector('.modal-container').classList.remove('active');
    modal.querySelector('.modal-container').classList.remove('shake');
    modal.querySelector('.modal-message').style.display = 'none';
    modal.querySelector('.modal-wrapper').style.display = 'none';
    modal.querySelector('.modal-answers').style.display = 'none';
    modal.querySelector('.modal-qr').src = '';
    modal.querySelector('.modal-qr').style.display = 'none';
    modal.querySelector('.modal-response').innerHTML = '';
    modal.classList.remove('correct');
    modal.classList.remove('incorrect');
}

function correctAnswer(q) {
    clearMessage();
    modal.classList.add('correct');
    modal.querySelector('.modal-wrapper').style.display = 'flex';
    modal.querySelector('.modal-prize').src = `./assets/Icons/correct.png`;
    modal.querySelector('#icon-1').src = `./assets/Icons/icon-correct-1.png`;
    modal.querySelector('#icon-2').src = `./assets/Icons/icon-correct-2.png`;
    document.querySelector('.logo_title').src = './assets/Logos/logo_white.png';
    modal.querySelector('.modal-text').innerHTML = modal_data.copy.correct;
    modal.querySelector('.modal-response').innerHTML = "respuesta: <br>" + q.answer;
    modal.querySelector('.modal-qr').src = './assets/qr.jpg';
    modal.querySelector('.modal-qr').style.display = 'block';
    setTimeout(() => {
        confetti({
            particleCount: 200,
            scalar: size,
            spread: 360,
            startVelocity: 35 * size,
            origin: { y: 0.5 },
            colors: ['ff8732', 'ffaa00']
        });
        modal.querySelector('.modal-container').classList.add('active');
    }, 100)
}

function tryAgain(q) {
    clearMessage();
    modal.classList.add('incorrect');
    modal.querySelector('.modal-wrapper').style.display = 'flex';
    modal.querySelector('.modal-prize').src = `./assets/Icons/incorrect.png`;
    modal.querySelector('#icon-1').src = `./assets/Icons/icon-incorrect-1.png`;
    modal.querySelector('#icon-2').src = `./assets/Icons/icon-incorrect-2.png`;
    document.querySelector('.logo_title').src = './assets/Logos/logo_white.png';
    modal.querySelector('.modal-text').innerHTML = modal_data.copy.incorrect;
    modal.querySelector('.modal-response').innerHTML = "respuesta: <br>" + q.answer;
    setTimeout(() => {
        modal.querySelector('.modal-container').classList.add('shake');
    }, 100)
}

function updateCap(e) {
    if (e.currentTarget.classList.contains("isActive")) {
        e.currentTarget.classList.remove("isActive");
        wheel.slots.setSlotCap(bagSlot - 1, 0);
    } else {
        e.currentTarget.classList.add("isActive");
        wheel.slots.setSlotCap(bagSlot - 1, bagCap);
    }
}
import './style.scss'
import { Wheel } from './wheel.js'
import modal_data from './data/questions.js';
import confetti from 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/+esm'

const wheelTouch = document.querySelector('.wheel-touchzone');
const wheelElm = wheelTouch.querySelector('#wheel');
const slotAmount = 8;
const slotCap = 600;

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

// clearMessage();

window.addEventListener('resize', setSize);

wheelElm.addEventListener('wheelStop', (e) => {
    // Show the modal
    showModal(e.detail.slot);
});

// document.querySelector(".count-btn").addEventListener('click', updateCap);

document.querySelector('.modal-close').addEventListener('click', closeModal);

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
}

function InsertQuestion(slot) {
    let category;
    switch (slot) {
        case 1:
        case 7:
            category = "history";
            break;
        case 2:
        case 5:
        case 8:
            category = "brand";
            break;
        case 3:
        case 9:
        case 11:
            category = "sustainability";
            break;
        case 4:
        case 10:
            category = "yogurt";
            break;
        default:
            category = "brand";
    }
    const questions = modal_data.questions[category];
    randomIndex = Math.floor(Math.random() * questions.length);
    const questionObj = questions[randomIndex];

    clearMessage();
    modal.querySelector('.modal-message').style.display = 'block';

    let answersHtml = '';
    questionObj.answers.forEach((answer, index) => {
        answersHtml += `<button class="answer-button" data-answer="${index + 1}">${answer}</button>`;
    });

    modal.querySelector('.modal-message').innerHTML = `
        <p class="modal-question">${questionObj.question}</p>`;
    modal.querySelector('.modal-answers').innerHTML = answersHtml;

    // Add event listeners to answer buttons
    modal.querySelectorAll('.answer-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const selectedAnswer = parseInt(e.target.getAttribute('data-answer'));
            if (selectedAnswer === questionObj.solution) {
                wheel.slots.recordSelection(slot - 1); // Record the selection for the correct answer
                correctAnswer(slot);
            } else {
                tryAgain();
            }
        });
    });
}

function clearMessage() {
    modal.querySelector('.modal-container').classList.remove('active');
    modal.querySelector('.modal-container').classList.remove('shake');
    modal.querySelector('.modal-message').style.display = 'none';
    modal.querySelector('.modal-wrapper').style.display = 'none';
    modal.querySelector('.modal-answers').innerHTML = ``;
}

function correctAnswer(slot) {
    clearMessage();
    let prize;
    let text;
    switch (true) {
        case bagSlot === slot:
            prize = `./assets/answers/answer_bag.png`;
            text = "bag";
            break;
        case toteSlots.includes(slot):
            prize = `./assets/answers/answer_tote.png`;
            text = "tote";
            break;
        case productSlots.includes(slot):
            prize = `./assets/answers/answer_prize.png`;
            text = "prize";
            break;
        default:
            prize = `./assets/answers/answer_sticker.png`;
            text = "sticker";
    }
    modal.querySelector('.modal-wrapper').style.display = 'flex';
    modal.querySelector('.modal-prize').src = prize;
    modal.querySelector('.modal-text').innerHTML = modal_data.copy[text];

    setTimeout(() => {
        confetti({
            particleCount: 200,
            scalar: size,
            spread: 360,
            startVelocity: 35 * size,
            origin: { y: 0.5 },
            colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
        });
        modal.querySelector('.modal-container').classList.add('active');
    }, 100)
}

function tryAgain() {
    clearMessage();
    modal.querySelector('.modal-wrapper').style.display = 'flex';
    modal.querySelector('.modal-title').src = `./assets/titles/title_2.png`;
    modal.querySelector('.modal-prize').src = `./assets/answers/answer_wrong.png`;
    modal.querySelector('.modal-text').innerHTML = modal_data.copy.incorrect;
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
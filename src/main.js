import './style.scss'
import { Wheel } from './wheel.js'
import modal_data from './data/questions.js';

const wheelElm = document.querySelector('.wheel-touchzone');
let wheel = new Wheel(wheelElm);
wheel.slots.setCount(12); // number of slots on your wheel
wheel.slots.setWeights([5, 5, 3, 2, 2, 2, 2, 2, 2, 1, 2, 2]);
wheel.slots.setSlotCap(9, 15); // slot index 9 (slot 10) max 15 selections per 24h
wheel.slots.setSlotCap(4, 1); // slot index 4 (slot 5) max 1 selection per 24h
wheel.slots.setSlotCap(5, 2); // slot index 5 (slot 6) max 2 selections per 24h
const modal = document.getElementById('modal');
let randomIndex = 0;

wheelElm.addEventListener('wheelStop', (e) => {
    // Show the modal
    showModal(e.detail.slot);
});

function showModal(slot) {
    // Implementation for showing the modal
    if (slot === 2) {
        modal.querySelector('.modal-content').innerHTML = `<h2>${modal_data.copy.unlucky}</h2>`;
        wheel.slots.recordSelection(slot - 1); // Record the selection for the unlucky slot
    } else {
        InsertQuestion(slot);
    }
    modal.classList.add('isVisible');
}

function closeModal() {
    modal.classList.remove('isVisible');
}

function InsertQuestion(slot) {
    const questions = modal_data.questions;
    let oldrandomIndex = randomIndex;
    while (oldrandomIndex === randomIndex) {
        randomIndex = Math.floor(Math.random() * questions.length);
    }
    const questionObj = questions[randomIndex];

    let answersHtml = '';
    questionObj.answers.forEach((answer, index) => {
        answersHtml += `<button class="answer-button" data-answer="${index + 1}">${answer}</button>`;
    });

    modal.querySelector('.modal-content').innerHTML = `
                <h2>${questionObj.question}</h2>
                <div class="answers">${answersHtml}</div>
            `;

    // Add event listeners to answer buttons
    modal.querySelectorAll('.answer-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const selectedAnswer = parseInt(e.target.getAttribute('data-answer'));
            if (selectedAnswer === questionObj.solucion) {
                modal.querySelector('.modal-content').innerHTML = `<h2>${modal_data.copy.correct}</h2>`;
                wheel.slots.recordSelection(slot - 1); // Record the selection for the correct answer
            } else {
                modal.querySelector('.modal-content').innerHTML = `<h2>${modal_data.copy.incorrect}</h2>`;
            }
        });
    });
}

document.querySelector('.modal-close').addEventListener('click', closeModal);
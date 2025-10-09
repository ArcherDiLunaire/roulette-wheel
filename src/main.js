import './style.scss'
import { Wheel } from './wheel.js'
import modal_data from './data/questions.js';

const wheelTouch = document.querySelector('.wheel-touchzone');
const wheelElm = wheelTouch.querySelector('#wheel');
let wheel = new Wheel(wheelTouch);
wheel.slots.setCount(12); // number of slots on your wheel
wheel.slots.setWeights([5, 5, 3, 2, 2, 2, 2, 2, 2, 1, 2, 2]);
wheel.slots.setSlotCap(9, 15); // slot index 9 (slot 10) max 15 selections per 24h
wheel.slots.setSlotCap(4, 1); // slot index 4 (slot 5) max 1 selection per 24h
wheel.slots.setSlotCap(5, 2); // slot index 5 (slot 6) max 2 selections per 24h
const modal = document.getElementById('modal');
let randomIndex = 0;

// clearMessage();

wheelElm.addEventListener('wheelStop', (e) => {
    // Show the modal
    showModal(e.detail.slot);
});

document.querySelector('.modal-close').addEventListener('click', closeModal);

function showModal(slot) {
    // Implementation for showing the modal
    if (slot === 2) {
        tryAgain();
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

    clearMessage();
    modal.querySelector('.modal-message').style.display = 'block';

    let answersHtml = '';
    questionObj.answers.forEach((answer, index) => {
        answersHtml += `<button class="answer-button" data-answer="${index + 1}">${answer}</button>`;
    });

    modal.querySelector('.modal-title').src = `/assets/titles/title_1.png`;
    modal.querySelector('.modal-message').innerHTML = `
        <span class="modal-subtitle">Answer the question</span>
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
    modal.classList.remove('isVisible');
    modal.querySelector('.modal-title').src = ``;
    modal.querySelector('.modal-message').style.display = 'none';
    modal.querySelector('.modal-wrapper').style.display = 'none';
    modal.querySelector('.modal-answers').innerHTML = ``;

}

function correctAnswer(slot) {
    clearMessage();
    let prize;
    switch (slot) {
        case 1:
            prize = `/assets/answers/answer_bag.png`;
            break;
        case 1:
            prize = `/assets/answers/answer_tote.png`;
            break;
        case 3:
            prize = `/assets/answers/answer_prize.png`;
            break;
        default:
            prize = `/assets/answers/answer_sticker.png`;
    }
    modal.querySelector('.modal-wrapper').style.display = 'flex';
    modal.querySelector('.modal-title').src = `/assets/titles/title_3.png`;
    modal.querySelector('.modal-prize').src = prize;
    modal.querySelector('.modal-text').innerHTML = `¡Has ganado un producto Danone sorpresa! Dirígete al stand y recógelo.`;
    setTimeout(() => {
        modal.classList.add('isVisible');
    }, 100)
}

function tryAgain() {
    clearMessage();
    modal.querySelector('.modal-wrapper').style.display = 'flex';
    modal.querySelector('.modal-title').src = `/assets/titles/title_2.png`;
    modal.querySelector('.modal-prize').src = `/assets/answers/answer_wrong.png`;
    modal.querySelector('.modal-text').innerHTML = modal_data.copy.incorrect;
    setTimeout(() => {
        modal.classList.add('isVisible');
    }, 100)
}
import './style.scss'
import { Wheel } from './wheel.js'

const wheelElm = document.querySelector('.wheel-touchzone');
let wheel = new Wheel(wheelElm);

wheelElm.addEventListener('wheelStop', (e) => {
    // Show the modal
    showModal(e.detail.slot);
});

function showModal(slot) {
    // Implementation for showing the modal
    console.log('Modal: ', slot);
    const modal = document.getElementById('modal');
    modal.classList.add('isVisible');
    modal.querySelector('.modal-content').innerHTML = `You stopped at slot ${slot}`;
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('isVisible');
}

document.querySelector('.modal-close').addEventListener('click', closeModal);
document.addEventListener('DOMContentLoaded', () => {
    const draggablesContainer = document.querySelector('.draggable-container');
    const dropZones = document.querySelectorAll('.drop-zone');
    const randomNumberBox = document.getElementById('random-number-box');
    const feedbackMessage = document.getElementById('feedback-message');
    const resetButton = document.getElementById('reset-button');

    // Function to generate a random number between 0 and 100
    const generateRandomNumber = () => {
        return Math.floor(Math.random() * 101);
    };

    // Initialize the random number
    let randomNumber = generateRandomNumber();
    randomNumberBox.textContent = randomNumber;

    // Function to handle drag start
    const handleDragStart = (e) => {
        const draggable = e.target;
        const clone = draggable.cloneNode(true); // Create a clone of the draggable element
        clone.classList.add('dragging');
        document.body.appendChild(clone); // Append the clone to the body (temporarily)
        e.dataTransfer.setData('text/plain', ''); // Required for Firefox

        // Set the clone as the drag image
        e.dataTransfer.setDragImage(clone, 0, 0);
    };

    // Add dragstart event to all draggable elements
    const draggables = document.querySelectorAll('.draggable');
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', handleDragStart);
    });

    // Handle drop zones
    dropZones.forEach((zone, index) => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('hovered');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('hovered');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('hovered');
            const clone = document.querySelector('.dragging');

            if (clone) {
                // Middle box validation (only accepts + or -)
                if (index === 1 && !['+', '-'].includes(clone.textContent)) {
                    clone.remove(); // Remove the clone if it's not + or -
                    return;
                }

                // First and third box validation (only accept numbers)
                if ((index === 0 || index === 2) && ['+', '-'].includes(clone.textContent)) {
                    clone.remove(); // Remove the clone if it's an operator
                    return;
                }

                // Ensure the middle box only has one operator
                if (index === 1 && zone.firstChild) {
                    zone.removeChild(zone.firstChild); // Remove existing operator
                }

                // Append the clone to the drop zone
                zone.appendChild(clone);
                clone.classList.remove('dragging');

                // Check the equation after dropping
                checkEquation();
            }
        });
    });

    // Handle dropping outside drop zones
    document.addEventListener('dragover', (e) => {
        e.preventDefault(); // Prevent default to allow drop
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        const clone = document.querySelector('.dragging');
        if (clone) {
            clone.remove(); // Remove the clone if dropped outside drop zones
        }
    });

    // Function to check the equation
    const checkEquation = () => {
        const number1 = dropZones[0].textContent.trim();
        const operator = dropZones[1].textContent.trim();
        const number2 = dropZones[2].textContent.trim();

        if (number1 && operator && number2) {
            const num1 = parseInt(number1, 10);
            const num2 = parseInt(number2, 10);
            let result;

            if (operator === '+') {
                result = num1 + num2;
            } else if (operator === '-') {
                result = num1 - num2;
            }

            if (result === randomNumber) {
                feedbackMessage.textContent = 'Correct! 🎉';
                feedbackMessage.style.color = 'green';

                // Generate a new random number after 1.5 seconds
                setTimeout(() => {
                    randomNumber = generateRandomNumber();
                    randomNumberBox.textContent = randomNumber;

                    // Clear the drop zones
                    dropZones.forEach(zone => {
                        while (zone.firstChild) {
                            zone.removeChild(zone.firstChild);
                        }
                    });

                    // Clear the feedback message
                    feedbackMessage.textContent = '';
                }, 1500); // 1.5 seconds delay
            } else {
                feedbackMessage.textContent = 'Incorrect. Try again! ❌';
                feedbackMessage.style.color = 'red';
            }
        } else {
            feedbackMessage.textContent = '';
        }
    };

    // Reset button functionality
    resetButton.addEventListener('click', () => {
        dropZones.forEach(zone => {
            while (zone.firstChild) {
                zone.removeChild(zone.firstChild); // Delete the dragged elements instead of moving them back
            }
        });
        feedbackMessage.textContent = ''; // Clear feedback message
    });
});
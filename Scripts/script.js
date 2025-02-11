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

    // Function to generate a valid equation with one blank
    const generateEquation = () => {
        const num1 = generateRandomNumber();
        const num2 = generateRandomNumber();
        const operator = Math.random() < 0.5 ? '+' : '-';
        let result;

        if (operator === '+') {
            result = num1 + num2;
        } else {
            result = num1 - num2;
        }

        // Randomly decide which part of the equation will be blank
        const blankPosition = Math.floor(Math.random() * 3); // 0: num1, 1: operator, 2: num2

        return { num1, num2, operator, result, blankPosition };
    };

    // Initialize the equation and random number
    let equation = generateEquation();
    randomNumberBox.textContent = equation.result;

    // Function to display the equation with a blank
    const displayEquation = () => {
        dropZones.forEach((zone, index) => {
            // Clear the drop zone
            while (zone.firstChild) {
                zone.removeChild(zone.firstChild);
            }

            // Display the fixed parts of the equation
            if (index !== equation.blankPosition) {
                const fixedValue = index === 0 ? equation.num1 : index === 1 ? equation.operator : equation.num2;
                const fixedElement = document.createElement('div');
                fixedElement.textContent = fixedValue;
                fixedElement.classList.add('fixed');
                zone.appendChild(fixedElement);
            }
        });
    };

    // Display the initial equation
    displayEquation();

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

            if (clone && !zone.querySelector('.fixed')) { // Only allow dropping in blank zones
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

    // Function to get the concatenated value of all draggable items in a drop zone
    const getConcatenatedValue = (zone) => {
        const draggableItems = zone.querySelectorAll('.draggable');
        let value = '';
        draggableItems.forEach(item => {
            value += item.textContent;
        });
        return value;
    };

    // Function to check the equation
    const checkEquation = () => {
        // Retrieve values from the drop zones
        const number1 = getConcatenatedValue(dropZones[0]) || equation.num1;
        const operator = dropZones[1].querySelector('.draggable')?.textContent || equation.operator;
        const number2 = getConcatenatedValue(dropZones[2]) || equation.num2;

        // Convert values to numbers
        const num1 = parseInt(number1, 10);
        const num2 = parseInt(number2, 10);
        let result;
        
        // Calculate the result based on the operator
        if (operator === '+') {
            result = num1 + num2;
            console.log(num1, operator, num2, "=" ,result );
        } else if (operator === '-') {
            result = num1 - num2;
            console.log(num1, operator, num2, "=" ,result );
        }

        // Compare the result to the random number
        if (result === equation.result) {
            feedbackMessage.textContent = 'Correct! 🎉';
            feedbackMessage.style.color = 'green';

            // Generate a new equation after 1.5 seconds
            setTimeout(() => {
                equation = generateEquation();
                randomNumberBox.textContent = equation.result;
                displayEquation();
                feedbackMessage.textContent = '';
            }, 1500); // 1.5 seconds delay
        } else {
            feedbackMessage.textContent = 'Incorrect. Try again! ❌';
            feedbackMessage.style.color = 'red';
        }
    };

    // Reset button functionality
    resetButton.addEventListener('click', () => {
        equation = generateEquation();
        randomNumberBox.textContent = equation.result;
        displayEquation();
        feedbackMessage.textContent = ''; // Clear feedback message
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('popup');
    const infoButton = document.getElementById('info-button');
    const closePopup = document.getElementById('close-popup');

    // Show the popup on first run
    popup.style.display = 'flex';

    // Toggle popup when the info button is clicked
    infoButton.addEventListener('click', () => {
        popup.style.display = 'flex';
    });

    // Close the popup when the close button is clicked
    closePopup.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    // Close the popup when clicking outside the content
    window.addEventListener('click', (event) => {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });
});


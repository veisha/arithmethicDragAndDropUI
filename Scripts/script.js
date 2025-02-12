document.addEventListener('DOMContentLoaded', () => {
    const draggablesContainer = document.querySelector('.draggable-container');
    const dropZones = document.querySelectorAll('.drop-zone');
    const randomNumberBox = document.getElementById('random-number-box');
    const feedbackMessage = document.getElementById('feedback-message');
    const resetButton = document.getElementById('reset-button');
    const skipButton = document.getElementById('skip-button');
    const submitButton = document.getElementById('submit-button'); // New Submit button

    // Get difficulty and operation from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const difficulty = urlParams.get('difficulty') || 'easy'; // Default to 'easy' if not provided
    const operation = urlParams.get('operation') || 'addition'; // Default to 'addition' if not provided

    let equation;
    let questionCount = 0; // Track the number of questions answered
    let correctAnswers = 0; // Track the number of correct answers
    let startTime; // Track the start time of the game
    let timerInterval; // Track the timer interval

    // Function to generate a random number based on difficulty
    const generateRandomNumber = () => {
        let min, max;
        switch (difficulty) {
            case 'easy':
                min = 1;
                max = 99;
                break;
            case 'medium':
                min = 100;
                max = 9999;
                break;
            case 'hard':
                min = -9999;
                max = 9999;
                break;
            default:
                min = 1;
                max = 99;
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // Function to generate a valid equation with one blank
    const generateEquation = () => {
        const num1 = generateRandomNumber();
        const num2 = generateRandomNumber();
        let result;

        if (operation === 'addition') {
            result = num1 + num2;
        } else if (operation === 'subtraction') {
            result = num1 - num2;
        }

        // Randomly decide which number will be blank (0: num1, 1: num2)
        const blankPosition = Math.floor(Math.random() * 2);

        return { num1, num2, operator: operation === 'addition' ? '+' : '-', result, blankPosition };
    };

    // Function to display the equation with a blank
    const displayEquation = () => {
        dropZones.forEach((zone, index) => {
            // Reset border styles
            zone.style.border = '';

            // Clear the drop zone
            while (zone.firstChild) {
                zone.removeChild(zone.firstChild);
            }

            // Display the fixed parts of the equation
            if (index === 0) {
                // First drop zone: num1 or blank
                if (equation.blankPosition !== 0) {
                    const fixedElement = document.createElement('div');
                    fixedElement.textContent = equation.num1;
                    fixedElement.classList.add('fixed');
                    zone.appendChild(fixedElement);
                }
            } else if (index === 1) {
                // Second drop zone: always display the operator
                const fixedElement = document.createElement('div');
                fixedElement.textContent = equation.operator;
                fixedElement.classList.add('fixed');
                zone.appendChild(fixedElement);
            } else if (index === 2) {
                // Third drop zone: num2 or blank
                if (equation.blankPosition !== 1) {
                    const fixedElement = document.createElement('div');
                    fixedElement.textContent = equation.num2;
                    fixedElement.classList.add('fixed');
                    zone.appendChild(fixedElement);
                }
            }
        });
    };

    // Function to start the game
    const startGame = () => {
        questionCount = 0;
        correctAnswers = 0;
        startTime = Date.now(); // Record the start time
        timerInterval = setInterval(updateTimer, 1000); // Start the timer
        generateNewEquation(); // Generate the first equation
    };

    // Function to generate a new equation
    const generateNewEquation = () => {
        if (questionCount >= 5) {
            endGame(); // End the game after 5 questions
            return;
        }

        equation = generateEquation();
        randomNumberBox.textContent = equation.result;
        displayEquation();
        feedbackMessage.textContent = ''; // Clear feedback message
    };

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
                // Append the clone to the drop zone
                zone.appendChild(clone);
                clone.classList.remove('dragging');
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
        // Determine which drop zone is supposed to be filled by the user
        const blankDropZoneIndex = equation.blankPosition === 0 ? 0 : 2;

        // Check if the required drop zone is filled
        const isBlankDropZoneFilled = dropZones[blankDropZoneIndex].querySelector('.draggable') !== null;

        // Highlight the blank drop zone if it's empty
        if (!isBlankDropZoneFilled) {
            dropZones[blankDropZoneIndex].style.border = '2px solid red';
            feedbackMessage.textContent = 'Please fill in the blank!';
            feedbackMessage.style.color = 'red';
            return; // Exit the function if the blank drop zone is empty
        } else {
            dropZones[blankDropZoneIndex].style.border = ''; // Reset border
        }

        // Retrieve values from the drop zones
        const number1 = getConcatenatedValue(dropZones[0]) || equation.num1;
        const operator = equation.operator; // Operator is fixed based on user selection
        const number2 = getConcatenatedValue(dropZones[2]) || equation.num2;

        // Convert values to numbers
        const num1 = parseInt(number1, 10);
        const num2 = parseInt(number2, 10);
        let result;

        // Calculate the result based on the operator
        if (operator === '+') {
            result = num1 + num2;
        } else if (operator === '-') {
            result = num1 - num2;
        }

        // Compare the result to the random number
        if (result === equation.result) {
            feedbackMessage.textContent = 'Correct! 🎉';
            feedbackMessage.style.color = 'green';
            correctAnswers++; // Increment correct answers
        } else {
            feedbackMessage.textContent = 'Incorrect. Try again! ❌';
            feedbackMessage.style.color = 'red';
        }

        questionCount++; // Increment question count

        // Generate a new equation after 1.5 seconds
        setTimeout(() => {
            generateNewEquation();
        }, 1500); // 1.5 seconds delay
    };

    // Function to end the game
    const endGame = () => {
        clearInterval(timerInterval); // Stop the timer
        const endTime = Date.now();
        const timeTaken = Math.floor((endTime - startTime) / 1000); // Calculate time taken in seconds

        // Display the score, time taken, and a "Back to Main Menu" button
        feedbackMessage.innerHTML = `
            <h2>Game Over!</h2>
            <p>You answered ${correctAnswers} out of 5 questions correctly.</p>
            <p>Time taken: ${timeTaken} seconds.</p>
            <button id="back-to-menu">Back to Main Menu</button>
        `;
        feedbackMessage.style.color = '#90FCF9';

        // Add event listener for the "Back to Main Menu" button
        const backToMenuButton = document.getElementById('back-to-menu');
        backToMenuButton.addEventListener('click', () => {
            window.location.href = 'menu.html'; // Redirect to the main menu
        });
    };

    // Function to update the timer
    const updateTimer = () => {
        const currentTime = Math.floor((Date.now() - startTime) / 1000);
        console.log(`Time elapsed: ${currentTime} seconds`); // Optional: Log time to console
    };

    // Reset button functionality (clear dragged items)
    resetButton.addEventListener('click', () => {
        dropZones.forEach(zone => {
            if (!zone.querySelector('.fixed')) {
                while (zone.firstChild) {
                    zone.removeChild(zone.firstChild);
                }
            }
        });
        feedbackMessage.textContent = ''; // Clear feedback message
    });

    // Skip button functionality (generate a new question)
    skipButton.addEventListener('click', () => {
        generateNewEquation();
    });

    // Submit button functionality (check the equation)
    submitButton.addEventListener('click', () => {
        checkEquation();
    });

    // Start the game
    startGame();
});

// Popup functionality
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
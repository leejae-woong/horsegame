document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('startPlayerSetup').addEventListener('click', setupPlayerNames);
    document.getElementById('nextToHints').addEventListener('click', setupHints);
    document.getElementById('nextRound').addEventListener('click', nextRound);
    document.getElementById('closeHint').addEventListener('click', () => {
        document.getElementById('hintPopup').classList.add('hidden');
        showNextPlayerSetup();
    });
    document.getElementById('restartGame').addEventListener('click', restartGame);
    document.getElementById('calculateBetsButton').addEventListener('click', showBettingCalculator);
    document.getElementById('calculatePayouts').addEventListener('click', calculatePayouts);
    document.getElementById('calculateChips').addEventListener('click', calculateFinalChips);
    document.getElementById('hintDetails').addEventListener('click', showHintDetails);
    document.getElementById('backToResults').addEventListener('click', backToResults);

    let playerCount = 6;
    let horseRankings = [];
    let hints = [];
    let currentRound = 1;
    let horsePositions = Array(8).fill(0);
    let hintsChecked = 0;
    let finalRankings = [];
    let currentHorseIndex = 0;
    let players = [];
    let currentPlayerIndex = 0;
    let startButton;
    let firstPlaceHorse;
    let secondPlaceHorse;
    let firstPlacePayout;
    let secondPlacePayout;
    const horseImages = [
        'IMG/1.gif',
        'IMG/2.gif',
        'IMG/3.gif',
        'IMG/4.gif',
        'IMG/5.gif',
        'IMG/6.gif',
        'IMG/7.gif',
        'IMG/8.gif'
    ];

    function setupPlayerNames() {
        playerCount = parseInt(document.getElementById('playerCount').value);
        players = Array(playerCount).fill(null).map((_, i) => ({
            name: '',
            chips: 240,
            hints: []
        }));
        document.getElementById('playerSetup').classList.add('hidden');
        showNextPlayerSetup();
    }

    function showNextPlayerSetup() {
        if (currentPlayerIndex >= playerCount) {
            document.getElementById('nameSetup').classList.add('hidden');
            return;
        }
        const playerNamesDiv = document.getElementById('playerNames');
        playerNamesDiv.innerHTML = '';

        const playerInput = document.createElement('input');
        playerInput.type = 'text';
        playerInput.id = `playerName${currentPlayerIndex + 1}`;
        playerInput.placeholder = `플레이어 ${currentPlayerIndex + 1}`;
        playerInput.classList.add('block', 'w-1/2', 'p-2', 'border', 'border-gray-300', 'rounded-md', 'mb-2', 'mx-auto');
        playerNamesDiv.appendChild(playerInput);

        document.getElementById('nameSetup').classList.remove('hidden');
    }

    function setupHints() {
        const playerNameInput = document.getElementById(`playerName${currentPlayerIndex + 1}`);
        if (playerNameInput && playerNameInput.value.trim() !== '') {
            players[currentPlayerIndex].name = playerNameInput.value.trim();
            document.getElementById('nameSetup').classList.add('hidden');
            showHintSelectionForCurrentPlayer();
        } else {
            alert('플레이어 이름을 입력해주세요.');
        }
    }

    function showHintSelectionForCurrentPlayer() {
        if (hints.length === 0) {
            horseRankings = shuffleArray([...Array(8).keys()].map(x => x + 1));
            finalRankings = [...horseRankings];
            hints = generateHints(finalRankings, playerCount);
        }

        const hintsContainer = document.getElementById('hints');
        hintsContainer.innerHTML = '';
        const availableHints = shuffleArray(hints.filter((_, index) => !players.some(player => player.hints.includes(hints[index]))));

        availableHints.forEach((hint, index) => {
            const hintButton = document.createElement('button');
            hintButton.classList.add('p-2', 'bg-blue-500', 'text-white', 'rounded-md', 'hover:bg-blue-600', 'm-2', 'mx-auto');
            hintButton.textContent = `힌트 ${index + 1}`;
            hintButton.addEventListener('click', () => {
                showHint(hint, players[currentPlayerIndex]);
                players[currentPlayerIndex].hints.push(hint);
                currentPlayerIndex++;
                hintsChecked++;
                hintButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
                hintButton.classList.add('bg-gray-500');
                hintButton.disabled = true;

                document.getElementById('hintSection').classList.add('hidden');
                showNextPlayerSetup();

                if (hintsChecked === playerCount) {
                    startButton = document.createElement('button');
                    startButton.id = 'startRace';
                    startButton.classList.add('mt-4', 'p-2', 'bg-green-500', 'text-white', 'rounded-md', 'mx-auto', 'block');
                    startButton.textContent = '경주 시작';
                    startButton.addEventListener('click', startRace);
                    document.querySelector('.container').appendChild(startButton);
                }
            });
            hintsContainer.appendChild(hintButton);
        });

        document.getElementById('hintSection').classList.remove('hidden');
    }

    function showHint(hint, player) {
        document.getElementById('hintText').textContent = `${player.name}: ${hint}`;
        document.getElementById('hintPopup').classList.remove('hidden');
    }

    function generateHints(rankings, playerCount) {
        let hints = [];
        const sum123 = rankings[0] + rankings[1] + rankings[2];

        // 필수 힌트 6개
        hints.push(`2등말의 번호는 ${rankings[1] % 2 === 0 ? '짝수' : '홀수'}입니다.`);
        hints.push(`1등말, 2등말, 3등말의 번호의 합은 ${sum123}입니다.`);
        hints.push(`1등말의 번호는 2, 3등 말 번호의 합보다 ${rankings[0] > rankings[1] + rankings[2] ? '큽니다' : rankings[0] < rankings[1] + rankings[2] ? '작습니다' : '같습니다'}.`);
        hints.push(`1등말의 번호는 2등말의 번호보다 ${rankings[0] > rankings[1] ? '큽니다' : rankings[0] < rankings[1] ? '작습니다' : '같습니다'}.`);
        hints.push(`1등말의 번호는 3등말의 번호보다 ${rankings[0] > rankings[2] ? '큽니다' : rankings[0] < rankings[2] ? '작습니다' : '같습니다'}.`);
        hints.push(`4등말의 번호는 ${rankings[3]}입니다.`);

        if (playerCount > 6) {
            const additionalHints = [
                `5등말의 번호는 ${rankings[4]}입니다.`,
                `1,2,3등 말 번호의 합이 4,5,6,7,8등 말 번호의 합보다 ${sum123 > rankings.slice(3).reduce((a, b) => a + b) ? '큽니다' : sum123 < rankings.slice(3).reduce((a, b) => a + b) ? '작습니다' : '같습니다'}.`,
                `2등말의 번호는 4보다 ${rankings[1] > 4 ? '큽니다' : '작습니다'}.`,
                `7번말보다 1번말의 순위가 ${rankings[0] > rankings[6] ? '높다' : '낮다'}.`,
                `8번말보다 2번말의 순위가 ${rankings[1] > rankings[7] ? '높다' : '낮다'}.`,
                `6번말보다 3번말의 순위가 ${rankings[2] > rankings[5] ? '높다' : '낮다'}.`,
            ];

            while (hints.length < playerCount && additionalHints.length > 0) {
                const randomIndex = Math.floor(Math.random() * additionalHints.length);
                hints.push(additionalHints[randomIndex]);
                additionalHints.splice(randomIndex, 1);
            }
        }

        return hints;
    }

    function startRace() {
        if (startButton) {
            startButton.classList.add('hidden');
        }
        document.getElementById('hintSection').classList.add('hidden');
        document.getElementById('gameBoard').classList.remove('hidden');
        document.getElementById('nextRound').classList.add('hidden');
        currentHorseIndex = 0;
        showNextHorse();
        updateRoundDisplay();  // 라운드 업데이트 표시
    }

    function showNextHorse() {
        if (currentHorseIndex >= 8) {
            document.getElementById('nextRound').classList.remove('hidden');
            return;
        }

        const horsesContainer = document.getElementById('horses');
        horsesContainer.innerHTML = '';

        const horseElement = document.createElement('div');
        horseElement.innerHTML = `
    <img src="${horseImages[currentHorseIndex]}" alt="말 이미지" class="inline-block mr-2 horse-img">
    <div class="dice-container">
        <div class="dice">
            <div class="face front">0</div>
            <div class="face back">1</div>
            <div class="face right">2</div>
            <div class="face left">3</div>
            <div class="face top">2</div>
            <div class="face bottom">1</div>
        </div>
    </div>`;

        horsesContainer.appendChild(horseElement);

        const diceContainer = horseElement.querySelector('.dice-container');
        diceContainer.classList.add('add-keyframe');

        setTimeout(() => {
            diceContainer.classList.remove('add-keyframe');
            const moveDistance = Math.floor(Math.random() * 4);
            horsePositions[currentHorseIndex] += moveDistance;

            // 주사위의 각 면에 숫자 업데이트 및 애니메이션의 최종 결과 설정
            const diceFaces = diceContainer.querySelectorAll('.face');
            diceFaces.forEach(face => {
                face.textContent = ''; // 초기화
            });

            // 이동 칸수에 해당하는 면에 숫자 표시
            switch (moveDistance) {
                case 0:
                    diceContainer.querySelector('.face.front').textContent = '0';
                    break;
                case 1:
                    diceContainer.querySelector('.face.front').textContent = '1';
                    break;
                case 2:
                    diceContainer.querySelector('.face.front').textContent = '2';
                    break;
                case 3:
                    diceContainer.querySelector('.face.front').textContent = '3';
                    break;
            }

            const nextButton = document.createElement('button');
            nextButton.classList.add('mt-4', 'p-2', 'bg-blue-500', 'text-white', 'rounded-md');
            nextButton.textContent = '확인';
            nextButton.addEventListener('click', () => {
                currentHorseIndex++;
                showNextHorse();
            });
            horsesContainer.appendChild(nextButton);
        }, 2000); // 시간을 2000ms로 설정
    }

    function nextRound() {
        if (currentHorseIndex < 8) {
            alert('모든 말이 주사위를 굴려야 합니다.');
            return;
        }

        if (currentRound >= 12) {
            displayResults();
            return;
        }

        currentRound++;
        currentHorseIndex = 0;
        showNextHorse();
        updateRoundDisplay();  // 라운드 업데이트 표시
    }

    function displayResults() {
        document.getElementById('hintSection').classList.add('hidden');
        document.getElementById('gameBoard').classList.add('hidden');
        document.getElementById('resultSection').classList.remove('hidden');

        const sortedHorses = horsePositions.map((pos, idx) => ({ idx: idx + 1, pos }))
            .sort((a, b) => b.pos - a.pos);

        const firstPlace = sortedHorses[0];
        const secondPlace = sortedHorses[1];
        const thirdPlace = sortedHorses[2];

        document.getElementById('firstPlaceImage').src = horseImages[firstPlace.idx - 1];
        document.getElementById('firstPlaceName').textContent = `말 ${firstPlace.idx}`;
        document.getElementById('firstPlacePoints').textContent = `1등`;
       

        document.getElementById('secondPlaceImage').src = horseImages[secondPlace.idx - 1];
        document.getElementById('secondPlaceName').textContent = `말 ${secondPlace.idx}`;
        document.getElementById('secondPlacePoints').textContent = `2등`;

        document.getElementById('thirdPlaceImage').src = horseImages[thirdPlace.idx - 1];
        document.getElementById('thirdPlaceName').textContent = `말 ${thirdPlace.idx}`;
        document.getElementById('thirdPlacePoints').textContent = `3등`;

        const rankingsList = document.getElementById('finalRankings');
        rankingsList.innerHTML = '';
        sortedHorses.forEach((entry, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <img src="${horseImages[entry.idx - 1]}" alt="말 ${entry.idx}">
                <span>말 ${entry.idx}</span>
            `;
            rankingsList.appendChild(listItem);
        });
    }

    function restartGame() {
        document.getElementById('resultSection').classList.add('hidden');
        document.getElementById('playerSetup').classList.remove('hidden');
        horsePositions = Array(8).fill(0);
        currentRound = 1;
        hintsChecked = 0;
        currentPlayerIndex = 0;
        updateRoundDisplay();
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function updateRoundDisplay() {
        const roundDisplay = document.getElementById('roundDisplay');
        roundDisplay.textContent = `라운드: ${currentRound}`;
    }

    function showBettingCalculator() {
        document.getElementById('resultSection').classList.add('hidden');
        document.getElementById('bettingCalculator').classList.remove('hidden');
        firstPlaceHorse = finalRankings[0];
        secondPlaceHorse = finalRankings[1];
    }

    function calculatePayouts() {
        const totalChips = parseFloat(document.getElementById('totalChips').value);
        const firstPlaceBets = parseFloat(document.getElementById('firstPlaceBets').value);
        const secondPlaceBets = parseFloat(document.getElementById('secondPlaceBets').value);

        if (isNaN(totalChips) || isNaN(firstPlaceBets) || isNaN(secondPlaceBets)) {
            alert('모든 값을 올바르게 입력해주세요.');
            return;
        }

        firstPlacePayout = (totalChips / firstPlaceBets) / 2;
        secondPlacePayout = (totalChips / secondPlaceBets) / 2;

        document.getElementById('bettingCalculator').classList.add('hidden');
        showBettingInput();
    }

    function showBettingInput() {
        const bettingInputsContainer = document.getElementById('bettingInputs');
        bettingInputsContainer.innerHTML = '';

        players.forEach((player, index) => {
            const playerBetContainer = document.createElement('div');
            playerBetContainer.classList.add('mb-2');
            playerBetContainer.innerHTML = `<h3 class="text-lg font-bold">${player.name}의 베팅</h3>`;
            const firstPlaceBetInput = document.createElement('input');
            firstPlaceBetInput.type = 'number';
            firstPlaceBetInput.placeholder = `1등 말 ${firstPlaceHorse}번 말 베팅 칩`;
            firstPlaceBetInput.classList.add('block', 'w-full', 'p-2', 'border', 'border-gray-300', 'rounded-md', 'mb-2');
            firstPlaceBetInput.dataset.playerIndex = index;
            firstPlaceBetInput.dataset.horseIndex = 0;
            playerBetContainer.appendChild(firstPlaceBetInput);

            const secondPlaceBetInput = document.createElement('input');
            secondPlaceBetInput.type = 'number';
            secondPlaceBetInput.placeholder = `2등 말 ${secondPlaceHorse}번 말 베팅 칩`;
            secondPlaceBetInput.classList.add('block', 'w-full', 'p-2', 'border', 'border-gray-300', 'rounded-md', 'mb-2');
            secondPlaceBetInput.dataset.playerIndex = index;
            secondPlaceBetInput.dataset.horseIndex = 1;
            playerBetContainer.appendChild(secondPlaceBetInput);

            bettingInputsContainer.appendChild(playerBetContainer);
        });

        document.getElementById('bettingInput').classList.remove('hidden');
    }

    function calculateFinalChips() {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.innerHTML = '';

        players.forEach((player, index) => {
            const firstPlaceBet = parseFloat(document.querySelector(`input[data-player-index="${index}"][data-horse-index="0"]`).value);
            const secondPlaceBet = parseFloat(document.querySelector(`input[data-player-index="${index}"][data-horse-index="1"]`).value);

            if (isNaN(firstPlaceBet) || isNaN(secondPlaceBet)) {
                alert('모든 값을 올바르게 입력해주세요.');
                return;
            }

            const finalChips = (firstPlaceBet * firstPlacePayout) + (secondPlaceBet * secondPlacePayout);

            const resultItem = document.createElement('div');
            resultItem.classList.add('mb-2');
            resultItem.innerHTML = `<h3 class="text-lg font-bold">${player.name}</h3><p>최종 칩 개수: ${finalChips.toFixed(2)}</p>`;
            resultsSection.appendChild(resultItem);
        });

        document.getElementById('bettingInput').classList.add('hidden');
        document.getElementById('bettingResults').classList.remove('hidden');
    }

    function showHintDetails() {
        const detailedHintsList = document.getElementById('detailedHints');
        detailedHintsList.innerHTML = '';
        players.forEach(player => {
            const hintItem = document.createElement('li');
            hintItem.textContent = `${player.name}: ${player.hints.join(', ')}`;
            detailedHintsList.appendChild(hintItem);
        });
        document.getElementById('resultSection').classList.add('hidden');
        document.getElementById('hintDetailsSection').classList.remove('hidden');
    }

    function backToResults() {
        document.getElementById('hintDetailsSection').classList.add('hidden');
        document.getElementById('resultSection').classList.remove('hidden');
    }
});

const calorieCounter = document.getElementById('calorie-counter');
const budgetNumberInput = document.getElementById('budget');
const entryDropdown = document.getElementById('entry-dropdown');
const addEntryButton = document.getElementById('add-entry');
const clearButton = document.getElementById('clear');
const output = document.getElementById('output');
const STORAGE_KEY = 'calorieCounterData';
let isError = false;

function cleanInputString(str) {
  const regex = /[+-\s]/g;
  return str.replace(regex, '');
}

function isInvalidInput(str) {
  const regex = /\d+e\d+/i;
  return str.match(regex);
}

function addEntry() {
  const targetInputContainer = document.querySelector(`#${entryDropdown.value} .input-container`);
  const entryNumber = targetInputContainer.querySelectorAll('input[type="text"]').length + 1;
  const HTMLString = `
  <label>Entry ${entryNumber} Name</label>
  <input type="text" />
  <label>Entry ${entryNumber} Calories</label>
  <input type="number" min="0" />`;
  targetInputContainer.insertAdjacentHTML('beforeend', HTMLString);

  saveToLocalStorage();
}

function calculateCalories(e) {
  e.preventDefault();
  isError = false;

  const breakfastNumberInputs = document.querySelectorAll("#breakfast input[type='number']");
  const lunchNumberInputs = document.querySelectorAll("#lunch input[type='number']");
  const dinnerNumberInputs = document.querySelectorAll("#dinner input[type='number']");
  const snacksNumberInputs = document.querySelectorAll("#snacks input[type='number']");
  const exerciseNumberInputs = document.querySelectorAll("#exercise input[type='number']");

  const breakfastCalories = getCaloriesFromInputs(breakfastNumberInputs);
  const lunchCalories = getCaloriesFromInputs(lunchNumberInputs);
  const dinnerCalories = getCaloriesFromInputs(dinnerNumberInputs);
  const snacksCalories = getCaloriesFromInputs(snacksNumberInputs);
  const exerciseCalories = getCaloriesFromInputs(exerciseNumberInputs);
  const budgetCalories = getCaloriesFromInputs([budgetNumberInput]);

  if (isError) {
    return;
  }

  const consumedCalories = breakfastCalories + lunchCalories + dinnerCalories + snacksCalories;
  const remainingCalories = budgetCalories - consumedCalories + exerciseCalories;
  const surplusOrDeficit = remainingCalories < 0 ? 'Surplus' : 'Deficit';
  output.innerHTML = `
  <span class="${surplusOrDeficit.toLowerCase()}">${Math.abs(remainingCalories)} Calorie ${surplusOrDeficit}</span>
  <hr>
  <p>${budgetCalories} Calories Budgeted</p>
  <p>${consumedCalories} Calories Consumed</p>
  <p>${exerciseCalories} Calories Burned</p>
  `;

  output.classList.remove('hide');
  saveToLocalStorage();
}

function getCaloriesFromInputs(list) {
  let calories = 0;

  for (const item of list) {
    const currVal = cleanInputString(item.value);
    const invalidInputMatch = isInvalidInput(currVal);

    if (invalidInputMatch) {
      alert(`Invalid Input: ${invalidInputMatch[0]}`);
      isError = true;
      return null;
    }
    calories += Number(currVal);
  }
  return calories;
}

function clearForm() {
  const inputContainers = Array.from(document.querySelectorAll('.input-container'));

  inputContainers.forEach(container => (container.innerHTML = ''));

  budgetNumberInput.value = '';
  output.innerText = '';
  output.classList.add('hide');
  localStorage.removeItem(STORAGE_KEY);
}

function saveToLocalStorage() {
  
  const data = {
    budget: budgetNumberInput.value,
    entries: {},
    output: output.innerHTML,
    outputVisible: !output.classList.contains('hide')
  };

  const sections = ['breakfast', 'lunch', 'dinner', 'snacks', 'exercise'];
  
  sections.forEach(section => {
    const container = document.querySelector(`#${section} .input-container`);
    const inputs = container.querySelectorAll('input');
    data.entries[section] = [];
    
    for (let i = 0; i < inputs.length; i += 2) {
      data.entries[section].push({
        name: inputs[i].value,
        calories: inputs[i + 1].value
      });
    }
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromLocalStorage() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (!savedData) return;

  const data = JSON.parse(savedData);
  budgetNumberInput.value = data.budget || '';

  const sections = ['breakfast', 'lunch', 'dinner', 'snacks', 'exercise'];
  
  sections.forEach(section => {
    const container = document.querySelector(`#${section} .input-container`);
    container.innerHTML = '';
    data.entries?.[section]?.forEach((entry, index) => {
      const entryNumber = index + 1;
      container.insertAdjacentHTML('beforeend', `
        <label for="${section}-${entryNumber}-name">Entry ${entryNumber} Name</label>
        <input type="text" value="${entry.name}" />
        <label for="${section}-${entryNumber}-calories">Entry ${entryNumber} Calories</label>
        <input type="number" min="0" value="${entry.calories}" />
      `);
    });
  });
  
  if (data.outputVisible) {
    output.innerHTML = data.output;
    output.classList.remove('hide');
  }
}

document.addEventListener('input', saveToLocalStorage);
addEntryButton.addEventListener("click", addEntry);
calorieCounter.addEventListener("submit", calculateCalories);
clearButton.addEventListener("click", clearForm);
loadFromLocalStorage();
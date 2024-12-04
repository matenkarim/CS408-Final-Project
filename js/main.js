// workouts.js

document.addEventListener("DOMContentLoaded", function () {
  const apiBaseUrl = 'https://tb63oflrmc.execute-api.us-east-2.amazonaws.com'; 

  // Elements for Workout Plans
  const addPlanButton = document.getElementById('add-plan');
  const planNameInput = document.getElementById('plan-name');
  const plansUl = document.getElementById('plans-ul');
  
  // Elements for Exercises
  const addExerciseSection = document.getElementById('add-exercise');
  const selectedPlanNameSpan = document.getElementById('selected-plan-name');
  const selectedPlanNameSpan2 = document.getElementById('selected-plan-name-2');
  const exerciseNameInput = document.getElementById('exercise-name');
  const exerciseWeightInput = document.getElementById('exercise-weight');
  const exerciseRepsInput = document.getElementById('exercise-reps');
  const exerciseNotesInput = document.getElementById('exercise-notes');
  const addExerciseButton = document.getElementById('add-exercise-button');
  const exercisesTableBody = document.getElementById('exercises-table-body');
  const exercisesListSection = document.getElementById('exercises-list');
  
  let selectedPlanId = null;
  
  // Event Listeners
  addPlanButton.addEventListener('click', addWorkoutPlan);
  addExerciseButton.addEventListener('click', addExerciseToPlan);

  // Load workout plans on page load
  loadWorkoutPlans();

  // Function to load workout plans
  function loadWorkoutPlans() {
    fetch(`${apiBaseUrl}/plans`)
      .then(response => response.json())
      .then(data => {
        plansUl.innerHTML = '';
        data.forEach(plan => {
          const li = document.createElement('li');
          li.textContent = plan.name;
          li.dataset.planId = plan.PK.replace('PLAN#', '');
          li.addEventListener('click', () => selectPlan(li.dataset.planId, plan.name));
          plansUl.appendChild(li);
        });
      })
      .catch(error => console.error('Error fetching plans:', error));
  }
  
  // Function to add a new workout plan
  function addWorkoutPlan() {
    const planName = planNameInput.value.trim();
    if (!planName) {
      alert('Plan name is required.');
      return;
    }
    const planId = generateUniqueId();
    const newPlan = {
      planId: planId,
      name: planName
    };
    fetch(`${apiBaseUrl}/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPlan)
    })
    .then(response => {
      if (response.ok) {
        console.log('Plan added successfully');
        planNameInput.value = '';
        loadWorkoutPlans();
      } else {
        return response.text().then(text => {
          throw new Error(`Error adding plan: ${text}`);
        });
      }
    })
    .catch(error => console.error('Error:', error));
  }
  
  // Function to select a workout plan
  function selectPlan(planId, planName) {
    selectedPlanId = planId;
    selectedPlanNameSpan.textContent = planName;
    selectedPlanNameSpan2.textContent = planName;
    addExerciseSection.style.display = 'block';
    exercisesListSection.style.display = 'block';
    loadExercisesForPlan(planId);
  }

  // Function to add an exercise to the selected plan
  function addExerciseToPlan() {
    const exerciseName = exerciseNameInput.value.trim();
    const weight = exerciseWeightInput.value.trim();
    const reps = exerciseRepsInput.value.trim();
    const notes = exerciseNotesInput.value.trim();

    if (!exerciseName || !weight || !reps) {
      alert('Exercise Name, Weight, and Reps are required.');
      return;
    }

    const exerciseId = generateUniqueId();
    const newExercise = {
      exerciseId: exerciseId,
      name: exerciseName,
      weight: parseFloat(weight),
      reps: parseInt(reps, 10),
      notes: notes
    };

    fetch(`${apiBaseUrl}/plans/${selectedPlanId}/exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newExercise)
    })
    .then(response => {
      if (response.ok) {
        console.log('Exercise added successfully');
        exerciseNameInput.value = '';
        exerciseWeightInput.value = '';
        exerciseRepsInput.value = '';
        exerciseNotesInput.value = '';
        loadExercisesForPlan(selectedPlanId);
      } else {
        return response.text().then(text => {
          throw new Error(`Error adding exercise: ${text}`);
        });
      }
    })
    .catch(error => console.error('Error:', error));
  }

  // Function to load exercises for a selected plan
  function loadExercisesForPlan(planId) {
    fetch(`${apiBaseUrl}/plans/${planId}/exercises`)
      .then(response => response.json())
      .then(data => {
        exercisesTableBody.innerHTML = '';
        data.forEach(exercise => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${exercise.name}</td>
            <td>${exercise.weight}</td>
            <td>${exercise.reps}</td>
            <td>${exercise.notes}</td>
          `;
          exercisesTableBody.appendChild(tr);
        });
      })
      .catch(error => console.error('Error fetching exercises:', error));
  }

  // Function to generate a unique ID
  function generateUniqueId() {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
  }
});

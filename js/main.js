document.addEventListener("DOMContentLoaded", function () {
  const apiBaseUrl = 'https://tb63oflrmc.execute-api.us-east-2.amazonaws.com';

  // Check which page we're on and initialize accordingly
  if (document.getElementById('add-plan')) {
    initWorkoutsPage();
  }

  if (document.getElementById('progress-chart')) {
    initProgressPage();
  }

  if (document.getElementById('log-workout-button')) {
    initLogWorkoutPage();
  }

  if (document.getElementById('predefined-plans-section')) {
    initExercisesPage();
  }

  // Function to initialize the Exercises Page
  function initExercisesPage() {
    const predefinedPlansContainer = document.getElementById('predefined-plans-container');

    fetch('/predefined_plans.json')
      .then(response => response.json())
      .then(plans => {
        plans.forEach(plan => {
          const planDiv = document.createElement('div');
          planDiv.classList.add('plan');

          const planTitle = document.createElement('h3');
          planTitle.textContent = plan.name;
          planDiv.appendChild(planTitle);

          const exercisesList = document.createElement('ul');
          plan.exercises.forEach(exercise => {
            const exerciseItem = document.createElement('li');
            exerciseItem.textContent = `${exercise.name} - ${exercise.sets} sets x ${exercise.reps} reps ${exercise.notes ? '- ' + exercise.notes : ''}`;
            exercisesList.appendChild(exerciseItem);
          });
          planDiv.appendChild(exercisesList);

          const addButton = document.createElement('button');
          addButton.textContent = 'Add to My Plans';
          addButton.addEventListener('click', () => addPlanToUserPlans(plan));
          planDiv.appendChild(addButton);

          predefinedPlansContainer.appendChild(planDiv);
        });
      })
      .catch(error => console.error('Error loading predefined plans:', error));
  }

  // Function to add a predefined plan to the user's plans
  function addPlanToUserPlans(plan) {
    const planId = generateUniqueId();
    const newPlan = {
      planId: planId,
      name: plan.name
    };

    // First, add the plan
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

          // Then, add each exercise to the plan
          plan.exercises.forEach(exercise => {
            const exerciseId = generateUniqueId();
            const newExercise = {
              exerciseId: exerciseId,
              name: exercise.name,
              weight: 0, // Default weight
              reps: exercise.reps,
              notes: exercise.notes || ''
            };

            fetch(`${apiBaseUrl}/plans/${planId}/exercises`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(newExercise)
            })
              .then(res => {
                if (res.ok) {
                  console.log(`Exercise ${exercise.name} added to plan ${plan.name}`);
                } else {
                  return res.text().then(text => {
                    throw new Error(`Error adding exercise: ${text}`);
                  });
                }
              })
              .catch(error => console.error('Error:', error));
          });

          alert(`Plan "${plan.name}" added to your plans.`);
        } else {
          return response.text().then(text => {
            throw new Error(`Error adding plan: ${text}`);
          });
        }
      })
      .catch(error => console.error('Error:', error));
  }

  // Function to generate a unique ID
  function generateUniqueId() {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
  }

  // Initialize Workouts Page
  function initWorkoutsPage() {
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

            const planButton = document.createElement('button');
            planButton.textContent = plan.name;
            planButton.addEventListener('click', () => selectPlan(plan.PK.replace('PLAN#', ''), plan.name));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-plan-btn');
            deleteButton.addEventListener('click', (event) => {
              event.stopPropagation();
              deletePlan(plan.PK.replace('PLAN#', ''));
            });

            li.appendChild(planButton);
            li.appendChild(deleteButton);

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

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-exercise-btn');

            const exerciseId = exercise.SK.replace('EXERCISE#', '');

            deleteButton.addEventListener('click', () => deleteExercise(planId, exerciseId));

            const deleteCell = document.createElement('td');
            deleteCell.appendChild(deleteButton);

            tr.appendChild(deleteCell);

            exercisesTableBody.appendChild(tr);
          });
        })
        .catch(error => console.error('Error fetching exercises:', error));
    }

    // Function to delete a workout plan
    function deletePlan(planId) {
      if (confirm('Are you sure you want to delete this plan and all its exercises?')) {
        fetch(`${apiBaseUrl}/plans/${planId}`, {
          method: 'DELETE',
        })
          .then(response => {
            if (response.ok) {
              console.log(`Plan ${planId} deleted successfully`);
              loadWorkoutPlans();
              if (selectedPlanId === planId) {
                selectedPlanId = null;
                addExerciseSection.style.display = 'none';
                exercisesListSection.style.display = 'none';
              }
            } else {
              return response.text().then(text => {
                throw new Error(`Error deleting plan: ${text}`);
              });
            }
          })
          .catch(error => console.error('Error deleting plan:', error));
      }
    }

    function deleteExercise(planId, exerciseId) {
      if (confirm('Are you sure you want to delete this exercise?')) {
        fetch(`${apiBaseUrl}/plans/${planId}/exercises/${exerciseId}`, {
          method: 'DELETE',
        })
          .then(response => {
            if (response.ok) {
              console.log(`Exercise ${exerciseId} deleted successfully`);
              loadExercisesForPlan(planId);
            } else {
              return response.text().then(text => {
                throw new Error(`Error deleting exercise: ${text}`);
              });
            }
          })
          .catch(error => console.error('Error deleting exercise:', error));
      }
    }

    document.getElementById('toggle-plans-button').addEventListener('click', function () {
      const plansList = document.getElementById('plans-ul');
      plansList.style.display = plansList.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('toggle-exercises-button').addEventListener('click', function () {
      const exercisesTable = document.getElementById('exercises-table');
      exercisesTable.style.display = exercisesTable.style.display === 'none' ? 'table' : 'none';
    });
  }

  // Initialize Progress Page
  function initProgressPage() {
    const workoutPlanSelect = document.getElementById('workout-plan-select');
    const exerciseSelect = document.getElementById('exercise-select');
    const progressChartCanvas = document.getElementById('progress-chart');
    let progressChart;

    

    // Load the workout plans
    fetch(`${apiBaseUrl}/plans`)
      .then(response => response.json())
      .then(data => {
        data.forEach(plan => {
          const option = document.createElement('option');
          option.value = plan.PK.replace('PLAN#', '');
          option.textContent = plan.name;
          workoutPlanSelect.appendChild(option);
        });
      })
      .catch(error => console.error('Error fetching plans:', error));

    // When a plan is selected, load exercises
    workoutPlanSelect.addEventListener('change', function () {
      const selectedPlanId = workoutPlanSelect.value;
      exerciseSelect.innerHTML = '<option value="">Select Exercise</option>';

      if (selectedPlanId) {
        fetch(`${apiBaseUrl}/plans/${selectedPlanId}/exercises`)
          .then(response => response.json())
          .then(data => {
            data.forEach(exercise => {
              const option = document.createElement('option');
              const exerciseId = exercise.SK.replace('EXERCISE#', '');
              option.value = exerciseId;
              option.textContent = exercise.name;
              exerciseSelect.appendChild(option);
            });
          })
          .catch(error => console.error('Error fetching exercises:', error));
      }
    });

    // When an exercise is selected, fetch progress data
    exerciseSelect.addEventListener('change', function () {
      const selectedPlanId = workoutPlanSelect.value;
      const selectedExerciseId = exerciseSelect.value;

      if (selectedPlanId && selectedExerciseId) {
        fetch(`${apiBaseUrl}/plans/${selectedPlanId}/exercises/${selectedExerciseId}/progress`)
          .then(response => response.json())
          .then(data => {

            // Sort data by date
            data.sort((a, b) => new Date(a.date) - new Date(b.date));

            const dates = data.map(entry => entry.date);
            const weights = data.map(entry => entry.weight);

            updateProgressChart(dates, weights);
          })
          .catch(error => console.error('Error fetching progress data:', error));
      }
    });

    // Set up the chart
    const ctx = progressChartCanvas.getContext('2d');
    progressChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Weight Progression Over Time',
          data: [],
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: false,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        parsing: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            },
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Weight (lbs)'
            }
          }
        }
      }
    });

    // Function to update the chart with new data
    function updateProgressChart(dates, weights) {
      const dataPoints = dates.map((date, index) => ({
        x: date,
        y: weights[index],
      }));
  
      progressChart.data.datasets[0].data = dataPoints;
      progressChart.update();
    }
  }

  // Initialize Log Workout Page
  function initLogWorkoutPage() {
    const workoutPlanSelect = document.getElementById('workout-plan-select');
    const workoutDateInput = document.getElementById('workout-date');
    const logWorkoutButton = document.getElementById('log-workout-button');
    const exercisesContainer = document.getElementById('exercises-container');

    // Load the workout plans
    fetch(`${apiBaseUrl}/plans`)
      .then(response => response.json())
      .then(data => {
        data.forEach(plan => {
          const option = document.createElement('option');
          option.value = plan.PK.replace('PLAN#', '');
          option.textContent = plan.name;
          workoutPlanSelect.appendChild(option);
        });
      })
      .catch(error => console.error('Error fetching plans:', error));

  // When a plan is selected, load its exercises
  workoutPlanSelect.addEventListener('change', function () {
    const selectedPlanId = workoutPlanSelect.value;
    exercisesContainer.innerHTML = '';

    if (selectedPlanId) {
      fetch(`${apiBaseUrl}/plans/${selectedPlanId}/exercises`)
        .then(response => response.json())
        .then(data => {
          data.forEach(exercise => {
            const exerciseId = exercise.SK.replace('EXERCISE#', '');

            const exerciseDiv = document.createElement('div');
            exerciseDiv.classList.add('exercise-entry');

            exerciseDiv.innerHTML = `
              <h3>${exercise.name}</h3>
              <label for="weight-${exerciseId}">Weight (lbs):</label>
              <input type="number" id="weight-${exerciseId}" min="0" required>
              <label for="reps-${exerciseId}">Reps:</label>
              <input type="number" id="reps-${exerciseId}" min="0" required>
            `;

            exercisesContainer.appendChild(exerciseDiv);
          });
        })
        .catch(error => console.error('Error fetching exercises:', error));
    }
  });
  
  logWorkoutButton.addEventListener('click', logWorkoutSession);
  
  // Function to Log a Workout Session
  function logWorkoutSession() {
    const selectedPlanId = workoutPlanSelect.value;
    const workoutDate = workoutDateInput.value;

    if (!selectedPlanId || !workoutDate) {
      alert('Please select a workout plan and a date.');
      return;
    }

    const exercisesInputs = exercisesContainer.getElementsByClassName('exercise-entry');
    const exercises = [];

    for (let exerciseDiv of exercisesInputs) {
      const exerciseName = exerciseDiv.querySelector('h3').textContent;
      const weightInput = exerciseDiv.querySelector('input[id^="weight-"]');
      const repsInput = exerciseDiv.querySelector('input[id^="reps-"]');

      const weight = weightInput.value.trim();
      const reps = repsInput.value.trim();
      const exerciseId = weightInput.id.replace('weight-', '');

      if (weight && reps) {
        exercises.push({
          exerciseId: exerciseId,
          weight: parseFloat(weight),
          reps: parseInt(reps, 10)
        });
      }
    }

    if (exercises.length === 0) {
      alert('Please enter weight and reps for at least one exercise.');
      return;
    }

    const newLog = {
      planId: selectedPlanId,
      date: workoutDate,
      exercises: exercises,
    };

    fetch(`${apiBaseUrl}/workouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newLog)
    })
      .then(response => {
        if (response.ok) {
          console.log('Workout logged successfully');
          workoutDateInput.value = '';
          exercisesContainer.innerHTML = '';
          alert('Workout logged successfully.');
        } else {
          return response.text().then(text => {
            throw new Error(`Error logging workout: ${text}`);
          });
        }
      })
      .catch(error => console.error('Error:', error));
    }
  }
});

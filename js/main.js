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
              sets: parseInt(exercise.sets, 10) || 0,
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
    const exerciseSetsInput = document.getElementById('exercise-sets');
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
      const sets = exerciseSetsInput.value.trim();
      const reps = exerciseRepsInput.value.trim();
      const notes = exerciseNotesInput.value.trim();

      if (!exerciseName || !sets || !reps) {
        alert('Exercise Name, Sets, and Reps are required.');
        return;
      }

      const exerciseId = generateUniqueId();
      const newExercise = {
        exerciseId: exerciseId,
        name: exerciseName,
        sets: parseInt(sets, 10),
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
            exerciseSetsInput.value = '';
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
              <td>${exercise.sets}</td>
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
    const loggedWorkoutsContainer = document.getElementById('logged-workouts-container');
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

      // When an exercise is selected, fetch progress data and logged workouts
  exerciseSelect.addEventListener('change', function () {
    const selectedPlanId = workoutPlanSelect.value;
    const selectedExerciseId = exerciseSelect.value;

    if (selectedPlanId && selectedExerciseId) {
      fetchProgressData(selectedPlanId, selectedExerciseId);
      fetchLoggedWorkouts(selectedPlanId, selectedExerciseId);
    }
  });

  // Function to fetch and display progress data
  function fetchProgressData(planId, exerciseId) {
    fetch(`${apiBaseUrl}/plans/${planId}/exercises/${exerciseId}/progress`)
      .then(response => response.json())
      .then(data => {
        // ... existing code to process and display chart ...
      })
      .catch(error => console.error('Error fetching progress data:', error));
  }

  // Function to fetch and display logged workouts
  function fetchLoggedWorkouts(planId, exerciseId) {
    fetch(`${apiBaseUrl}/plans/${planId}/exercises/${exerciseId}/workouts`)
      .then(response => response.json())
      .then(data => {
        console.log('Logged workouts fetched:', data);

        // Clear previous content
        loggedWorkoutsContainer.innerHTML = '';

        // Check if there are any logged workouts
        if (data.length === 0) {
          loggedWorkoutsContainer.textContent = 'No logged workouts found for this exercise.';
          return;
        }

        // Create a select element to choose a workout
        const workoutSelect = document.createElement('select');
        workoutSelect.id = 'workout-select';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a Workout Date';
        workoutSelect.appendChild(defaultOption);

        // Populate the select options with workout dates
        data.forEach(workout => {
          const option = document.createElement('option');
          option.value = workout.date;
          option.textContent = workout.date;
          workoutSelect.appendChild(option);
        });

        loggedWorkoutsContainer.appendChild(workoutSelect);

        // Create a container to display workout details
        const workoutDetailsDiv = document.createElement('div');
        workoutDetailsDiv.id = 'workout-details';
        loggedWorkoutsContainer.appendChild(workoutDetailsDiv);

        // Add event listener for workout selection
        workoutSelect.addEventListener('change', function () {
          const selectedDate = workoutSelect.value;
          if (selectedDate) {
            const selectedWorkout = data.find(workout => workout.date === selectedDate);
            displayWorkoutDetails(selectedWorkout);
          } else {
            workoutDetailsDiv.innerHTML = '';
          }
        });

        // Function to display workout details
        function displayWorkoutDetails(workout) {
          workoutDetailsDiv.innerHTML = '';

          const workoutDate = document.createElement('h3');
          workoutDate.textContent = `Workout Date: ${workout.date}`;
          workoutDetailsDiv.appendChild(workoutDate);

          const setsList = document.createElement('ul');
          workout.sets.forEach(set => {
            const setItem = document.createElement('li');
            setItem.textContent = `Set ${set.setNumber}: Weight - ${set.weight} lbs, Reps - ${set.reps}`;
            setsList.appendChild(setItem);
          });
          workoutDetailsDiv.appendChild(setsList);
        }
      })
      .catch(error => console.error('Error fetching logged workouts:', error));
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

            const exerciseTitle = document.createElement('h3');
            exerciseTitle.textContent = exercise.name;
            exerciseDiv.appendChild(exerciseTitle);

            for (let i = 1; i <= exercise.sets; i++) {
              const setDiv = document.createElement('div');
              setDiv.classList.add('set-entry');

              setDiv.innerHTML = `
                <h4>Set ${i}</h4>
                <label for="weight-${exerciseId}-${i}">Weight (lbs):</label>
                <input type="number" id="weight-${exerciseId}-${i}" min="0" required>
                <label for="reps-${exerciseId}-${i}">Reps:</label>
                <input type="number" id="reps-${exerciseId}-${i}" min="0" required>
              `;

              exerciseDiv.appendChild(setDiv);
            }

            exercisesContainer.appendChild(exerciseDiv);
          });
        })
        .catch(error => console.error('Error fetching exercises:', error));
    }
  });
  
  logWorkoutButton.addEventListener('click', logWorkoutSession);
  function logWorkoutSession() {
    const selectedPlanId = workoutPlanSelect.value;
    const workoutDate = workoutDateInput.value;
  
    if (!selectedPlanId || !workoutDate) {
      alert('Please select a workout plan and a date.');
      return;
    }
  
    const exercisesInputs = exercisesContainer.getElementsByClassName('exercise-entry');
  
    for (let exerciseDiv of exercisesInputs) {
      const exerciseName = exerciseDiv.querySelector('h3').textContent;
      const exerciseId = exerciseDiv.querySelector('input[id^="weight-"]').id.split('-')[1];
  
      const sets = [];
  
      const setEntries = exerciseDiv.getElementsByClassName('set-entry');
      for (let setDiv of setEntries) {
        const weightInput = setDiv.querySelector('input[id^="weight-"]');
        const repsInput = setDiv.querySelector('input[id^="reps-"]');
  
        const weight = weightInput.value.trim();
        const reps = repsInput.value.trim();
  
        if (weight && reps) {
          sets.push({
            weight: parseFloat(weight),
            reps: parseInt(reps, 10)
          });
        } else {
          alert('Please enter weight and reps for all sets.');
          return;
        }
      }
  
      const newLog = {
        date: workoutDate,
        sets: sets,
      };
  
      // Post to the new endpoint
      fetch(`${apiBaseUrl}/plans/${selectedPlanId}/exercises/${exerciseId}/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLog)
      })
        .then(response => {
          if (response.ok) {
            console.log(`Workout for exercise ${exerciseName} logged successfully`);
            // Optionally, reset input fields for this exercise if needed
          } else {
            return response.text().then(text => {
              throw new Error(`Error logging workout for ${exerciseName}: ${text}`);
            });
          }
        })
        .catch(error => console.error('Error:', error));
    }
  
    // After logging all exercises, reset the form and display a success message
    workoutDateInput.value = '';
    exercisesContainer.innerHTML = '';
    alert('Workout logged successfully.');
    }
  }
});

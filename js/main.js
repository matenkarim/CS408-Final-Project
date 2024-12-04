document.addEventListener("DOMContentLoaded", function () {
  // Load Workouts button
  const loadWorkoutsButton = document.getElementById('load-workouts');
  loadWorkoutsButton.addEventListener('click', loadWorkouts);

  // Toggle Table button
  const toggleTableButton = document.getElementById('toggle-table');
  toggleTableButton.addEventListener('click', function () {
      const workoutTable = document.getElementById('workout-table');
      if (workoutTable.style.display === 'none') {
          workoutTable.style.display = 'table';
          toggleTableButton.textContent = 'Hide Table';
      } else {
          workoutTable.style.display = 'none';
          toggleTableButton.textContent = 'Show Table';
      }
  });

  // Add Workout button
  const addWorkoutButton = document.getElementById('add-workout');
  addWorkoutButton.addEventListener('click', addWorkout);

  loadWorkouts(); // Load workouts on page load

  // Load Workouts Function
  function loadWorkouts() {
      fetch("https://tb63oflrmc.execute-api.us-east-2.amazonaws.com/workouts")
          .then(response => response.json())
          .then(data => {
              const table = document.getElementById('workout-table');
              const tableBody = document.getElementById('table-body');
              const toggleTableButton = document.getElementById('toggle-table');
              tableBody.innerHTML = '';

              if (data.length > 0) {
                  // Show the table and toggle button
                  table.style.display = 'table';
                  toggleTableButton.style.display = 'inline-block';
                  toggleTableButton.textContent = 'Hide Table';

                  data.forEach(workout => {
                      const tr = document.createElement('tr');
                      tr.innerHTML = `
                          <td>${workout.date}</td>
                          <td>${workout.exercise}</td>
                          <td>${workout.weight}</td>
                          <td>${workout.reps}</td>
                          <td>${workout.notes}</td>
                          <td><button class="delete-btn" data-id="${workout.id}">Delete</button></td>
                      `;
                      tableBody.appendChild(tr);
                  });

                  // Add event listeners to the new Delete buttons
                  const deleteButtons = document.querySelectorAll('.delete-btn');
                  deleteButtons.forEach(button => {
                      button.addEventListener('click', () => deleteWorkout(button.dataset.id));
                  });

              } else {
                  // Hide the table and toggle button if no workouts
                  table.style.display = 'none';
                  toggleTableButton.style.display = 'none';
              }
          })
          .catch(error => console.error('Error fetching data:', error));
  }

  // Delete Workout Function
  function deleteWorkout(id) {
      fetch(`https://tb63oflrmc.execute-api.us-east-2.amazonaws.com/workouts/${id}`, {
          method: 'DELETE',
      })
      .then(response => {
          if (response.ok) {
              console.log(`Workout with ID ${id} deleted successfully`);
              loadWorkouts(); // Reload workouts
          } else {
              console.error('Error deleting workout:', response.statusText);
          }
      })
      .catch(error => console.error('Error deleting workout:', error));
  }

  // Add Workout Function
  function addWorkout() {
      const date = document.getElementById('date').value.trim();
      const exercise = document.getElementById('exercise').value.trim();
      const weight = document.getElementById('weight').value.trim();
      const reps = document.getElementById('reps').value.trim();
      const notes = document.getElementById('notes').value.trim();

      // Input validation
      if (!date || !exercise || !weight || !reps) {
          alert('Date, Exercise, Weight, and Repetitions are required.');
          return;
      }

      // Generate a unique ID for the workout
      const id = generateUniqueId();

      // Create new workout object
      const newWorkout = {
          id: id,
          date: date,
          exercise: sanitizeInput(exercise),
          weight: parseFloat(weight),
          reps: parseInt(reps, 10),
          notes: sanitizeInput(notes)
      };

      // Send new workout to the server
      fetch('https://tb63oflrmc.execute-api.us-east-2.amazonaws.com/workouts', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(newWorkout)
      })
      .then(response => {
          if (response.ok) {
              console.log('Workout added successfully');
              loadWorkouts(); // Reload the workouts after adding a new one

              // Clear the input fields
              document.getElementById('date').value = '';
              document.getElementById('exercise').value = '';
              document.getElementById('weight').value = '';
              document.getElementById('reps').value = '';
              document.getElementById('notes').value = '';
          } else {
              return response.text().then(text => {
                  throw new Error(`Error adding workout: ${text}`);
              });
          }
      })
      .catch(error => console.error('Error:', error));
  }

  // Function to generate a unique ID
  function generateUniqueId() {
      return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
  }

  // Input Sanitization Function
  function sanitizeInput(input) {
      const tempElement = document.createElement('div');
      tempElement.textContent = input;
      return tempElement.innerHTML;
  }
});

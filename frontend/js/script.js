// Handle solution submission
async function submitSolution(problemId, solution) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to submit a solution.');
        window.location.href = 'index.html';
        return;
    }

    console.log(`Submitting solution for problem ID: ${problemId}`);
    try {
        const response = await fetch(`http://localhost:8000/submissions/${problemId}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                answer_text: solution
            })
        });

        console.log(`Response status: ${response.status}`);
        const responseData = await response.json();
        console.log('Response data:', responseData);

        if (!response.ok) {
            throw new Error(responseData.detail || 'Error submitting solution');
        }

        return responseData;
    } catch (error) {
        console.error('Error submitting solution:', error);
        if (error.message) {
            console.error('Error message:', error.message);
        }
        throw error;
    }
}

// Function to extract problem ID from URL parameters
function getProblemIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    let problemId = 1; // Default fallback
    
    if (urlParams.has('case')) {
        // Get case problem ID (you might need to map the title to an ID in a real app)
        const caseTitle = urlParams.get('case');
        // This is a simplified approach - in a real app, you'd fetch the ID from the backend
        problemId = getCaseIdFromTitle(caseTitle);
    } else if (urlParams.has('guesstimate')) {
        // Get guesstimate problem ID
        const guessTitle = urlParams.get('guesstimate');
        problemId = getGuessIdFromTitle(guessTitle);
    }
    
    return problemId;
}

// Mock functions to map titles to IDs (in a real app, you'd fetch these from the backend)
function getCaseIdFromTitle(title) {
    const caseMappings = {
        'market-entry-strategy': 1,
        'cost-reduction-analysis': 2
        // Add more mappings as needed
    };
    return caseMappings[title] || 1;
}

function getGuessIdFromTitle(title) {
    const guessMappings = {
        'market-size-estimation': 3,
        'revenue-estimation': 4,
        'cost-structure-analysis': 5
        // Add more mappings as needed
    };
    return guessMappings[title] || 3;
}

document.addEventListener('DOMContentLoaded', () => {
    // API base URL
    const API_URL = 'http://localhost:8000';

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Always redirect to home if clicking on the site icon
    const logoElement = document.querySelector('.logo');
    if (logoElement) {
        logoElement.addEventListener('click', () => {
            if (isLoggedIn) {
                window.location.href = 'home.html';
            }
        });
    }
    
    // If not logged in and not on login page, redirect to login
    if (!isLoggedIn && currentPage !== 'index.html' && currentPage !== '') {
        window.location.href = 'index.html';
    }
    
    // If logged in and on login page, redirect to home
    if (isLoggedIn && (currentPage === 'index.html' || currentPage === '')) {
        window.location.href = 'home.html';
    }
    
    // Toggle between login and signup forms
    const signupLink = document.getElementById('signup-link');
    const loginLink = document.getElementById('login-link');
    const loginBox = document.getElementById('login-box');
    const signupBox = document.getElementById('signup-box');
    
    if (signupLink) {
        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginBox.style.display = 'none';
            signupBox.style.display = 'block';
        });
    }
    
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupBox.style.display = 'none';
            loginBox.style.display = 'block';
        });
    }
    
    // Handle login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorElement = document.getElementById('login-error');
            
            try {
                // Clear previous error
                errorElement.textContent = '';
                console.log(`Attempting login with: ${email}`);
                
                // Format data for the token endpoint (which uses form data)
                const formData = new FormData();
                formData.append('username', email); // API expects 'username' field
                formData.append('password', password);
                
                // Call the token endpoint
                console.log(`Sending request to ${API_URL}/token`);
                const response = await fetch(`${API_URL}/token`, {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Login successful. Token received.');
                    
                    // Store token and user info
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('token', data.access_token);
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userName', data.username);
                    localStorage.setItem('userId', data.user_id);
                    
                    // Redirect to home page
                    window.location.href = 'home.html';
                } else {
                    const error = await response.json();
                    console.error('Login failed:', error);
                    errorElement.textContent = error.detail || 'Invalid email or password';
                }
            } catch (error) {
                console.error('Login error:', error);
                errorElement.textContent = 'An error occurred during login. Please try again.';
            }
        });
    }
    
    // Handle signup form submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('signup-username').value;
            const email = document.getElementById('signup-email').value;
            const firstName = document.getElementById('signup-firstname').value;
            const lastName = document.getElementById('signup-lastname').value;
            const password = document.getElementById('signup-password').value;
            const errorElement = document.getElementById('signup-error');
            
            try {
                // Clear previous error
                errorElement.textContent = '';
                console.log(`Attempting to create user: ${username}, ${email}`);
                
                // Call the users endpoint to create a new user
                const userData = {
                    username: username,
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    password: password
                };
                
                console.log('Signup data:', userData);
                console.log(`Sending request to ${API_URL}/users/`);
                
                const response = await fetch(`${API_URL}/users/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Signup successful:', data);
                    
                    // Show login form with success message
                    signupBox.style.display = 'none';
                    loginBox.style.display = 'block';
                    document.getElementById('login-error').textContent = 'Account created! Please log in.';
                    document.getElementById('login-error').style.color = '#4CAF50';
                } else {
                    const error = await response.json();
                    console.error('Signup failed:', error);
                    errorElement.textContent = error.detail || 'Error creating account. Please try again.';
                }
            } catch (error) {
                console.error('Signup error:', error);
                errorElement.textContent = 'An error occurred during signup. Please try again.';
            }
        });
    }
    
    // Handle solution submission
    const submitSolutionBtn = document.getElementById('submit-solution');
    if (submitSolutionBtn) {
        submitSolutionBtn.addEventListener('click', async () => {
            // Get the solution text
            const solutionText = document.querySelector('.solution-textarea').value;
            if (!solutionText.trim()) {
                alert('Please enter your solution before submitting.');
                return;
            }
            
            // Get problem ID from URL
            const problemId = getProblemIdFromUrl();
            
            // Show loading indicator
            const feedbackContainer = document.querySelector('.feedback-container');
            const loadingIndicator = document.querySelector('.loading-indicator');
            const feedbackContent = document.querySelector('.feedback-content');
            
            feedbackContainer.style.display = 'block';
            loadingIndicator.style.display = 'block';
            feedbackContent.textContent = '';
            
            try {
                // Submit solution and get feedback
                const feedback = await submitSolution(problemId, solutionText);
                
                // Hide loading indicator and show feedback
                loadingIndicator.style.display = 'none';
                feedbackContent.textContent = feedback.feedback_text;
                
                // Still save to localStorage for redundancy
                const currentPage = window.location.pathname.split('/').pop();
                const urlParams = new URLSearchParams(window.location.search);
                let problemTitle = '';
                let problemType = '';
                
                if (currentPage.includes('case-detail') && urlParams.has('case')) {
                    problemTitle = urlParams.get('case');
                    problemType = 'Case Study';
                } else if (currentPage.includes('guesstimate-detail') && urlParams.has('guesstimate')) {
                    problemTitle = urlParams.get('guesstimate');
                    problemType = 'Guesstimate';
                }
                
                // Format the title properly for localStorage
                problemTitle = problemTitle.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
                
                // Save solution and feedback to localStorage
                localStorage.setItem(`solution-${problemType}-${problemTitle}`, solutionText);
                localStorage.setItem(`feedback-${problemType}-${problemTitle}`, feedback.feedback_text);
                
            } catch (error) {
                // Show error message
                console.error('Error in submit handler:', error);
                loadingIndicator.style.display = 'none';
                
                // Create a more user-friendly error message
                let errorMessage = 'Unable to generate feedback.';
                
                if (error && error.message) {
                    errorMessage += ` ${error.message}`;
                } else if (typeof error === 'string') {
                    errorMessage += ` ${error}`;
                } else if (error && typeof error === 'object') {
                    errorMessage += ' Please try again later.';
                    console.error('Detailed error object:', JSON.stringify(error));
                }
                
                feedbackContent.textContent = `Error: ${errorMessage}`;
                feedbackContent.style.color = '#e53e3e';
            }
        });
    }
    
    // Handle logout
    const logoutBtn = document.querySelector('.nav-icons .material-icons:nth-child(2)');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('token');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('userId');
            window.location.href = 'index.html';
        });
    }
    
    // Handle navigation to profile
    const profileBtn = document.querySelector('.nav-icons .material-icons:nth-child(1)');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }
    
    // Load user data in profile page
    const profilePage = document.querySelector('.profile-container');
    if (profilePage) {
        const userName = localStorage.getItem('userName') || 'User';
        const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
        
        document.querySelector('.profile-info h2').textContent = userName;
        document.querySelector('.profile-info p').textContent = userEmail;
    }
    
    // Add click events to cards on homepage
    const cards = document.querySelectorAll('.card');
    if (cards.length) {
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const cardTitle = card.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '-');
                window.location.href = `${cardTitle}.html`;
            });
        });
    }
    
    // Add click events to case study cards to navigate to detailed problem pages
    const caseCards = document.querySelectorAll('.case-card');
    if (caseCards.length) {
        caseCards.forEach(card => {
            card.addEventListener('click', () => {
                const cardTitle = card.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '-');
                const currentPage = window.location.pathname.split('/').pop();
                
                if (currentPage.includes('case-studies')) {
                    window.location.href = `case-detail.html?case=${cardTitle}`;
                } else if (currentPage.includes('guesstimates')) {
                    window.location.href = `guesstimate-detail.html?guesstimate=${cardTitle}`;
                } else if (currentPage.includes('frameworks')) {
                    window.location.href = `framework-detail.html?framework=${cardTitle}`;
                } else if (currentPage.includes('examples')) {
                    window.location.href = `example-detail.html?example=${cardTitle}`;
                }
            });
        });
    }
    
    // Handle problem details page
    const problemContainer = document.querySelector('.problem-container');
    if (problemContainer) {
        // Get the case or guesstimate from URL
        const urlParams = new URLSearchParams(window.location.search);
        let problemTitle = '';
        let problemType = '';
        
        if (urlParams.has('case')) {
            problemTitle = urlParams.get('case');
            problemType = 'Case Study';
        } else if (urlParams.has('guesstimate')) {
            problemTitle = urlParams.get('guesstimate');
            problemType = 'Guesstimate';
        }
        
        if (problemTitle) {
            // Format the title properly
            problemTitle = problemTitle.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            document.querySelector('.problem-statement h2').textContent = problemTitle;
            
            // Save the solution text as the user types
            const solutionTextarea = document.querySelector('.solution-textarea');
            if (solutionTextarea) {
                // Load any saved solution
                const savedSolution = localStorage.getItem(`solution-${problemType}-${problemTitle}`);
                if (savedSolution) {
                    solutionTextarea.value = savedSolution;
                    
                    // Check if there's also saved feedback to display
                    const savedFeedback = localStorage.getItem(`feedback-${problemType}-${problemTitle}`);
                    if (savedFeedback) {
                        const feedbackContainer = document.querySelector('.feedback-container');
                        const feedbackContent = document.querySelector('.feedback-content');
                        
                        feedbackContainer.style.display = 'block';
                        feedbackContent.textContent = savedFeedback;
                    }
                }
                
                // Save solution as user types
                solutionTextarea.addEventListener('input', () => {
                    localStorage.setItem(`solution-${problemType}-${problemTitle}`, solutionTextarea.value);
                });
            }
        }
    }
}); 